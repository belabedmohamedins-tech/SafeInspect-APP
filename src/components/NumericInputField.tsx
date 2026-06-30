/**
 * NumericInputField
 * -----------------
 * Renders a stepper (− / +) with a manual TextInput for quantitative criteria.
 * Appears on checklist cards when item.numericField is defined.
 *
 * Phase 7: deriveNumericCompliance and NumericComplianceState are now
 * imported from src/utils/numericUtils.ts (shared location).
 *
 * Props:
 *   spec       — NumericFieldSpec from the criterion definition
 *   value      — current numericValue on the InspectionItem (undefined = not set)
 *   onChange   — callback(value: number) — parent merges into item state
 *   disabled   — greys out the control when true
 *
 * Live badge logic:
 *   compliant        — value within [min, max]
 *   warning          — value outside [min, max] but within warning zone
 *   non-compliant    — value outside all zones
 *   not-measured     — value is undefined
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { NumericFieldSpec } from '../types';
import {
  deriveNumericCompliance,
  NumericComplianceState,
} from '../utils/numericUtils';

// ─── Re-export so existing callers that import from this file continue to work ─
export type { NumericComplianceState };
export { deriveNumericCompliance };

// ─── Badge colours ─────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<NumericComplianceState, { bg: string; text: string; border: string }> = {
  compliant:       { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  warning:         { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' },
  'non-compliant': { bg: '#fce4ec', text: '#c62828', border: '#ef9a9a' },
  'not-measured':  { bg: '#f5f5f5', text: '#757575', border: '#e0e0e0' },
};

const BADGE_LABELS_AR: Record<NumericComplianceState, string> = {
  compliant:       'مطابق',
  warning:         'تحذير',
  'non-compliant': 'غير مطابق',
  'not-measured':  'لم يُقس',
};

// ─── Component ─────────────────────────────────────────────────────────────────
interface Props {
  spec: NumericFieldSpec;
  value: number | undefined;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const NumericInputField: React.FC<Props> = ({ spec, value, onChange, disabled = false }) => {
  const step = spec.step ?? 0.1;

  const [text, setText] = useState<string>(
    value !== undefined ? String(value) : '',
  );

  const complianceState = deriveNumericCompliance(value, spec);
  const badge = BADGE_COLORS[complianceState];

  const commit = useCallback(
    (raw: string) => {
      const parsed = parseFloat(raw.replace(',', '.'));
      if (!isNaN(parsed)) {
        onChange(parsed);
        setText(String(parsed));
      } else {
        setText(value !== undefined ? String(value) : '');
      }
    },
    [onChange, value],
  );

  const handleDecrement = () => {
    const current = value ?? 0;
    const next = parseFloat((current - step).toFixed(10));
    onChange(next);
    setText(String(next));
  };

  const handleIncrement = () => {
    const current = value ?? 0;
    const next = parseFloat((current + step).toFixed(10));
    onChange(next);
    setText(String(next));
  };

  return (
    <View style={styles.wrapper}>
      {/* Label */}
      <Text style={styles.label}>{spec.labelAr}</Text>

      {/* Stepper row */}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={disabled}
          style={[styles.stepBtn, disabled && styles.disabled]}
          accessibilityLabel={`تقليل ${spec.labelAr}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            { borderColor: badge.border },
            disabled && styles.disabled,
          ]}
          value={text}
          onChangeText={setText}
          onBlur={() => commit(text)}
          onSubmitEditing={() => commit(text)}
          keyboardType="decimal-pad"
          returnKeyType="done"
          editable={!disabled}
          selectTextOnFocus
          accessibilityLabel={spec.labelAr}
          testID={`numeric-input-${spec.unit}`}
        />

        <Text style={styles.unit}>{spec.unit}</Text>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={disabled}
          style={[styles.stepBtn, disabled && styles.disabled]}
          accessibilityLabel={`زيادة ${spec.labelAr}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>

        {/* Compliance badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: badge.bg, borderColor: badge.border },
          ]}
        >
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {BADGE_LABELS_AR[complianceState]}
          </Text>
        </View>
      </View>

      {/* Range hint */}
      {(spec.min !== undefined || spec.max !== undefined) && (
        <Text style={styles.rangeHint}>
          {spec.lowerLimit
            ? `الحد الأدنى: ${spec.min} ${spec.unit}`
            : spec.upperLimit
            ? `الحد الأقصى: ${spec.max} ${spec.unit}`
            : `النطاق المقبول: ${spec.min ?? '—'} – ${spec.max ?? '—'} ${spec.unit}`}
        </Text>
      )}
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#37474f',
    textAlign: 'right',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eceff1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#455a64',
    lineHeight: 22,
  },
  input: {
    width: 72,
    height: 36,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#263238',
    backgroundColor: '#fff',
    ...Platform.select({ android: { paddingVertical: 4 } }),
  },
  unit: {
    fontSize: 13,
    color: '#607d8b',
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'left',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rangeHint: {
    fontSize: 11,
    color: '#90a4ae',
    textAlign: 'right',
    marginTop: 4,
  },
  disabled: {
    opacity: 0.45,
  },
});

export default NumericInputField;
