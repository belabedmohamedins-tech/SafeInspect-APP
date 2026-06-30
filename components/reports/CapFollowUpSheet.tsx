// components/reports/CapFollowUpSheet.tsx
// Phase-11: animated bottom sheet showing CAP deadlines for non-compliant items
import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants';
import { exportNonConformityNoticePDF } from '../../src/services/pdfService';
import { InspectionItem, SavedInspection, Severity } from '../../src/types';

// ── Deadline rules (days to resolve by severity) ──────────────────────────────
const DEADLINE_DAYS: Record<Severity, number> = {
  high:   15,
  medium: 30,
  low:    60,
};

const SEVERITY_META: Record<Severity, { label: string; bg: string; fg: string }> = {
  high:   { label: 'خطير',   bg: '#ffebee', fg: '#c62828' },
  medium: { label: 'متوسط',  bg: '#fff3e0', fg: '#e65100' },
  low:    { label: 'بسيط',   bg: '#e8f5e9', fg: '#2e7d32' },
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Single deadline row ───────────────────────────────────────────────────────
function DeadlineRow({ item, inspectionDate }: { item: InspectionItem; inspectionDate: string }) {
  const sev    = (item.severity ?? 'medium') as Severity;
  const meta   = SEVERITY_META[sev];
  const days   = DEADLINE_DAYS[sev];
  const deadline = addDays(inspectionDate, days);

  return (
    <View style={rowStyles.container}>
      {/* Severity chip */}
      <View style={[rowStyles.sevChip, { backgroundColor: meta.bg }]}>
        <Text style={[rowStyles.sevText, { color: meta.fg }]}>{meta.label}</Text>
        <Text style={[rowStyles.daysText, { color: meta.fg }]}>{days}د</Text>
      </View>

      {/* Criteria + legal ref */}
      <View style={rowStyles.body}>
        <Text style={rowStyles.criteria} numberOfLines={2}>{item.criteria}</Text>
        {!!item.legalReference && (
          <Text style={rowStyles.legal} numberOfLines={1}>{item.legalReference}</Text>
        )}
      </View>

      {/* Deadline date */}
      <View style={rowStyles.dateBlock}>
        <FontAwesome name="calendar" size={11} color={meta.fg} />
        <Text style={[rowStyles.dateText, { color: meta.fg }]}>{deadline}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  sevChip: {
    alignItems:  'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical:   5,
    minWidth: 46,
  },
  sevText:  { fontSize: 11, fontWeight: '700' },
  daysText: { fontSize: 10, marginTop: 2 },
  body:     { flex: 1 },
  criteria: { fontSize: 13, color: '#1a1a1a', fontWeight: '500', lineHeight: 18 },
  legal:    { fontSize: 11, color: '#888', marginTop: 2 },
  dateBlock:{ alignItems: 'flex-end', gap: 3, minWidth: 90 },
  dateText: { fontSize: 10, fontWeight: '600', textAlign: 'right' },
});

// ── Sheet props ───────────────────────────────────────────────────────────────
export interface CapFollowUpSheetProps {
  inspection: SavedInspection | null;
  visible: boolean;
  onClose: () => void;
}

const SHEET_HEIGHT = 520;
const SPRING_CONFIG = { damping: 22, stiffness: 220 };

export default function CapFollowUpSheet({
  inspection,
  visible,
  onClose,
}: CapFollowUpSheetProps) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const opacity    = useSharedValue(0);

  const animateIn = useCallback(() => {
    opacity.value    = withTiming(1,  { duration: 180 });
    translateY.value = withSpring(0,  SPRING_CONFIG);
  }, [opacity, translateY]);

  const animateOut = useCallback((cb: () => void) => {
    opacity.value    = withTiming(0, { duration: 180 });
    translateY.value = withSpring(SHEET_HEIGHT, SPRING_CONFIG, () => runOnJS(cb)());
  }, [opacity, translateY]);

  useEffect(() => {
    if (visible) {
      translateY.value = SHEET_HEIGHT;   // reset before animating in
      animateIn();
    }
  }, [visible, animateIn, translateY]);

  const handleClose = () => animateOut(onClose);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!inspection) return null;

  const violations = inspection.items.filter(
    i => i.complianceStatus === 'non-compliant',
  );

  // Sort: high → medium → low
  const sorted = [...violations].sort((a, b) => {
    const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.severity ?? 'medium'] ?? 1) - (order[b.severity ?? 'medium'] ?? 1);
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[sheetStyles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View style={[sheetStyles.sheet, sheetStyle]}>
        {/* Handle */}
        <View style={sheetStyles.handle} />

        {/* Header */}
        <View style={sheetStyles.header}>
          <View style={sheetStyles.headerLeft}>
            <FontAwesome name="exclamation-triangle" size={16} color="#e65100" />
            <Text style={sheetStyles.headerTitle} numberOfLines={1}>
              {inspection.facilityName}
            </Text>
          </View>
          <View style={sheetStyles.violationBadge}>
            <Text style={sheetStyles.violationBadgeText}>
              {violations.length} مخالفة
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={sheetStyles.closeBtn}>
            <FontAwesome name="times" size={18} color={Colors.textTertiary ?? '#999'} />
          </TouchableOpacity>
        </View>

        {/* Deadline legend */}
        <View style={sheetStyles.legendRow}>
          {(['high', 'medium', 'low'] as Severity[]).map(sev => (
            <View key={sev} style={[sheetStyles.legendChip, { backgroundColor: SEVERITY_META[sev].bg }]}>
              <Text style={[sheetStyles.legendText, { color: SEVERITY_META[sev].fg }]}>
                {SEVERITY_META[sev].label}: {DEADLINE_DAYS[sev]} يوم
              </Text>
            </View>
          ))}
        </View>

        {/* Items list */}
        <ScrollView
          style={sheetStyles.scroll}
          contentContainerStyle={sheetStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sorted.length === 0 ? (
            <View style={sheetStyles.emptyState}>
              <FontAwesome name="check-circle" size={36} color="#4caf50" />
              <Text style={sheetStyles.emptyText}>لا توجد مخالفات</Text>
            </View>
          ) : (
            sorted.map(item => (
              <DeadlineRow
                key={item.id}
                item={item}
                inspectionDate={inspection.date}
              />
            ))
          )}
        </ScrollView>

        {/* Export button */}
        {violations.length > 0 && (
          <TouchableOpacity
            style={sheetStyles.exportBtn}
            onPress={() => {
              handleClose();
              // slight delay so sheet animates out before share sheet opens
              setTimeout(() => exportNonConformityNoticePDF(inspection), 400);
            }}
            accessibilityLabel="تصدير محضر المخالفة"
          >
            <FontAwesome name="file-text-o" size={16} color="#fff" />
            <Text style={sheetStyles.exportBtnText}>تصدير محضر المخالفة (PDF)</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    paddingBottom:   24,
    elevation:       16,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: -4 },
    shadowOpacity:   0.15,
    shadowRadius:    12,
  },
  handle: {
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: '#ddd',
    alignSelf:       'center',
    marginTop:       10,
    marginBottom:    4,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  headerTitle:    { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  violationBadge: {
    backgroundColor: '#ffebee',
    borderRadius:    12,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  violationBadgeText: { fontSize: 12, fontWeight: '700', color: '#c62828' },
  closeBtn:       { padding: 4 },
  legendRow: {
    flexDirection:     'row',
    gap:               6,
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legendChip: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      8,
  },
  legendText:   { fontSize: 11, fontWeight: '600' },
  scroll:       { flex: 1 },
  scrollContent:{ paddingHorizontal: 16, paddingBottom: 8 },
  emptyState:   { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText:    { fontSize: 15, color: '#4caf50', fontWeight: '600' },
  exportBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               8,
    marginHorizontal:  16,
    marginTop:         8,
    paddingVertical:   13,
    backgroundColor:   '#e65100',
    borderRadius:      12,
  },
  exportBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
