// app/screens/settings.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing } from '../../constants';
import { AuthRepository } from '../../src/repositories/AuthRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const router = useRouter();

  // ── Inspector fields ────────────────────────────────────────────────
  const [inspectorName, setInspectorName] = useState('');
  const [officeName,    setOfficeName]    = useState('');
  const [saved,         setSaved]         = useState(false);

  // ── PIN state ───────────────────────────────────────────────────────
  const [pinConfigured,  setPinConfigured]  = useState(false);
  const [showPinSetup,   setShowPinSetup]   = useState(false);
  const [newPin,         setNewPin]         = useState('');
  const [confirmPin,     setConfirmPin]     = useState('');
  const [pinError,       setPinError]       = useState('');

  // ── Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const settings = await SettingsRepository.get();
      setInspectorName(settings.inspectorName);
      setOfficeName(settings.officeName);

      const pin = await AuthRepository.getPin();
      setPinConfigured(pin !== null);
    })();
  }, []);

  // ── Save inspector settings ─────────────────────────────────────────
  const handleSave = async () => {
    try {
      await SettingsRepository.set({
        inspectorName: inspectorName.trim(),
        officeName:    officeName.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      Alert.alert('خطأ', 'تعذّر حفظ الإعدادات');
    }
  };

  // ── PIN setup ───────────────────────────────────────────────────────
  const handleSetPin = async () => {
    setPinError('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('يجب أن يتكون الرمز من 4 أرقام بالضبط');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('الرمزان غير متطابقين');
      return;
    }
    await AuthRepository.setPin(newPin);
    setPinConfigured(true);
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    Alert.alert('نجاح', 'تم تفعيل رمز الدخول بنجاح');
  };

  const handleRemovePin = () => {
    Alert.alert(
      'إلغاء رمز الدخول',
      'سيتم إلغاء حماية التطبيق. هل أنت متأكد؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم، إلغاء الرمز',
          style: 'destructive',
          onPress: async () => {
            await AuthRepository.setPin(null);
            setPinConfigured(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <FontAwesome name="arrow-right" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ─── Inspector Info ────────────────── */}
        <Text style={styles.sectionTitle}>بيانات المفتش</Text>
        <View style={styles.card}>
          <Field
            label="اسم المفتش"
            value={inspectorName}
            onChange={setInspectorName}
            placeholder="الاسم الكامل"
          />
          <Divider />
          <Field
            label="المصلحة / المكتب"
            value={officeName}
            onChange={setOfficeName}
            placeholder="مديرية التجارة ..."
          />
        </View>

        {/* ─── Security ───────────────────── */}
        <Text style={styles.sectionTitle}>الأمان</Text>
        <View style={styles.card}>

          {/* PIN toggle row */}
          <View style={styles.switchRow}>
            <Switch
              value={pinConfigured}
              onValueChange={v => {
                if (v) {
                  setShowPinSetup(true);
                } else {
                  handleRemovePin();
                }
              }}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.textInverse}
            />
            <Text style={styles.switchLabel}>رمز الدخول (PIN)</Text>
          </View>

          {/* PIN setup form — shown when enabling */}
          {showPinSetup && (
            <View style={styles.pinSetupBox}>
              <Text style={styles.pinSetupHint}>
                أدخل رمزًا مكونًا من 4 أرقام
              </Text>
              <TextInput
                style={styles.pinInput}
                value={newPin}
                onChangeText={t => { setNewPin(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                placeholder="الرمز الجديد"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                textAlign="center"
              />
              <TextInput
                style={styles.pinInput}
                value={confirmPin}
                onChangeText={t => { setConfirmPin(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                placeholder="تأكيد الرمز"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                textAlign="center"
              />
              {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
              <View style={styles.pinActions}>
                <TouchableOpacity
                  style={[styles.pinBtn, styles.pinBtnCancel]}
                  onPress={() => { setShowPinSetup(false); setNewPin(''); setConfirmPin(''); setPinError(''); }}
                >
                  <Text style={styles.pinBtnText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pinBtn, styles.pinBtnConfirm]} onPress={handleSetPin}>
                  <Text style={[styles.pinBtnText, { color: '#fff' }]}>تأكيد</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Change PIN link — shown when already configured */}
          {pinConfigured && !showPinSetup && (
            <>
              <Divider />
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => { setShowPinSetup(true); setNewPin(''); setConfirmPin(''); }}
              >
                <FontAwesome name="lock" size={14} color={Colors.primary} />
                <Text style={styles.linkText}>تغيير رمز الدخول</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ─── Save button ────────────────── */}
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={handleSave}
        >
          <FontAwesome name={saved ? 'check' : 'save'} size={16} color={Colors.textInverse} />
          <Text style={styles.saveBtnText}>{saved ? 'تم الحفظ ✔' : 'حفظ الإعدادات'}</Text>
        </TouchableOpacity>

        {/* ─── App info ─────────────────── */}
        <Text style={styles.version}>SafeInspect v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ─────────────────────────────────────

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        textAlign="right"
      />
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs }} />;
}

const fieldStyles = StyleSheet.create({
  wrap:  { paddingVertical: Spacing.sm },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, textAlign: 'right' },
  input: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  switchLabel: { flex: 1, fontSize: FontSize.lg, color: Colors.textPrimary, textAlign: 'right' },
  // PIN setup
  pinSetupBox: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  pinSetupHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
    letterSpacing: 12,
    backgroundColor: Colors.background,
  },
  pinError: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    textAlign: 'center',
  },
  pinActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pinBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  pinBtnCancel: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinBtnConfirm: {
    backgroundColor: Colors.primary,
  },
  pinBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  linkText: {
    fontSize: FontSize.base,
    color: Colors.primary,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  saveBtnDone: { backgroundColor: Colors.success },
  saveBtnText: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: '700' },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
  },
});
