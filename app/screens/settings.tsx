// app/screens/settings.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AuthRepository } from '../../src/repositories/AuthRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { useTranslation } from '../../src/i18n';
import {
  isEnabled  as isAgendaNotifEnabled,
  setEnabled as setAgendaNotifEnabled,
} from '../../src/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../../src/repositories/keys';

interface Settings {
  inspectorName:    string;
  officeName:       string;
  pinEnabled:       boolean;
  biometricEnabled: boolean;
}

const DEFAULT: Settings = {
  inspectorName:    '',
  officeName:       '',
  pinEnabled:       false,
  biometricEnabled: false,
};

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage } = useTranslation();
  const [settings,           setSettings]           = useState<Settings>(DEFAULT);
  const [saving,             setSaving]             = useState(false);
  const [bioAvailable,       setBioAvailable]       = useState(false);
  // Notification toggles
  const [agendaNotifOn,      setAgendaNotifOn]      = useState(true);
  const [capNotifOn,         setCapNotifOn]         = useState(true);

  // ── Load ──────────────────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        SettingsRepository.getAll(),
        AuthRepository.getPin(),
        AuthRepository.isBiometricEnabled(),
        AuthRepository.isBiometricAvailable(),
        isAgendaNotifEnabled(),
        AsyncStorage.getItem(StorageKeys.CAP_NOTIF_LAST_RUN).then(() =>
          // CAP toggle uses its own key; default ON (null → true)
          AsyncStorage.getItem('CAP_NOTIF_ENABLED').then(v => v === null ? true : v === 'true')
        ),
      ]).then(([all, pin, bioEnabled, bioAvail, agendaOn, capOn]) => {
        if (!active) return;
        setBioAvailable(bioAvail);
        setSettings({
          inspectorName:    all['inspectorName'] || '',
          officeName:       all['officeName']    || '',
          pinEnabled:       !!pin,
          biometricEnabled: bioEnabled,
        });
        setAgendaNotifOn(agendaOn);
        setCapNotifOn(capOn);
      });
      return () => { active = false; };
    }, [])
  );

  // ── Notification toggle handlers ────────────────────────────────────────────
  const handleAgendaNotifToggle = async (value: boolean) => {
    setAgendaNotifOn(value);
    await setAgendaNotifEnabled(value);
    // setEnabled(false) calls cancelAllScheduledNotificationsAsync internally;
    // on re-enable, notifications will be rescheduled on next app start.
  };

  const handleCapNotifToggle = async (value: boolean) => {
    setCapNotifOn(value);
    try {
      await AsyncStorage.setItem('CAP_NOTIF_ENABLED', String(value));
      if (!value) {
        // Cancel all three CAP notification strategies immediately
        const { cancelCapDigestNotification, cancelCapWeeklyDigestNotification } =
          await import('../../src/services/CapNotificationService');
        await cancelCapDigestNotification();
        await cancelCapWeeklyDigestNotification();
        // Per-item alerts share the expo-notifications schedule; we clear the
        // daily-run guard so they are not rescheduled on next start.
        await AsyncStorage.removeItem(StorageKeys.CAP_NOTIF_LAST_RUN);
      }
    } catch (err) {
      console.warn('[Settings] handleCapNotifToggle error:', err);
    }
  };

  // ── PIN toggle ───────────────────────────────────────────────────────────────────
  const handlePinToggle = async (value: boolean) => {
    if (value) {
      router.push('/screens/pin-setup');
    } else {
      Alert.alert(
        'إلغاء قفل PIN',
        'سيتم إزالة رمز PIN الحالي. هل تريد المتابعة؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'إزالة',
            style: 'destructive',
            onPress: async () => {
              await AuthRepository.setPin(null);
              await AuthRepository.setBiometricEnabled(false);
              setSettings(s => ({ ...s, pinEnabled: false, biometricEnabled: false }));
            },
          },
        ]
      );
    }
  };

  // ── Biometric toggle ───────────────────────────────────────────────────────────
  const handleBiometricToggle = async (value: boolean) => {
    if (value && !settings.pinEnabled) {
      Alert.alert('', 'يجب تفعيل قفل PIN أولاً قبل تفعيل البصمة / الوجه.');
      return;
    }
    await AuthRepository.setBiometricEnabled(value);
    setSettings(s => ({ ...s, biometricEnabled: value }));
  };

  // ── Save (text fields only) ─────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    await SettingsRepository.set('inspectorName', settings.inspectorName);
    await SettingsRepository.set('officeName',    settings.officeName);
    setSaving(false);
    Alert.alert('', 'تم حفظ الإعدادات بنجاح ✓');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      {/* Inspector Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>معلومات المفتش</Text>

        <Text style={styles.label}>اسم المفتش</Text>
        <TextInput
          style={styles.input}
          value={settings.inspectorName}
          onChangeText={v => setSettings(s => ({ ...s, inspectorName: v }))}
          placeholder="أدخل اسم المفتش"
          textAlign="right"
        />

        <Text style={styles.label}>اسم المكتب / الوحدة</Text>
        <TextInput
          style={styles.input}
          value={settings.officeName}
          onChangeText={v => setSettings(s => ({ ...s, officeName: v }))}
          placeholder="أدخل اسم المكتب"
          textAlign="right"
        />
      </View>

      {/* Language */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>اللغة / Langue</Text>
        <View style={styles.segControl}>
          <TouchableOpacity
            style={[styles.segBtn, language === 'ar' && styles.segBtnActive]}
            onPress={() => setLanguage('ar')}
          >
            <Text style={[styles.segBtnText, language === 'ar' && styles.segBtnTextActive]}>
              🇩🇿 العربية
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, language === 'fr' && styles.segBtnActive]}
            onPress={() => setLanguage('fr')}
          >
            <Text style={[styles.segBtnText, language === 'fr' && styles.segBtnTextActive]}>
              🇫🇷 Français
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications (Phase 21) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>الإشعارات</Text>

        {/* Agenda notifications */}
        <View style={styles.switchRow}>
          <Switch
            value={agendaNotifOn}
            onValueChange={handleAgendaNotifToggle}
            trackColor={{ false: '#ddd', true: '#2c7a4b' }}
            thumbColor="#fff"
          />
          <View style={styles.switchLabelWrap}>
            <Text style={styles.switchLabel}>تذكيرات الجدول الزمني</Text>
            <Text style={styles.switchSub}>تنبيه قبل الزيارات التفتيشية</Text>
          </View>
        </View>

        {/* CAP deadline notifications */}
        <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
          <Switch
            value={capNotifOn}
            onValueChange={handleCapNotifToggle}
            trackColor={{ false: '#ddd', true: '#2c7a4b' }}
            thumbColor="#fff"
          />
          <View style={styles.switchLabelWrap}>
            <Text style={styles.switchLabel}>إشعارات مواعيد الإجراءات التصحيحية</Text>
            <Text style={styles.switchSub}>ملخص يومي وأسبوعي + تنبيهات بالمواعيد</Text>
          </View>
        </View>
      </View>

      {/* Security */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>الأمان</Text>

        {/* PIN row */}
        <View style={styles.switchRow}>
          <Switch
            value={settings.pinEnabled}
            onValueChange={handlePinToggle}
            trackColor={{ false: '#ddd', true: '#2c7a4b' }}
            thumbColor="#fff"
          />
          <View style={styles.switchLabelWrap}>
            <Text style={styles.switchLabel}>تفعيل قفل PIN</Text>
            {settings.pinEnabled && (
              <TouchableOpacity onPress={() => router.push('/screens/pin-setup')}>
                <Text style={styles.changePin}>تغيير الرمز</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Biometric row — only shown if hardware exists */}
        {bioAvailable && (
          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <Switch
              value={settings.biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#ddd', true: '#2c7a4b' }}
              thumbColor="#fff"
              disabled={!settings.pinEnabled}
            />
            <Text style={[
              styles.switchLabel,
              !settings.pinEnabled && { color: '#aaa' },
            ]}>
              المصادقة البيومترية (بصمة / وجه)
            </Text>
          </View>
        )}
      </View>

      {/* Navigation Shortcuts */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>روابط سريعة</Text>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/screens/backup')}>
          <Text style={styles.linkText}>النسخ الاحتياطي والاستعادة →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/screens/inspector-profile')}>
          <Text style={styles.linkText}>الملف الشخصي للمفتش →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/screens/legal')}>
          <Text style={styles.linkText}>المراجع القانونية →</Text>
        </TouchableOpacity>
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={save}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f0f4f0' },
  header:          { backgroundColor: '#2c7a4b', paddingHorizontal: 16,
                     paddingTop: 52, paddingBottom: 18 },
  headerTitle:     { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'right' },
  card:            { backgroundColor: '#fff', margin: 16, marginTop: 12, borderRadius: 12,
                     padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                     shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  sectionTitle:    { fontSize: 15, fontWeight: '700', color: '#1a1a2e', textAlign: 'right',
                     marginBottom: 12 },
  label:           { fontSize: 13, color: '#555', textAlign: 'right', marginBottom: 4, marginTop: 8 },
  input:           { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10,
                     fontSize: 14, color: '#1a1a2e', backgroundColor: '#fafafa' },
  segControl:      { flexDirection: 'row', gap: 10 },
  segBtn:          { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                     paddingVertical: 10, alignItems: 'center', backgroundColor: '#fafafa' },
  segBtnActive:    { borderColor: '#2c7a4b', backgroundColor: '#eaf6ef' },
  segBtnText:      { fontSize: 14, color: '#555', fontWeight: '600' },
  segBtnTextActive:{ color: '#2c7a4b' },
  switchRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                     paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  switchLabelWrap: { flex: 1, marginRight: 10, gap: 2 },
  switchLabel:     { fontSize: 14, color: '#1a1a2e', textAlign: 'right' },
  switchSub:       { fontSize: 11, color: '#95a5a6', textAlign: 'right' },
  changePin:       { fontSize: 12, color: '#2c7a4b', textDecorationLine: 'underline' },
  linkRow:         { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  linkText:        { fontSize: 14, color: '#2c7a4b', textAlign: 'right', fontWeight: '500' },
  saveBtn:         { margin: 16, backgroundColor: '#2c7a4b', borderRadius: 10,
                     paddingVertical: 14, alignItems: 'center' },
  saveBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});
