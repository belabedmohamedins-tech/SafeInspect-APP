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
import { BriefData, buildBrief } from '../../src/services/briefService';
import { useTranslation } from '../../src/i18n';

I18nManager.forceRTL(true);

const GRADE_COLOR: Record<string, string> = {
  A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626',
};

const SEVERITY_COLOR: Record<string, string> = {
  high: '#dc2626', medium: '#d97706', low: '#2563eb',
};

export default function BriefScreen() {
  const { t } = useTranslation();
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
  const [equipment, setEquipment] = useState<boolean[]>([]);
  const [committee, setCommittee] = useState<string>('');

  // Equipment items from locale so they switch language too
  const EQUIPMENT_ITEMS = [
    t('brief_equip_badge'),
    t('brief_equip_form'),
    t('brief_equip_pen'),
    t('brief_equip_phone'),
    t('brief_equip_meter'),
    t('brief_equip_ppe'),
    t('brief_equip_decree'),
    t('brief_equip_stamp'),
  ];

  useEffect(() => {
    buildBrief(params.facilityId)
      .then(data => {
        setBrief(data);
        if (data.lastInspection?.committeeMembers?.length) {
          setCommittee(data.lastInspection.committeeMembers.join('، '));
        }
      })
      .finally(() => setLoading(false));
    setEquipment(Array(8).fill(false));
  }, [params.facilityId]);

  const toggleEquipment = useCallback((idx: number) => {
    setEquipment(prev => prev.map((v, i) => (i === idx ? !v : v)));
  }, []);

  const handleConfirm = () => {
    const missing = equipment.filter(v => !v).length;
    if (missing > 0) {
      Alert.alert(
        t('brief_equip_alert_title'),
        t('brief_equip_alert_body').replace('{count}', String(missing)),
        [
          { text: t('brief_equip_alert_review'), style: 'cancel' },
          { text: t('brief_equip_alert_proceed'), onPress: proceed },
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
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('brief_title')}</Text>
        <Text style={styles.headerSub}>{params.facilityName}</Text>
      </View>

      {/* Last Visit Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('brief_last_visit')}</Text>
        {brief?.lastInspection ? (
          <View style={styles.row}>
            <View style={styles.gradeBox}>
              <Text style={[
                styles.gradeLetter,
                { color: GRADE_COLOR[brief.previousGrade ?? ''] ?? '#374151' }
              ]}>
                {brief.previousGrade ?? '—'}
              </Text>
              <Text style={styles.gradeLabel}>{t('brief_grade_label')}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLine}>
                {t('brief_score_label')}: {brief.previousScore !== null ? `${brief.previousScore}%` : '—'}
              </Text>
              <Text style={styles.infoLine}>
                {t('brief_date_label')}: {brief.previousDate ?? '—'}
              </Text>
              <Text style={styles.infoLine}>
                {t('brief_inspector_label')}: {brief.previousInspectorName ?? '—'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>{t('brief_no_previous')}</Text>
        )}
      </View>

      {/* Top Violations */}
      {(brief?.topViolations?.length ?? 0) > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('brief_top_violations')}</Text>
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
                  {t(`brief_severity_${item.severity}`)}
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
        <Text style={styles.cardTitle}>{t('brief_equipment_title')}</Text>
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
        <Text style={styles.cardTitle}>{t('brief_committee_title')}</Text>
        <Text style={styles.inputHint}>{t('brief_committee_hint')}</Text>
        <TextInput
          style={styles.textInput}
          value={committee}
          onChangeText={setCommittee}
          placeholder={t('brief_committee_placeholder')}
          placeholderTextColor="#9ca3af"
          multiline
          textAlign="right"
        />
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmBtnText}>{t('brief_confirm_btn')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1e40af', borderRadius: 12,
    padding: 20, marginBottom: 16, alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#bfdbfe', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTitle: {
    fontSize: 15, fontWeight: '700', color: '#1e293b',
    marginBottom: 12, textAlign: 'right',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  gradeBox: { alignItems: 'center', minWidth: 60 },
  gradeLetter: { fontSize: 42, fontWeight: '800' },
  gradeLabel: { fontSize: 12, color: '#64748b' },
  infoCol: { flex: 1 },
  infoLine: { fontSize: 13, color: '#374151', marginBottom: 4, textAlign: 'right' },
  noData: { color: '#9ca3af', fontSize: 13, textAlign: 'right' },
  violationRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 8, marginBottom: 8, flexWrap: 'wrap',
  },
  severityPill: {
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start',
  },
  severityText: { fontSize: 11, fontWeight: '700' },
  violationCriteria: { flex: 1, fontSize: 13, color: '#374151', textAlign: 'right' },
  checkRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#cbd5e1',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 13, color: '#374151', textAlign: 'right' },
  checkLabelChecked: { color: '#1e40af', textDecorationLine: 'line-through' },
  inputHint: { fontSize: 12, color: '#94a3b8', textAlign: 'right', marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8,
    padding: 10, fontSize: 14, color: '#1e293b',
    minHeight: 72, textAlignVertical: 'top',
  },
  confirmBtn: {
    backgroundColor: '#1e40af', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
