// app/screens/brief.tsx
// Pre-Inspection Brief screen (FR-027→031)
// Shows: last visit summary, top violations, equipment checklist, committee members.
// Inspector confirms readiness then proceeds to geofence-check → checklist.
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, I18nManager,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';
import { BriefData, buildBrief } from '../../src/services/briefService';

I18nManager.forceRTL(true);

const EQUIPMENT_ITEMS = [
  'بطاقة المفتش الرسمية',
  'نموذج قائمة الفحص المطبوع',
  'قلم + دفتر ملاحظات',
  'هاتف مشحون (كاميرا + GPS)',
  'مقياس الإضاءة / الضجيج (إن لزم)',
  'معدات الحماية الشخصية (خوذة، سترة)',
  'نسخة من القرار التنظيمي',
  'ختم المكتب (إن وُجد)',
];

const GRADE_COLOR: Record<string, string> = {
  A: Colors.success,
  B: Colors.primary,
  C: Colors.warning,
  D: Colors.danger,
};

const SEVERITY_LABEL: Record<string, string> = {
  high: 'حرج', medium: 'متوسط', low: 'منخفض',
};
const SEVERITY_COLOR: Record<string, string> = {
  high: Colors.danger, medium: Colors.warning, low: Colors.primary,
};

export default function BriefScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    facilityId: string;
    facilityName: string;
    facilityAddress: string;
    facilityLat?: string;
    facilityLng?: string;
    agendaItemId?: string;
  }>();

  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<boolean[]>(EQUIPMENT_ITEMS.map(() => false));
  const [committee, setCommittee] = useState<string>('');

  useEffect(() => {
    buildBrief(params.facilityId)
      .then(data => {
        setBrief(data);
        // Pre-fill committee from last visit
        if (data.lastInspection?.committeeMembers?.length) {
          setCommittee(data.lastInspection.committeeMembers.join('، '));
        }
      })
      .finally(() => setLoading(false));
  }, [params.facilityId]);

  const toggleEquipment = useCallback((idx: number) => {
    setEquipment(prev => prev.map((v, i) => (i === idx ? !v : v)));
  }, []);

  const handleConfirm = () => {
    const missing = equipment.filter(v => !v).length;
    if (missing > 0) {
      Alert.alert(
        'تحقق من المعدات',
        `لم يتم تأكيد ${missing} عناصر من قائمة المعدات. هل تريد المتابعة على أي حال؟`,
        [
          { text: 'مراجعة', style: 'cancel' },
          { text: 'متابعة', onPress: proceed },
        ]
      );
    } else {
      proceed();
    }
  };

  const proceed = () => {
    router.push({
      pathname: '/screens/geofence-check',
      params: {
        facilityId: params.facilityId,
        facilityName: params.facilityName,
        facilityAddress: params.facilityAddress,
        facilityLat: params.facilityLat ?? '',
        facilityLng: params.facilityLng ?? '',
        agendaItemId: params.agendaItemId ?? '',
        committeeMembers: committee,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>موجز ما قبل التفتيش</Text>
        <Text style={styles.headerSub}>{params.facilityName}</Text>
      </View>

      {/* Last Visit Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>آخر زيارة تفتيشية</Text>
        {brief?.lastInspection ? (
          <View style={styles.row}>
            <View style={styles.gradeBox}>
              <Text style={[
                styles.gradeLetter,
                { color: GRADE_COLOR[brief.previousGrade ?? ''] ?? Colors.textPrimary }
              ]}>
                {brief.previousGrade ?? '—'}
              </Text>
              <Text style={styles.gradeLabel}>التقييم</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLine}>
                النتيجة: {brief.previousScore !== null ? `${brief.previousScore}%` : '—'}
              </Text>
              <Text style={styles.infoLine}>
                التاريخ: {brief.previousDate ?? '—'}
              </Text>
              <Text style={styles.infoLine}>
                المفتش: {brief.previousInspectorName ?? '—'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>لا توجد زيارة سابقة لهذه المنشأة</Text>
        )}
      </View>

      {/* Top Violations */}
      {(brief?.topViolations?.length ?? 0) > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>أبرز المخالفات السابقة</Text>
          {brief!.topViolations.map((item, idx) => (
            <View key={item.id} style={styles.violationRow}>
              <View style={[
                styles.severityPill,
                { backgroundColor: SEVERITY_COLOR[item.severity] + '22' }
              ]}>
                <Text style={[
                  styles.severityText,
                  { color: SEVERITY_COLOR[item.severity] }
                ]}>
                  {SEVERITY_LABEL[item.severity]}
                </Text>
              </View>
              <Text style={styles.violationCriteria} numberOfLines={2}>
                {idx + 1}. {item.criteria}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Equipment Checklist */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>قائمة المعدات والمستلزمات</Text>
        {EQUIPMENT_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.checkRow}
            onPress={() => toggleEquipment(idx)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, equipment[idx] && styles.checkboxChecked]}>
              {equipment[idx] && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[
              styles.checkLabel,
              equipment[idx] && styles.checkLabelChecked
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Committee Members */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>أعضاء لجنة التفتيش</Text>
        <Text style={styles.inputHint}>أدخل أسماء الأعضاء مفصولة بفاصلة</Text>
        <TextInput
          style={styles.textInput}
          value={committee}
          onChangeText={setCommittee}
          placeholder="مثال: أحمد علي، محمد سعيد"
          placeholderTextColor={Colors.textFaint}
          multiline
          textAlign="right"
        />
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmBtnText}>تأكيد والمتابعة إلى التفتيش ←</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: { color: Colors.textInverse, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  headerSub: { color: Colors.textInverse + 'cc', fontSize: FontSize.sm, marginTop: Spacing.xs },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
    ...Shadow.sm,
  },
  cardTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary,
    marginBottom: Spacing.md, textAlign: 'right',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  gradeBox: { alignItems: 'center', minWidth: 60 },
  gradeLetter: { fontSize: 42, fontWeight: FontWeight.bold },
  gradeLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  infoCol: { flex: 1 },
  infoLine: { fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: Spacing.xs, textAlign: 'right' },
  noData: { color: Colors.textFaint, fontSize: FontSize.sm, textAlign: 'right' },
  violationRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: Spacing.sm, marginBottom: Spacing.sm, flexWrap: 'wrap',
  },
  severityPill: {
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start',
  },
  severityText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  violationCriteria: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right' },
  checkRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: Radius.sm,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkMark: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  checkLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right' },
  checkLabelChecked: { color: Colors.primary, textDecorationLine: 'line-through' },
  inputHint: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.sm },
  textInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.sm, fontSize: FontSize.base, color: Colors.textPrimary,
    minHeight: 72, textAlignVertical: 'top',
  },
  confirmBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm,
  },
  confirmBtnText: { color: Colors.textInverse, fontSize: FontSize.base, fontWeight: FontWeight.bold },
});
