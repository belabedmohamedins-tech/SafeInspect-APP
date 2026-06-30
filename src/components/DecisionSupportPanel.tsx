// src/components/DecisionSupportPanel.tsx
// Phase 6 — Decision Support Panel
//
// Shown at the bottom of the checklist once every item is evaluated.
// Displays the suggested escalation tier and lets the inspector override it
// with a mandatory reason.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SuggestedDecision } from '../services/decisionSupport';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  decision: SuggestedDecision;
  /**
   * Called whenever the override reason changes (or is cleared).
   * Pass the value up to the checklist screen so it can be saved
   * to the inspection record.
   */
  onOverrideReasonChange: (reason: string | undefined) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DecisionSupportPanel({
  decision,
  onOverrideReasonChange,
}: Props) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [reason, setReason] = useState('');

  const toggleOverride = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (overrideOpen) {
      // closing — clear reason
      setReason('');
      onOverrideReasonChange(undefined);
    }
    setOverrideOpen((v) => !v);
  };

  const handleReasonChange = (text: string) => {
    setReason(text);
    onOverrideReasonChange(text.trim() || undefined);
  };

  const tierBg = decision.tierColour + '22'; // 13 % opacity background
  const tierBorder = decision.tierColour + '88'; // 53 % opacity border

  return (
    <View style={[styles.container, { borderColor: tierBorder, backgroundColor: tierBg }]}>
      {/* ── Header ── */}
      <Text style={styles.sectionTitle}>{'🔍 اقتراح الإجراء'}</Text>

      {/* ── Tier badge ── */}
      <View style={[styles.tierBadge, { backgroundColor: decision.tierColour }]}>
        <Text style={styles.tierBadgeText}>{decision.tierLabel}</Text>
      </View>

      {/* ── Article reference ── */}
      {decision.articleRef !== '—' && (
        <Text style={styles.articleRef}>{decision.articleRef}</Text>
      )}

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        <StatChip
          label={'مخالفات'}
          value={decision.nonCompliantCount}
          colour={'#a13544'}
        />
        {decision.repeatViolationCount > 0 && (
          <StatChip
            label={'مخالفات متكررة'}
            value={decision.repeatViolationCount}
            colour={'#a12c7b'}
          />
        )}
        <StatChip
          label={'بنود مقيَّمة'}
          value={decision.evaluatedCount}
          colour={'#437a22'}
        />
      </View>

      {/* ── Override toggle ── */}
      <TouchableOpacity
        style={styles.overrideToggle}
        onPress={toggleOverride}
        accessibilityRole="button"
        accessibilityLabel={overrideOpen ? 'إلغاء التجاوز' : 'تجاوز الاقتراح'}
      >
        <Text style={styles.overrideToggleText}>
          {overrideOpen ? '✕ إلغاء التجاوز' : '✏️ تجاوز الاقتراح'}
        </Text>
      </TouchableOpacity>

      {/* ── Override reason input ── */}
      {overrideOpen && (
        <View style={styles.overrideBox}>
          <Text style={styles.overrideLabel}>
            {'سبب التجاوز'}
            {decision.overrideRequired && (
              <Text style={styles.required}>{' *مطلوب'}</Text>
            )}
          </Text>
          <TextInput
            style={styles.overrideInput}
            value={reason}
            onChangeText={handleReasonChange}
            placeholder={'اذكر سبب الانحراف عن الاقتراح…'}
            placeholderTextColor={'#9a9a9a'}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            accessibilityLabel="سبب تجاوز الاقتراح"
          />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component
// ─────────────────────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour: string;
}) {
  return (
    <View style={[styles.chip, { borderColor: colour + '66' }]}>
      <Text style={[styles.chipValue, { color: colour }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#28251d',
    marginBottom: 10,
    textAlign: 'right',
  },
  tierBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  tierBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  articleRef: {
    fontSize: 12,
    color: '#7a7974',
    textAlign: 'right',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 70,
  },
  chipValue: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  chipLabel: {
    fontSize: 11,
    color: '#7a7974',
    marginTop: 2,
    textAlign: 'center',
  },
  overrideToggle: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d1ca',
    marginBottom: 4,
  },
  overrideToggleText: {
    fontSize: 13,
    color: '#28251d',
    fontWeight: '600',
  },
  overrideBox: {
    marginTop: 8,
  },
  overrideLabel: {
    fontSize: 13,
    color: '#28251d',
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 6,
  },
  required: {
    color: '#a13544',
    fontSize: 12,
  },
  overrideInput: {
    borderWidth: 1,
    borderColor: '#d4d1ca',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#28251d',
    backgroundColor: '#fff',
    minHeight: 80,
    textAlign: 'right',
  },
});
