// app/screens/settings.tsx
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const STORAGE_KEYS = {
  inspectorName: '@settings/inspectorName',
  organisation:  '@settings/organisation',
  department:    '@settings/department',
  showGrade:     '@settings/showGrade',
  signature:     '@signature',
} as const;

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const router = useRouter();

  const [inspectorName, setInspectorName] = useState('');
  const [organisation,  setOrganisation]  = useState('');
  const [department,    setDepartment]    = useState('');
  const [showGrade,     setShowGrade]     = useState(true);
  const [saved,         setSaved]         = useState(false);

  // ─── Load persisted settings ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [name, org, dept, grade] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.inspectorName),
          AsyncStorage.getItem(STORAGE_KEYS.organisation),
          AsyncStorage.getItem(STORAGE_KEYS.department),
          AsyncStorage.getItem(STORAGE_KEYS.showGrade),
        ]);
        if (name)  setInspectorName(name);
        if (org)   setOrganisation(org);
        if (dept)  setDepartment(dept);
        if (grade !== null) setShowGrade(grade === 'true');
      } catch (e) {
        console.warn('Settings load error', e);
      }
    })();
  }, []);

  // ─── Save ────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.inspectorName, inspectorName.trim()],
        [STORAGE_KEYS.organisation,  organisation.trim()],
        [STORAGE_KEYS.department,    department.trim()],
        [STORAGE_KEYS.showGrade,     String(showGrade)],
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      Alert.alert('خطأ', 'تعذّر حفظ الإعدادات');
    }
  };

  // ─── Reset signature ─────────────────────────────────────────
  const handleResetSignature = () => {
    Alert.alert(
      'حذف التوقيع',
      'هل تريد حذف التوقيع المحفوظ؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEYS.signature);
            Alert.alert('تم', 'تم حذف التوقيع');
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

        {/* ─── Inspector Info ─────────────────── */}
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
            label="المؤسسة / الهيئة"
            value={organisation}
            onChange={setOrganisation}
            placeholder="مديرية التجارة ..."
          />
          <Divider />
          <Field
            label="المصلحة / القسم"
            value={department}
            onChange={setDepartment}
            placeholder="مصلحة حماية المستهلك ..."
          />
        </View>

        {/* ─── Report Options ─────────────────── */}
        <Text style={styles.sectionTitle}>خيارات التقرير</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Switch
              value={showGrade}
              onValueChange={setShowGrade}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.textInverse}
            />
            <Text style={styles.switchLabel}>إظهار التنقيط (A – D) في التقارير</Text>
          </View>
        </View>

        {/* ─── Signature ──────────────────────── */}
        <Text style={styles.sectionTitle}>التوقيع</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerRow} onPress={handleResetSignature}>
            <FontAwesome name="trash" size={16} color={Colors.danger} />
            <Text style={styles.dangerText}>حذف التوقيع المحفوظ</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Save button ────────────────────── */}
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={handleSave}
        >
          <FontAwesome name={saved ? 'check' : 'save'} size={16} color={Colors.textInverse} />
          <Text style={styles.saveBtnText}>{saved ? 'تم الحفظ ✔' : 'حفظ الإعدادات'}</Text>
        </TouchableOpacity>

        {/* ─── App info ───────────────────────── */}
        <Text style={styles.version}>SafeInspect v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────

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
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    justifyContent: 'flex-end',
  },
  dangerText: { fontSize: FontSize.lg, color: Colors.danger },
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
