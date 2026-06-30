// app/screens/inspector-profile.tsx — Inspector Profile Screen
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';

interface ProfileData {
  fullName: string;
  badgeNumber: string;
  office: string;
  phone: string;
  email: string;
  role: 'inspector' | 'supervisor';
}

const DEFAULT_PROFILE: ProfileData = {
  fullName: '',
  badgeNumber: '',
  office: '',
  phone: '',
  email: '',
  role: 'inspector',
};

function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '؟';
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

export default function InspectorProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [stats, setStats] = useState({ total: 0, avgGrade: '—', openCaps: 0 });
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      Promise.all([
        SettingsRepository.getAll(),
        InspectionRepository.getCompleted(),
        CorrectiveActionRepository.getOpen(),
      ]).then(([all, inspections, openCapsList]) => {
        if (!active) return;

        setProfile({
          fullName:    all['profile_fullName']    || '',
          badgeNumber: all['profile_badgeNumber'] || '',
          office:      all['profile_office']      || '',
          phone:       all['profile_phone']       || '',
          email:       all['profile_email']       || '',
          role:        (all['profile_role'] as 'inspector' | 'supervisor') || 'inspector',
        });

        const grades = inspections.map(i => i.score ?? 0).filter(s => s > 0);
        const avg = grades.length
          ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
          : null;
        const gradeLabel = avg !== null
          ? avg >= 90 ? 'A' : avg >= 75 ? 'B' : avg >= 60 ? 'C' : 'D'
          : '—';
        setStats({ total: inspections.length, avgGrade: gradeLabel, openCaps: openCapsList.length });
      });

      return () => { active = false; };
    }, [])
  );

  const handleSave = async () => {
    if (!profile.fullName.trim()) {
      Alert.alert('خطأ', 'الاسم الكامل مطلوب');
      return;
    }
    setSaving(true);
    await SettingsRepository.set('profile_fullName',    profile.fullName);
    await SettingsRepository.set('profile_badgeNumber', profile.badgeNumber);
    await SettingsRepository.set('profile_office',      profile.office);
    await SettingsRepository.set('profile_phone',       profile.phone);
    await SettingsRepository.set('profile_email',       profile.email);
    await SettingsRepository.set('profile_role',        profile.role);
    setSaving(false);
    Alert.alert('', 'تم حفظ الملف الشخصي بنجاح ✓');
  };

  const field = (key: keyof ProfileData) => ({
    value: profile[key] as string,
    onChangeText: (v: string) => setProfile(p => ({ ...p, [key]: v })),
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.headerBg}>
          <AvatarInitials name={profile.fullName} />
          <Text style={styles.headerName}>{profile.fullName || 'الملف الشخصي'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {profile.role === 'supervisor' ? '🎖 مشرف' : '🔍 مفتش'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>تفتيش</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.avgGrade}</Text>
            <Text style={styles.statLabel}>متوسط الدرجة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, stats.openCaps > 0 && { color: '#e74c3c' }]}>
              {stats.openCaps}
            </Text>
            <Text style={styles.statLabel}>إجراءات مفتوحة</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>البيانات الشخصية</Text>

          <Text style={styles.label}>الاسم الكامل *</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل الاسم الكامل"
            textAlign="right"
            {...field('fullName')}
          />

          <Text style={styles.label}>رقم الشارة</Text>
          <TextInput
            style={styles.input}
            placeholder="رقم الشارة الوظيفية"
            textAlign="right"
            keyboardType="numeric"
            {...field('badgeNumber')}
          />

          <Text style={styles.label}>المكتب / الوحدة</Text>
          <TextInput
            style={styles.input}
            placeholder="مكتب أو وحدة العمل"
            textAlign="right"
            {...field('office')}
          />

          <Text style={styles.label}>الهاتف</Text>
          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            textAlign="right"
            keyboardType="phone-pad"
            {...field('phone')}
          />

          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني"
            textAlign="right"
            keyboardType="email-address"
            autoCapitalize="none"
            {...field('email')}
          />
        </View>

        {/* Role Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>الدور الوظيفي</Text>
          <View style={styles.roleRow}>
            {(['inspector', 'supervisor'] as const).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, profile.role === r && styles.roleBtnActive]}
                onPress={() => setProfile(p => ({ ...p, role: r }))}
              >
                <Text style={[styles.roleBtnText, profile.role === r && styles.roleBtnTextActive]}>
                  {r === 'inspector' ? '🔍 مفتش' : '🎖 مشرف'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'جاري الحفظ...' : 'حفظ الملف الشخصي'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f0f4f0' },
  headerBg:    { backgroundColor: '#2c7a4b', alignItems: 'center', paddingTop: 52,
                 paddingBottom: 28, gap: 8 },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)',
                 alignItems: 'center', justifyContent: 'center', borderWidth: 2,
                 borderColor: 'rgba(255,255,255,0.5)' },
  avatarText:  { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerName:  { fontSize: 20, fontWeight: '700', color: '#fff' },
  roleBadge:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
                 paddingHorizontal: 12, paddingVertical: 4 },
  roleBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow:    { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16,
                 marginTop: -16, borderRadius: 12, padding: 16, shadowColor: '#000',
                 shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
                 shadowRadius: 4, elevation: 3, justifyContent: 'space-around' },
  statBox:     { alignItems: 'center', flex: 1 },
  statValue:   { fontSize: 22, fontWeight: '800', color: '#2c7a4b' },
  statLabel:   { fontSize: 11, color: '#888', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#e0e0e0' },
  card:        { backgroundColor: '#fff', margin: 16, marginTop: 12, borderRadius: 12,
                 padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                 shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', textAlign: 'right',
                  marginBottom: 12 },
  label:       { fontSize: 13, color: '#555', textAlign: 'right', marginBottom: 4, marginTop: 8 },
  input:       { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10,
                 fontSize: 14, color: '#1a1a2e', backgroundColor: '#fafafa' },
  roleRow:     { flexDirection: 'row', gap: 10 },
  roleBtn:     { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                 paddingVertical: 10, alignItems: 'center', backgroundColor: '#fafafa' },
  roleBtnActive: { borderColor: '#2c7a4b', backgroundColor: '#eaf6ef' },
  roleBtnText: { fontSize: 14, color: '#555', fontWeight: '600' },
  roleBtnTextActive: { color: '#2c7a4b' },
  saveBtn:     { margin: 16, backgroundColor: '#2c7a4b', borderRadius: 10,
                 paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
