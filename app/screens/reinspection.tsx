// app/screens/reinspection.tsx
// Phase Q-4: Reinspection / Follow-up launcher screen.
//
// Shows all pending follow-up agenda items for the current inspector.
// Tapping one launches a follow-up inspection pre-filled with:
//   - facilityId, facilityName, facilityAddress (from AgendaItem)
//   - inspectionType = 'follow-up'
//   - priorInspectionId = most recent completed inspection for that facility
//
// The backend that auto-creates these agenda items is followUpService.ts
// (called by InspectionRepository.save on grade D or open CAP items).

import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../../constants';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { AgendaItem } from '../../src/types';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Extract grade from the agenda note string, e.g. "... درجة D ..." → "D" */
function extractGrade(notes: string): string | null {
  const match = notes.match(/درجة ([A-D])/);
  return match ? match[1] : null;
}

/** Format YYYY-MM-DD to Arabic locale date string */
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Grade → background colour for the badge */
const GRADE_COLORS: Record<string, string> = {
  A: '#27ae60',
  B: '#2980b9',
  C: '#e67e22',
  D: '#c0392b',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReinspectionScreen() {
  const router = useRouter();
  const [items, setItems]     = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const all = await AgendaRepository.getAll();
      // Only show pending follow-up items (auto-created by followUpService)
      const pending = all.filter(
        item =>
          item.status === 'pending' &&
          item.notes.includes('[follow-up:')
      );
      // Sort ascending by date (earliest follow-up first)
      pending.sort((a, b) => a.date.localeCompare(b.date));
      setItems(pending);
    } catch (err) {
      console.error('[Reinspection] Failed to load agenda items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleLaunch = useCallback(async (agendaItem: AgendaItem) => {
    // Resolve the most recent completed inspection for this facility
    // so checklist.tsx can build the differential view.
    let priorInspectionId: string | undefined;
    try {
      const inspections = await InspectionRepository.getAll();
      const completed = inspections
        .filter(
          i =>
            i.facilityId === agendaItem.facilityId &&
            i.status === 'completed'
        )
        .sort((a, b) => b.date.localeCompare(a.date));
      priorInspectionId = completed[0]?.id;
    } catch (err) {
      console.warn('[Reinspection] Could not resolve priorInspectionId:', err);
    }

    router.push({
      pathname: '/(tabs)/inspection/start',
      params: {
        facilityId:       agendaItem.facilityId,
        facilityName:     agendaItem.facilityName,
        facilityAddress:  agendaItem.facilityAddress ?? '',
        inspectionType:   'follow-up',
        cause:            'followup',
        agendaId:         agendaItem.id,
        ...(priorInspectionId ? { priorInspectionId } : {}),
      },
    });
  }, [router]);

  // ── Render helpers ───────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: AgendaItem }) => {
    const grade      = extractGrade(item.notes);
    const gradeColor = grade ? (GRADE_COLORS[grade] ?? Colors.warning) : Colors.warning;
    const isOverdue  = item.date < new Date().toISOString().split('T')[0];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleLaunch(item)}
        activeOpacity={0.75}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{grade ?? '?'}</Text>
          </View>
          <Text style={styles.facilityName} numberOfLines={1}>
            {item.facilityName}
          </Text>
          {isOverdue && (
            <View style={styles.overduePill}>
              <Text style={styles.overdueText}>متأخر</Text>
            </View>
          )}
        </View>

        {/* Address */}
        {!!item.facilityAddress && (
          <View style={styles.metaRow}>
            <FontAwesome name="map-marker" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.facilityAddress}
            </Text>
          </View>
        )}

        {/* Scheduled date */}
        <View style={styles.metaRow}>
          <FontAwesome
            name="calendar"
            size={12}
            color={isOverdue ? Colors.danger : Colors.textSecondary}
          />
          <Text style={[styles.metaText, isOverdue && styles.overdueDate]}>
            {formatDate(item.date)}
          </Text>
        </View>

        {/* Reason */}
        <Text style={styles.reason} numberOfLines={2}>
          {item.notes.replace(/\[follow-up:[^\]]+\]/, '').trim()}
        </Text>

        {/* CTA */}
        <View style={styles.ctaRow}>
          <FontAwesome name="play-circle" size={14} color={Colors.primary} />
          <Text style={styles.ctaText}>بدء التفتيش التتبعي</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <FontAwesome name="check-circle" size={52} color={Colors.success} />
      <Text style={styles.emptyTitle}>لا توجد متابعات معلقة</Text>
      <Text style={styles.emptyBody}>
        ستظهر هنا عمليات التفتيش التتبعية المقررة تلقائياً عند اكتمال
        تفتيش بدرجة D أو بإجراءات تصحيحية مفتوحة.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome name="arrow-right" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التفتيش التتبعي</Text>
        <TouchableOpacity
          onPress={loadItems}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome name="refresh" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        عمليات المتابعة المقررة تلقائياً بعد التفتيشات عالية الخطورة
      </Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            items.length === 0 ? styles.emptyContainer : styles.listContent
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  gradeBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  facilityName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  overduePill: {
    backgroundColor: '#fdecea',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'flex-end',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  overdueDate: {
    color: Colors.danger,
    fontWeight: '600',
  },
  reason: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});
