// app/screens/geofence-check.tsx
// Geofencing gate (FR-047 / PRD § 13.5)
// Requests location → computes haversine distance → allows override with justification.
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  TextInput, Alert, ScrollView, Modal, I18nManager,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
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
          <ActivityIndicator size="large" color="#1e40af" />
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
            style={[styles.primaryBtn, { marginTop: 10 }]}
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
        <View style={[styles.statusCircle, inRange ? styles.green : styles.red]}>
          <Text style={styles.statusIcon}>{inRange ? '✓' : '✗'}</Text>
        </View>
        <Text style={[styles.resultTitle, { color: inRange ? '#16a34a' : '#dc2626' }]}>
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
              placeholderTextColor="#9ca3af"
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    backgroundColor: '#1e40af', borderRadius: 12,
    padding: 20, marginBottom: 16, alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#bfdbfe', fontSize: 14, marginTop: 4 },
  resultBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  iconText: { fontSize: 48, marginBottom: 12 },
  loadingText: { marginTop: 16, fontSize: 15, color: '#64748b' },
  statusCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  green: { backgroundColor: '#dcfce7' },
  red: { backgroundColor: '#fee2e2' },
  statusIcon: { fontSize: 40, fontWeight: '800' },
  resultTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  resultSub: {
    fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 20, maxWidth: 280,
  },
  distanceText: { fontSize: 13, color: '#475569', marginBottom: 20 },
  warningNote: {
    fontSize: 13, color: '#92400e', backgroundColor: '#fef3c7',
    borderRadius: 8, padding: 12, textAlign: 'right',
    marginBottom: 16, lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#1e40af', borderRadius: 10, paddingVertical: 14,
    paddingHorizontal: 32, alignItems: 'center', marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  retryBtn: {
    borderWidth: 1.5, borderColor: '#1e40af', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 28, marginTop: 8,
  },
  retryBtnText: { color: '#1e40af', fontSize: 15, fontWeight: '600' },
  overrideBtn: {
    borderWidth: 1.5, borderColor: '#dc2626', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 28, marginTop: 8,
  },
  overrideBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', textAlign: 'right', marginBottom: 8 },
  modalSub: { fontSize: 13, color: '#64748b', textAlign: 'right', marginBottom: 16, lineHeight: 20 },
  justificationInput: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#1e293b',
    minHeight: 100, textAlignVertical: 'top', marginBottom: 8,
  },
  errorText: { color: '#dc2626', fontSize: 12, textAlign: 'right', marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 20,
  },
  cancelBtnText: { color: '#64748b', fontSize: 14 },
  submitBtn: {
    backgroundColor: '#1e40af', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 20,
  },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
