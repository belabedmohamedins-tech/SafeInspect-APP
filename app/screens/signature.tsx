// app/screens/signature.tsx
// Signature capture screen (FR-063→068)
// Inspector draws signature → stored as base64 in SavedInspection.signature
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, SafeAreaView, I18nManager,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SignaturePad, { SignaturePadHandle } from '../../components/inspection/SignaturePad';

I18nManager.forceRTL(true);

export default function SignatureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    facilityId: string;
    facilityName: string;
    facilityAddress: string;
    agendaItemId?: string;
    committeeMembers?: string;
    geofenceOverrideNote?: string;
  }>();

  const padRef = useRef<SignaturePadHandle>(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const handleSignature = (base64: string) => {
    setSignatureData(base64);
    setHasSigned(true);
  };

  const handleClear = () => {
    padRef.current?.clear();
    setHasSigned(false);
    setSignatureData(null);
  };

  const handleConfirm = () => {
    if (!hasSigned || !signatureData) {
      Alert.alert('التوقيع مطلوب', 'يرجى التوقيع قبل المتابعة.');
      return;
    }
    router.push({
      pathname: '/(tabs)',
      params: {
        // Pass everything the checklist / inspection flow needs
        facilityId: params.facilityId,
        facilityName: params.facilityName,
        facilityAddress: params.facilityAddress,
        agendaItemId: params.agendaItemId ?? '',
        committeeMembers: params.committeeMembers ?? '',
        geofenceOverrideNote: params.geofenceOverrideNote ?? '',
        signature: signatureData,
      },
    });
  };

  const handleExport = () => {
    padRef.current?.export();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>توقيع المفتش</Text>
        <Text style={styles.headerSub}>{params.facilityName}</Text>
      </View>

      <Text style={styles.instruction}>
        يرجى التوقيع أدناه بإصبعك. سيظهر التوقيع في التقرير الرسمي.
      </Text>

      {/* Signature Canvas */}
      <View style={styles.canvasWrapper}>
        <SignaturePad
          ref={padRef}
          label="توقيع المفتش المسؤول"
          onSignature={handleSignature}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>مسح التوقيع</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmBtn, !hasSigned && styles.confirmBtnDisabled]}
          onPress={() => { handleExport(); setTimeout(handleConfirm, 300); }}
        >
          <Text style={styles.confirmBtnText}>تأكيد والمتابعة ←</Text>
        </TouchableOpacity>
      </View>

      {hasSigned && (
        <Text style={styles.signedBadge}>✓ تم التوقيع — يمكنك المتابعة</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#1e40af', padding: 20, alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#bfdbfe', fontSize: 14, marginTop: 4 },
  instruction: {
    fontSize: 13, color: '#64748b', textAlign: 'right',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },
  canvasWrapper: {
    flex: 1, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  actions: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  clearBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  clearBtnText: { color: '#64748b', fontSize: 15, fontWeight: '600' },
  confirmBtn: {
    flex: 2, backgroundColor: '#1e40af',
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#93c5fd' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  signedBadge: {
    textAlign: 'center', color: '#16a34a',
    fontSize: 13, fontWeight: '600', paddingBottom: 8,
  },
});
