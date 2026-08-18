// app/screens/settings.tsx — router.push Href casts added
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { AuthRepository } from '../../src/repositories/AuthRepository';
import { StorageKeys } from '../../src/repositories/keys';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();

  const [loading, setLoading]                   = useState(true);
  const [pinEnabled, setPinEnabled]             = useState(false);
  const [notifEnabled, setNotifEnabled]         = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled]   = useState(true);
  const [darkMode, setDarkMode]                 = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await SettingsRepository.getAll();
    const pin = await AuthRepository.getPin();
    setPinEnabled(!!pin);
    setNotifEnabled(all[StorageKeys.NOTIFICATIONS_UI] !== 'false');
    setAutoSyncEnabled(all[StorageKeys.AUTO_SYNC] !== 'false');
    setDarkMode(all[StorageKeys.DARK_MODE] === 'true');
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePinToggle = async (value: boolean) => {
    if (value) {
      router.push('/screens/pin-setup' as Href);
    } else {
      Alert.alert(
        t('settings.disablePin') || 'تعطيل PIN',
        'هل تريد حذف رمز PIN الحالي؟',
        [
          { text: t('common.cancel') || 'إلغاء', style: 'cancel' },
          {
            text: t('common.confirm') || 'تأكيد',
            style: 'destructive',
            onPress: async () => {
              await AuthRepository.clearPin();
              setPinEnabled(false);
            },
          },
        ],
      );
    }
  };

  const handleNotifToggle = async (value: boolean) => {
    setNotifEnabled(value);
    await SettingsRepository.set(StorageKeys.NOTIFICATIONS_UI, value ? 'true' : 'false');
  };

  const handleAutoSyncToggle = async (value: boolean) => {
    setAutoSyncEnabled(value);
    await SettingsRepository.set(StorageKeys.AUTO_SYNC, value ? 'true' : 'false');
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    await SettingsRepository.set(StorageKeys.DARK_MODE, value ? 'true' : 'false');
  };

  const handleLanguageChange = async (lang: 'ar' | 'fr') => {
    await setLanguage(lang);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title') || 'الإعدادات'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Security ──────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.security') || 'الأمان'}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>{t('settings.pinLock') || 'قفل PIN'}</Text>
              <Text style={styles.rowSub}>{t('settings.pinLockDesc') || 'تفعيل قفل بالرمز السري'}</Text>
            </View>
            <Switch
              value={pinEnabled}
              onValueChange={handlePinToggle}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={pinEnabled ? '#1e40af' : '#94a3b8'}
            />
          </View>
          {pinEnabled && (
            <TouchableOpacity
              style={styles.subAction}
              onPress={() => router.push('/screens/pin-setup' as Href)}
            >
              <Text style={styles.subActionText}>{t('settings.changePIN') || 'تغيير رمز PIN'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Notifications ────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.notifications') || 'الإشعارات'}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>{t('settings.pushNotifications') || 'إشعارات الدفع'}</Text>
              <Text style={styles.rowSub}>{t('settings.pushDesc') || 'تلقي تنبيهات المواعيد والتذكيرات'}</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleNotifToggle}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={notifEnabled ? '#1e40af' : '#94a3b8'}
            />
          </View>
        </View>

        {/* ── Sync ────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.sync') || 'المزامنة'}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>{t('settings.autoSync') || 'المزامنة التلقائية'}</Text>
              <Text style={styles.rowSub}>{t('settings.autoSyncDesc') || 'مزامنة البيانات كل 30 ثانية'}</Text>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={handleAutoSyncToggle}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={autoSyncEnabled ? '#1e40af' : '#94a3b8'}
            />
          </View>
        </View>

        {/* ── Appearance ─────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.appearance') || 'المظهر'}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>{t('settings.darkMode') || 'الوضع الداكن'}</Text>
              <Text style={styles.rowSub}>{t('settings.darkModeDesc') || 'تفعيل المظهر الداكن'}</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={darkMode ? '#1e40af' : '#94a3b8'}
            />
          </View>
        </View>

        {/* ── Language ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('settings.language') || 'اللغة'}</Text>
        <View style={styles.card}>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'ar' && styles.langBtnActive]}
              onPress={() => handleLanguageChange('ar')}
            >
              <Text style={[styles.langBtnText, language === 'ar' && styles.langBtnActiveText]}>العربية</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, language === 'fr' && styles.langBtnActive]}
              onPress={() => handleLanguageChange('fr')}
            >
              <Text style={[styles.langBtnText, language === 'fr' && styles.langBtnActiveText]}>Français</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1e40af', paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { padding: 8 },
  backBtnText: { color: '#fff', fontSize: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 20, marginBottom: 8, textAlign: 'right',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  rowLeft: { flex: 1, marginLeft: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', textAlign: 'right' },
  rowSub: { fontSize: 12, color: '#94a3b8', textAlign: 'right', marginTop: 2 },
  subAction: {
    paddingVertical: 12, paddingHorizontal: 16,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
    alignItems: 'flex-end',
  },
  subActionText: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  langRow: { flexDirection: 'row', padding: 8, gap: 8 },
  langBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    alignItems: 'center', backgroundColor: '#f8fafc',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  langBtnActive: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  langBtnText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  langBtnActiveText: { color: '#fff' },
});
