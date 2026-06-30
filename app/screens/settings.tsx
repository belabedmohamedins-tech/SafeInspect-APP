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
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';

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
  const [settings,      setSettings]      = useState<Settings>(DEFAULT);
  const [saving,        setSaving]        = useState(false);
  const [bioAvailable,  setBioAvailable]  = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        SettingsRepository.getAll(),
        AuthRepository.getPin(),
        AuthRepository.isBiometricEnabled(),
        AuthRepository.isBiometricAvailable(),
      ]).then(([all, pin, bioEnabled, bioAvail]) => {
        if (!active) return;
        setBioAvailable(bioAvail);
        setSettings({
          inspectorName:    all['inspectorName'] || '',
          officeName:       all['officeName']    || '',
          pinEnabled:       !!pin,
          biometricEnabled: bioEnabled,
        });
      });
      return () => { active = false; };
    }, [])
  );

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

  const handleBiometricToggle = async (value: boolean) => {
    if (value && !settings.pinEnabled) {
      Alert.alert('', 'يجب تفعيل قفل PIN أولاً قبل تفعيل البصمة / الوجه.');
      return;
    }
    await AuthRepository.setBiometricEnabled(value);
    setSettings(s => ({ ...s, biometricEnabled: value }));
  };

  const save = async () => {
    setSaving(true);
    await SettingsRepository.set('inspectorName', settings.inspectorName);
    await SettingsRepository.set('officeName',    settings.officeName);
    setSaving(false);
    Alert.alert('', 'تم حفظ الإعدادات بنجاح ✓');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>معلومات المفتش</Text>
        <Text style={styles.label}>اسم المفتش</Text>
        <TextInput
          style={styles.input}
          value={settings.inspectorName}
          onChangeText={v => setSettings(s => ({ ...s, inspectorName: v }))}
          placeholder="أدخل اسم المفتش"
          placeholderTextColor={Colors.textTertiary}
          textAlign="right"
        />
        <Text style={styles.label}>اسم المكتب / الوحدة</Text>
        <TextInput
          style={styles.input}
          value={settings.officeName}
          onChangeText={v => setSettings(s => ({ ...s, officeName: v }))}
          placeholder="أدخل اسم المكتب"
          placeholderTextColor={Colors.textTertiary}
          textAlign="right"
        />
      </View>

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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>الأمان</Text>
        <View style={styles.switchRow}>
          <Switch
            value={settings.pinEnabled}
            onValueChange={handlePinToggle}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.surface}
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
        {bioAvailable && (
          <View style={styles.switchRow}>
            <Switch
              value={settings.biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.surface}
              disabled={!settings.pinEnabled}
            />
            <Text style={[
              styles.switchLabel,
              !settings.pinEnabled && { color: Colors.textTertiary },
            ]}>
              المصادقة البيومترية (بصمة / وجه)
            </Text>
          </View>
        )}
      </View>

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
  container:    { flex: 1, backgroundColor: Colors.background },
  header:       { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg,
                  paddingTop: 52, paddingBottom: Spacing.lg },
  headerTitle:  { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textInverse, textAlign: 'right' },
  card:         { backgroundColor: Colors.surface, margin: Spacing.md, marginTop: Spacing.sm,
                  borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary,
                  textAlign: 'right', marginBottom: Spacing.md },
  label:        { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right',
                  marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input:        { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
                  padding: Spacing.sm, fontSize: FontSize.base, color: Colors.textPrimary,
                  backgroundColor: Colors.background },
  segControl:   { flexDirection: 'row', gap: Spacing.sm },
  segBtn:       { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
                  paddingVertical: Spacing.sm, alignItems: 'center', backgroundColor: Colors.background },
  segBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  segBtnText:   { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  segBtnTextActive: { color: Colors.primary },
  switchRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  switchLabelWrap: { flex: 1, flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'center', marginRight: Spacing.sm },
  switchLabel:  { fontSize: FontSize.base, color: Colors.textPrimary, textAlign: 'right' },
  changePin:    { fontSize: FontSize.xs, color: Colors.primary, textDecorationLine: 'underline' },
  linkRow:      { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  linkText:     { fontSize: FontSize.base, color: Colors.primary, textAlign: 'right', fontWeight: FontWeight.medium },
  saveBtn:      { margin: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.md,
                  paddingVertical: Spacing.md, alignItems: 'center' },
  saveBtnText:  { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
