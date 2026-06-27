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
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { useTranslation } from '../../src/i18n';

interface Settings {
  inspectorName: string;
  officeName: string;
  pinEnabled: boolean;
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
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const all = await SettingsRepository.getAll();
    setSettings({
      inspectorName:    (all['inspectorName']    as string)  || '',
      officeName:       (all['officeName']       as string)  || '',
      pinEnabled:       (all['pinEnabled']       as boolean) || false,
      biometricEnabled: (all['biometricEnabled'] as boolean) || false,
    });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    setSaving(true);
    await SettingsRepository.set('inspectorName',    settings.inspectorName);
    await SettingsRepository.set('officeName',       settings.officeName);
    await SettingsRepository.set('pinEnabled',       settings.pinEnabled);
    await SettingsRepository.set('biometricEnabled', settings.biometricEnabled);
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

      {/* Security */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>الأمان</Text>

        <View style={styles.switchRow}>
          <Switch
            value={settings.pinEnabled}
            onValueChange={v => setSettings(s => ({ ...s, pinEnabled: v }))}
            trackColor={{ false: '#ddd', true: '#2c7a4b' }}
            thumbColor="#fff"
          />
          <Text style={styles.switchLabel}>تفعيل قفل PIN</Text>
        </View>

        <View style={styles.switchRow}>
          <Switch
            value={settings.biometricEnabled}
            onValueChange={v => setSettings(s => ({ ...s, biometricEnabled: v }))}
            trackColor={{ false: '#ddd', true: '#2c7a4b' }}
            thumbColor="#fff"
          />
          <Text style={styles.switchLabel}>المصادقة البيومترية (بصمة / وجه)</Text>
        </View>
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
  container:    { flex: 1, backgroundColor: '#f0f4f0' },
  header:       { backgroundColor: '#2c7a4b', paddingHorizontal: 16,
                  paddingTop: 52, paddingBottom: 18 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'right' },
  card:         { backgroundColor: '#fff', margin: 16, marginTop: 12, borderRadius: 12,
                  padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', textAlign: 'right',
                  marginBottom: 12 },
  label:        { fontSize: 13, color: '#555', textAlign: 'right', marginBottom: 4, marginTop: 8 },
  input:        { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10,
                  fontSize: 14, color: '#1a1a2e', backgroundColor: '#fafafa' },
  segControl:   { flexDirection: 'row', gap: 10 },
  segBtn:       { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                  paddingVertical: 10, alignItems: 'center', backgroundColor: '#fafafa' },
  segBtnActive: { borderColor: '#2c7a4b', backgroundColor: '#eaf6ef' },
  segBtnText:   { fontSize: 14, color: '#555', fontWeight: '600' },
  segBtnTextActive: { color: '#2c7a4b' },
  switchRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  switchLabel:  { fontSize: 14, color: '#1a1a2e', flex: 1, textAlign: 'right', marginRight: 10 },
  linkRow:      { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  linkText:     { fontSize: 14, color: '#2c7a4b', textAlign: 'right', fontWeight: '500' },
  saveBtn:      { margin: 16, backgroundColor: '#2c7a4b', borderRadius: 10,
                  paddingVertical: 14, alignItems: 'center' },
  saveBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
