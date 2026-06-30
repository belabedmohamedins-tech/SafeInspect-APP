// src/components/DifferentialBanner.tsx
//
// Phase-3: Collapsible "متابعة الزيارة السابقة" banner.
//
// Mount this at the TOP of the follow-up checklist screen, above the axis
// list. It renders nothing when inspectionType !== 'follow-up' or when
// there is no diff data yet.
//
// Usage:
//   <DifferentialBanner
//     diff={diffView}          // DifferentialView | null
//     priorDate={priorDate}    // ISO date string of prior inspection
//   />

import React, { useState } from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DifferentialView } from '../services/differentialView';
import { formatDateLong } from '../utils/dateUtils';

// NOTE: setLayoutAnimationEnabledExperimental is a no-op in the New Architecture.
// LayoutAnimation works natively without any UIManager bootstrap call.

interface Props {
  diff: DifferentialView | null;
  /** ISO date string of the prior inspection (shown in header). */
  priorDate?: string;
}

export function DifferentialBanner({ diff, priorDate }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (!diff || (!diff.resolved.length && !diff.stillFailing.length)) return null;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  };

  const dateLabel = priorDate ? formatDateLong(priorDate) : 'الزيارة السابقة';

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'طي قسم المتابعة' : 'توسيع قسم المتابعة'}
      >
        <Text style={styles.headerTitle}>متابعة الزيارة السابقة</Text>
        <Text style={styles.headerDate}>{dateLabel}</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {/* ── Counter pills ──────────────────────────────────────────── */}
          <View style={styles.pills}>
            <View style={[styles.pill, styles.pillGreen]}>
              <Text style={styles.pillText}>✓ تم التصحيح: {diff.resolved.length}</Text>
            </View>
            <View style={[styles.pill, styles.pillRed]}>
              <Text style={styles.pillText}>⚠ لا يزال غير مطابق: {diff.stillFailing.length}</Text>
            </View>
            {diff.newViolations.length > 0 && (
              <View style={[styles.pill, styles.pillOrange]}>
                <Text style={styles.pillText}>🆕 جديد: {diff.newViolations.length}</Text>
              </View>
            )}
          </View>

          {/* ── Still-failing list ─────────────────────────────────────── */}
          {diff.stillFailing.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠ مخالفات لم تُعالَج</Text>
              {diff.stillFailing.map(e => (
                <View key={e.item.id} style={styles.rowFailing}>
                  <Text style={styles.rowText} numberOfLines={2}>
                    {e.item.criteria}
                  </Text>
                  <Text style={styles.severityBadge}>{severityLabel(e.item.severity)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Resolved list ──────────────────────────────────────────── */}
          {diff.resolved.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✓ تم التصحيح</Text>
              {diff.resolved.map(e => (
                <View key={e.item.id} style={styles.rowResolved}>
                  <Text style={[styles.rowText, styles.rowTextResolved]} numberOfLines={2}>
                    {e.item.criteria}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Escalation hint (3.6) ─────────────────────────────────── */}
          {diff.hasUnresolvedPriorViolations && (
            <View style={styles.escalationHint}>
              <Text style={styles.escalationText}>
                💡 يُقترح اتخاذ إجراء تصعيدي — لا تزال هناك مخالفات من الزيارة السابقة لم تُصحَّح.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function severityLabel(sev?: string): string {
  switch (sev) {
    case 'high':   return 'عالية';
    case 'medium': return 'متوسطة';
    case 'low':    return 'منخفضة';
    default:       return '';
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2980b9',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2980b9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  headerDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'right',
  },
  chevron: {
    color: '#fff',
    fontSize: 12,
    marginRight: 4,
  },
  body: {
    padding: 12,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillGreen:  { backgroundColor: '#d4edda' },
  pillRed:    { backgroundColor: '#f8d7da' },
  pillOrange: { backgroundColor: '#fff3cd' },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'right',
  },
  rowFailing: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    borderRightWidth: 3,
    borderRightColor: '#e74c3c',
  },
  rowResolved: {
    backgroundColor: '#f0faf4',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    borderRightWidth: 3,
    borderRightColor: '#27ae60',
  },
  rowText: {
    flex: 1,
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'right',
  },
  rowTextResolved: {
    color: '#1e7e3a',
  },
  severityBadge: {
    fontSize: 11,
    color: '#e74c3c',
    fontWeight: '700',
    marginRight: 6,
  },
  escalationHint: {
    marginTop: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    padding: 10,
    borderRightWidth: 3,
    borderRightColor: '#f39c12',
  },
  escalationText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'right',
    fontWeight: '600',
  },
});
