// app/screens/reinspection.tsx
// Phase-Q: Reinspection launch screen.
//
// Entry points:
//   - AgendaRepository follow-up items (created by followUpService.ts)
//   - Any screen that has a completed SavedInspection with grade D or open CAPs
//
// This screen:
//   1. Loads the prior inspection from InspectionRepository by id
//   2. Shows facility info, prior grade, prior date, and open CAP count
//   3. Lets the inspector confirm/update the committee and reference
//   4. Pushes to /(tabs)/inspection/categories with:
//        inspectionType = 'follow-up'
//        priorInspectionId = prior inspection id
//      so checklist.tsx activates its differential view automatically.

import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SavedInspection } from '../../src/types';

// ─── Grade badge colours (mirrors pdfService logic) ───────────────────────────────────
const GRADE_COLORS: Record<string, string> = {
  A: '#27ae60',
  B: '#2980b9',
  C: '#f39c12',
  D: '#e74c3c',
};

export default function ReinspectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    priorInspectionId: string;
    facilityId?: string;
    facilityName?: string;
    facilityAddress?: string;
  }>();

  const [prior, setPrior]         = useState<SavedInspection | null>(null);
  const [capCount, setCapCount]   = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Inspector editable fields
  const [reference, setReference]           = useState('');
  const [members, setMembers]               = useState<string[]>([]);
  const [newMember, setNewMember]           = useState('');
  const [writer, setWriter]                 = useState('');

  // ── Load prior inspection on mount ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const id = params.priorInspectionId;
        if (!id) throw new Error('priorInspectionId مانق');

        const saved = await InspectionRepository.getById(id);
        if (!saved) throw new Error('التفتيش السابق غير موجود في قاعدة البيانات');

        const caps = await CorrectiveActionRepository.getByInspection(id);
        const openCaps = caps.filter(c => c.status !== 'closed');

        setPrior(saved);
        setCapCount(openCaps.length);
        // Pre-fill writer if available
        if (saved.inspectorName) setWriter(saved.inspectorName);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.priorInspectionId]);

  // ── Member helpers ──────────────────────────────────────────────────────
  const addMember = () => {
    const t = newMember.trim();
    if (t) { setMembers(prev => [...prev, t]); setNewMember(''); }
  };
  const removeMember = (i: number) =>
    setMembers(prev => prev.filter((_, idx) => idx !== i));

  // ── Launch reinspection ──────────────────────────────────────────────
  const handleLaunch = () => {
    if (!prior) return;

    if (!writer.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم المحرر');
      return;
    }
    if (members.length === 0) {
      Alert.alert('تنبيه', 'الرجاء إضافة عضو واحد على الأقل في اللجنة');
      return;
    }

    router.push({
      pathname: '/(tabs)/inspection/categories',
      params: {
        facilityId:       prior.facilityId,
        facilityName:     prior.facilityName,
        facilityAddress:  prior.facilityAddress,
        activity:         prior.activity ?? '',
        cause:            'followup',
        inspectionType:   'follow-up',
        priorInspectionId: prior.id,
        reference,
        committeeMembers: JSON.stringify(members),
        writer,
      },
    });
  };

  // ── Render states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>جاري تحميل بيانات التفتيش...</Text>
      </SafeAreaView>
    );
  }

  if (error || !prior) {
    return (
      <SafeAreaView style={styles.centered}>
        <FontAwesome name="exclamation-circle" size={40} color={Colors.danger} />
        <Text style={styles.errorText}>{error ?? 'تعذّر تحميل التفتيش السابق'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>العودة</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const gradeColor = GRADE_COLORS[prior.grade ?? ''] ?? Colors.textSecondary;
  const priorDateFormatted = prior.date
    ? new Date(prior.date).toLocaleDateString('ar-DZ', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          {/* RTL: arrow-left points toward the start of the reading direction = "go back" */}
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إطلاق تفتيش متابعة</Text>
        </View>

        {/* ── Prior inspection summary card ────────────────────────────────── */}
        <View style={styles.summaryCard}>
          <Text style={styles.facilityName}>{prior.facilityName}</Text>
          <Text style={styles.facilityAddress}>{prior.facilityAddress}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>التفتيش السابق</Text>
              <Text style={styles.summaryValue}>{priorDateFormatted}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>الدرجة</Text>
              <Text style={[styles.gradeBadge, { color: gradeColor, borderColor: gradeColor }]}>
                {prior.grade ?? '—'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>إجراءات مفتوحة</Text>
              <Text style={[
                styles.summaryValue,
                capCount > 0 && { color: Colors.danger, fontWeight: '700' },
              ]}>
                {capCount}
              </Text>
            </View>
          </View>

          {/* Trigger reason banner */}
          <View style={styles.triggerBanner}>
            <FontAwesome name="info-circle" size={13} color="#2980b9" />
            <Text style={styles.triggerText}>
              {prior.grade === 'D' && capCount > 0
                ? `تفتيش متابعة إلزامي — درجة D و${capCount} إجراء تصحيحي مفتوح`
                : prior.grade === 'D'
                  ? 'تفتيش متابعة إلزامي — الدرجة السابقة D'
                  : `تفتيش متابعة — ${capCount} إجراء تصحيحي مفتوح`}
            </Text>
          </View>
        </View>

        {/* ── Inspector fields ────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>بيانات التفتيش الجديد</Text>

        <Text style={styles.label}>المحرر (حامل الجهاز)</Text>
        <TextInput
          style={styles.input}
          value={writer}
          onChangeText={setWriter}
          placeholder="الاسم الكامل"
          placeholderTextColor={Colors.textTertiary}
          textAlign="right"
        />

        <Text style={styles.label}>مرجع المستند (اختياري)</Text>
        <TextInput
          style={styles.input}
          value={reference}
          onChangeText={setReference}
          placeholder="رقم الإشعار / الإنذار / ..."
          placeholderTextColor={Colors.textTertiary}
          textAlign="right"
        />

        <Text style={styles.label}>أعضاء اللجنة</Text>
        <View style={styles.memberRow}>
          <TextInput
            style={[styles.input, styles.memberInput]}
            value={newMember}
            onChangeText={setNewMember}
            placeholder="اسم العضو"
            placeholderTextColor={Colors.textTertiary}
            textAlign="right"
            onSubmitEditing={addMember}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={addMember}>
            <FontAwesome name="plus" size={18} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Empty member list hint */}
        {members.length === 0 && (
          <Text style={styles.memberEmptyHint}>أدخل اسم عضو (مطلوب عضو واحد على الأقل)</Text>
        )}

        {members.map((m, i) => (
          <View key={i} style={styles.memberItem}>
            <Text style={styles.memberText}>{m}</Text>
            <TouchableOpacity
              onPress={() => removeMember(i)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome name="trash" size={16} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        {/* ── Launch button ────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.launchButton} onPress={handleLaunch}>
          <FontAwesome name="search" size={16} color={Colors.textInverse} />
          <Text style={styles.launchButtonText}>إطلاق تفتيش المتابعة</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },
  centered:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  content:          { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },

  // Summary card
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  facilityAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryItem:  { alignItems: 'center', flex: 1 },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4, textAlign: 'center' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  gradeBadge: {
    fontSize: 18,
    fontWeight: '800',
    borderWidth: 2,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
    textAlign: 'center',
  },

  // Trigger banner
  triggerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: '#e8f4fd',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderRightWidth: 3,
    borderRightColor: '#2980b9',
  },
  triggerText: {
    flex: 1,
    fontSize: 12,
    color: '#1a5276',
    textAlign: 'right',
    lineHeight: 18,
  },

  // Form fields
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md - 2,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  memberRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  memberInput: { flex: 1, marginBottom: 0 },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40, height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberEmptyHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceOffset,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md - 2,
    marginBottom: Spacing.xs,
  },
  memberText: { fontSize: 14, color: Colors.textPrimary, textAlign: 'right', flex: 1 },

  // Launch button
  launchButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  launchButtonText: { color: Colors.textInverse, fontSize: 16, fontWeight: 'bold' },

  // Error / loading
  loadingText: { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  errorText:   { fontSize: 14, color: Colors.danger, textAlign: 'center', marginTop: Spacing.sm },
  backButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceOffset,
    borderRadius: Radius.md,
  },
  backButtonText: { fontSize: 14, color: Colors.textPrimary },
});
