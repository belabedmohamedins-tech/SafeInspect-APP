// app/screens/geofence-check.tsx
// Geofencing gate (FR-047 / PRD § 13.5)
// Requests location → computes haversine distance → allows override with justification.
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  TextInput, ScrollView, Modal, I18nManager,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';
import { checkProximity, ProximityResult } from '../../src/services/geofencingService';

I18nManager.forceRTL(true);

type LocationState = 'idle' | 'requesting' | 'success' | 'error' | 'no-coords';

export default function GeofenceCheckScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    facilityId: string;
    facilityName: string;
    facilityAddress: string;
    facilityLat?: string;
    facilityLng?: string;
    agendaItemId?: string;
    committeeMembers?: string;
  }>();

  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [proximity, setProximity] = useState<ProximityResult | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [justification, setJustification] = useState('');
  const [justificationError, setJustificationError] = useState('');

  const facilityLat = params.facilityLat ? parseFloat(params.facilityLat) : null;
  const facilityLng = params.facilityLng ? parseFloat(params.facilityLng) : null;
  const hasCoords = facilityLat !== null && facilityLng !== null
    && !isNaN(facilityLat) && !isNaN(facilityLng);

  useEffect(() => {
    if (!hasCoords) {
      setLocationState('no-coords');
      return;
    }
    checkLocation();
  }, []);

  const checkLocation = async () => {
    setLocationState('requesting');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationState('error');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const result = checkProximity(
        facilityLat!, facilityLng!,
        loc.coords.latitude, loc.coords.longitude
      );
      setProximity(result);
      setLocationState('success');
    } catch {
      setLocationState('error');
    }
  };

  const proceed = (overrideNote?: string) => {
    router.push({
      pathname: '/screens/signature',
      params: {
        facilityId: params.facilityId,
        facilityName: params.facilityName,
        facilityAddress: params.facilityAddress,
        agendaItemId: params.agendaItemId ?? '',
        committeeMembers: params.committeeMembers ?? '',
        geofenceOverrideNote: overrideNote ?? '',
      },
    });
  };

  const handleOverrideSubmit = () => {
    if (justification.trim().length < 10) {
      setJustificationError('يرجى إدخال مبرر واضح (10 أحرف على الأقل)');
      return;
    }
    setShowOverrideModal(false);
    proceed(justification.trim());
  };

  const renderContent = () => {
    if (locationState === 'no-coords') {
      return (
        <View style={styles.resultBox}>
          <Text style={styles.iconText}>📍</Text>
          <Text style={styles.resultTitle}>لا توجد إحداثيات للمنشأة</Text>
          <Text style={styles.resultSub}>
            لم يتم تسجيل موقع GPS لهذه المنشأة بعد.
            يمكنك المتابعة مباشرة أو تحديث بيانات المنشأة لاحقاً.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => proceed()}>
            <Text style={styles.primaryBtnText}>متابعة بدون تحقق جغرافي</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (locationState === 'idle' || locationState === 'requesting') {
      return (
        <View style={styles.resultBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>جارٍ تحديد موقعك…</Text>
        </View>
      );
    }

    if (locationState === 'error') {
      return (
        <View style={styles.resultBox}>
          <Text style={styles.iconText}>⚠️</Text>
          <Text style={styles.resultTitle}>تعذّر الوصول إلى الموقع</Text>
          <Text style={styles.resultSub}>يرجى التأكد من تفعيل GPS والصلاحيات.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={checkLocation}>
            <Text style={styles.retryBtnText}>إعادة المحاولة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: Spacing.sm }]}
            onPress={() => setShowOverrideModal(true)}
          >
            <Text style={styles.primaryBtnText}>المتابعة مع ذكر مبرر</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // success
    const inRange = proximity?.withinRange ?? false;
    return (
      <View style={styles.resultBox}>
        <View style={[styles.statusCircle, inRange ? styles.statusGreen : styles.statusRed]}>
          <Text style={styles.statusIcon}>{inRange ? '✓' : '✗'}</Text>
        </View>
        <Text style={[styles.resultTitle, { color: inRange ? Colors.success : Colors.danger }]}>
          {inRange ? 'داخل النطاق الجغرافي' : 'خارج النطاق الجغرافي'}
        </Text>
        <Text style={styles.distanceText}>
          المسافة: {proximity?.distanceMetres} م
          {'  |  '}
          الحد المسموح: {proximity?.thresholdMetres} م
        </Text>
        {inRange ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => proceed()}>
            <Text style={styles.primaryBtnText}>بدء التفتيش ←</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.warningNote}>
              أنت خارج النطاق المحدد ({proximity?.thresholdMetres} م).
              يمكنك المتابعة بعد تقديم مبرر كتابي يُسجَّل في التقرير.
            </Text>
            <TouchableOpacity
              style={styles.overrideBtn}
              onPress={() => setShowOverrideModal(true)}
            >
              <Text style={styles.overrideBtnText}>تجاوز مع مبرر</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>التحقق الجغرافي</Text>
        <Text style={styles.headerSub}>{params.facilityName}</Text>
      </View>

      {renderContent()}

      {/* Override justification modal */}
      <Modal visible={showOverrideModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>مبرر التجاوز الجغرافي</Text>
            <Text style={styles.modalSub}>
              يُرجى إدخال سبب واضح لتنفيذ التفتيش خارج النطاق.
              سيُدرج هذا المبرر في التقرير الرسمي.
            </Text>
            <TextInput
              style={styles.justificationInput}
              value={justification}
              onChangeText={t => { setJustification(t); setJustificationError(''); }}
              placeholder="مثال: المنشأة في موقع ثانٍ / الإحداثيات غير محدّثة"
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlign="right"
              textAlignVertical="top"
            />
            {justificationError ? (
              <Text style={styles.errorText}>{justificationError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowOverrideModal(false)}
              >
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleOverrideSubmit}>
                <Text style={styles.submitBtnText}>تأكيد والمتابعة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: { color: Colors.textInverse, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  headerSub:   { color: Colors.textInverse, fontSize: FontSize.sm, marginTop: Spacing.xs, opacity: 0.8 },

  resultBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.md,
  },
  iconText:    { fontSize: 48, marginBottom: Spacing.md },
  loadingText: { marginTop: Spacing.lg, fontSize: FontSize.base, color: Colors.textSecondary },

  statusCircle: {
    width: 80, height: 80, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  statusGreen: { backgroundColor: Colors.successLight },
  statusRed:   { backgroundColor: Colors.dangerLight },
  statusIcon:  { fontSize: 40, fontWeight: FontWeight.bold },

  resultTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.xs, textAlign: 'center' },
  resultSub:    { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, maxWidth: 280 },
  distanceText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },

  warningNote: {
    fontSize: FontSize.sm,
    color: Colors.warning,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    textAlign: 'right',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryBtnText: { color: Colors.textInverse, fontSize: FontSize.base, fontWeight: FontWeight.bold },

  retryBtn: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, marginTop: Spacing.sm,
  },
  retryBtnText: { color: Colors.primary, fontSize: FontSize.base, fontWeight: FontWeight.semibold },

  overrideBtn: {
    borderWidth: 1.5, borderColor: Colors.danger, borderRadius: Radius.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, marginTop: Spacing.sm,
  },
  overrideBtnText: { color: Colors.danger, fontSize: FontSize.base, fontWeight: FontWeight.semibold },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, textAlign: 'right', marginBottom: Spacing.sm },
  modalSub:   { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.lg, lineHeight: 20 },
  justificationInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    padding: Spacing.md, fontSize: FontSize.base, color: Colors.textPrimary,
    minHeight: 100, textAlignVertical: 'top', marginBottom: Spacing.sm,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.xs, textAlign: 'right', marginBottom: Spacing.sm },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
  cancelBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  cancelBtnText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  submitBtnText: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
