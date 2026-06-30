/**
 * DecisionSupportPanel — Phase 6
 * --------------------------------
 * RTL card displayed at the bottom of the checklist / review screen.
 * Shows the auto-suggested administrative action, urgency, legal basis,
 * rationale, and an optional override-reason input.
 *
 * Props:
 *   suggestion            — output of suggestDecision()
 *   overrideReason        — current value of escalationOverrideReason
 *   onOverrideReasonChange — callback to update parent state
 *   disabled              — hides override input (e.g. on a saved/locked report)
 *
 * NOTE: setLayoutAnimationEnabledExperimental is a no-op in the New Architecture.
 * LayoutAnimation works natively without any UIManager bootstrap call.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { DecisionSuggestion, Urgency } from '../services/decisionSupport';

// ─── Urgency theme ────────────────────────────────────────────────────────────
const URGENCY_THEME: Record<Urgency, { bg: string; border: string; text: string; chip: string; chipText: string }> = {
  low:      { bg: '#f0faf4', border: '#a5d6a7', text: '#1b5e20', chip: '#27ae60', chipText: '#fff' },
  medium:   { bg: '#fffde7', border: '#ffe082', text: '#f57f17', chip: '#f39c12', chipText: '#fff' },
  high:     { bg: '#fff3e0', border: '#ffcc80', text: '#e65100', chip: '#e67e22', chipText: '#fff' },
  critical: { bg: '#fce4ec', border: '#ef9a9a', text: '#b71c1c', chip: '#e74c3c', chipText: '#fff' },
};

const URGENCY_LABEL: Record<Urgency, string> = {
  low:      'منخفضة',
  medium:   'متوسطة',
  high:     'عالية',
  critical: 'حرجة — تدخل فوري',
};

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  suggestion: DecisionSuggestion;
  overrideReason?: string;
  onOverrideReasonChange?: (value: string) => void;
  disabled?: boolean;
}

export const DecisionSupportPanel: React.FC<Props> = ({
  suggestion,
  overrideReason = '',
  onOverrideReasonChange,
  disabled = false,
}) => {
  const [expanded, setExpanded] = useState(true);
  const theme = URGENCY_THEME[suggestion.urgency];

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(e => !e);
  };

  return (
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.bg }]}>
      {/* ── Header ── */}
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.75}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'إخفاء لوحة دعم القرار' : 'إظهار لوحة دعم القرار'}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>💡 دعم القرار الإداري</Text>
          <View style={[styles.urgencyChip, { backgroundColor: theme.chip }]}>
            <Text style={[styles.urgencyChipText, { color: theme.chipText }]}>
              أولوية: {URGENCY_LABEL[suggestion.urgency]}
            </Text>
          </View>
        </View>
        <Text style={[styles.chevron, { color: theme.text }]}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {/* ── Action ── */}
          <View style={[styles.actionRow, { borderColor: theme.border }]}>
            <Text style={styles.actionLabel}>الإجراء المقترح</Text>
            <Text style={[styles.actionValue, { color: theme.text }]}>{suggestion.actionLabel}</Text>
          </View>

          {/* ── Rationale ── */}
          <Text style={[styles.rationale, { color: theme.text }]}>{suggestion.rationale}</Text>

          {/* ── Reasons list ── */}
          {suggestion.reasons.length > 0 && (
            <View style={styles.reasonsBlock}>
              {suggestion.reasons.map((r, i) => (
                <View key={i} style={styles.reasonRow}>
                  <Text style={[styles.bullet, { color: theme.text }]}>•</Text>
                  <Text style={[styles.reasonText, { color: theme.text }]}>{r}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Legal basis ── */}
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>⚖️ الأساس القانوني:</Text>
            <Text style={styles.legalValue}>{suggestion.legalBasis}</Text>
          </View>
          {suggestion.additionalRefs.map((ref, i) => (
            <Text key={i} style={styles.additionalRef}>— {ref}</Text>
          ))}

          {/* ── Next visit ── */}
          <Text style={styles.nextVisit}>
            📅 الزيارة القادمة المقترحة: خلال {suggestion.nextVisitDays} يوم
          </Text>

          {/* ── Override reason (editable unless disabled) ── */}
          {!disabled && (
            <View style={styles.overrideBlock}>
              <Text style={styles.overrideLabel}>سبب تعديل / تجاوز المقترح (اختياري)</Text>
              <TextInput
                style={styles.overrideInput}
                value={overrideReason}
                onChangeText={onOverrideReasonChange}
                placeholder="مثال: تم تسوية المخالفة ميدانياً بإجراء فوري…"
                placeholderTextColor="#b0bec5"
                multiline
                numberOfLines={3}
                textAlign="right"
                textAlignVertical="top"
                accessibilityLabel="سبب تجاوز القرار المقترح"
              />
            </View>
          )}

          {/* ── Show locked override if disabled and reason present ── */}
          {disabled && !!overrideReason && (
            <View style={styles.overrideBlock}>
              <Text style={styles.overrideLabel}>سبب التجاوز المسجّل</Text>
              <View style={styles.overrideLocked}>
                <Text style={styles.overrideLockedText}>{overrideReason}</Text>
              </View>
            </View>
          )}

          {/* ── Critical override notice ── */}
          {suggestion.criticalOverride && (
            <View style={styles.overrideNotice}>
              <Text style={styles.overrideNoticeText}>
                ⚠️ تم تطبيق قاعدة التجاوز الحرج — التصنيف أسوأ من الدرجة الخام للنتيجة الحسابية.
              </Text>
            </View>
          )}

          <Text style={styles.disclaimer}>
            هذا الاقتراح أداة مساعدة فقط. القرار القانوني النهائي يعود حصراً للمفتش المختص
            وفق أحكام القانون 03-10 والمرسوم التنفيذي 06-198.
          </Text>
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  urgencyChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgencyChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 12,
    marginLeft: 8,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    gap: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#607d8b',
    fontWeight: '600',
  },
  actionValue: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    flexShrink: 1,
  },
  rationale: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  reasonsBlock: {
    gap: 4,
    paddingRight: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 20,
    flex: 1,
    textAlign: 'right',
  },
  legalRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  legalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#455a64',
  },
  legalValue: {
    fontSize: 12,
    color: '#37474f',
  },
  additionalRef: {
    fontSize: 11,
    color: '#78909c',
    textAlign: 'right',
    paddingRight: 14,
  },
  nextVisit: {
    fontSize: 12,
    color: '#546e7a',
    textAlign: 'right',
  },
  overrideBlock: {
    marginTop: 4,
    gap: 4,
  },
  overrideLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#455a64',
    textAlign: 'right',
  },
  overrideInput: {
    borderWidth: 1,
    borderColor: '#b0bec5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#263238',
    backgroundColor: 'rgba(255,255,255,0.8)',
    minHeight: 72,
    ...Platform.select({ android: {} }),
  },
  overrideLocked: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#cfd8dc',
  },
  overrideLockedText: {
    fontSize: 13,
    color: '#455a64',
    textAlign: 'right',
    lineHeight: 20,
  },
  overrideNotice: {
    backgroundColor: 'rgba(231,76,60,0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  overrideNoticeText: {
    fontSize: 12,
    color: '#c0392b',
    textAlign: 'right',
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 10,
    color: '#90a4ae',
    textAlign: 'right',
    lineHeight: 16,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default DecisionSupportPanel;
