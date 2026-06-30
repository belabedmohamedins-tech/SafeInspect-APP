// app/screens/inspector-profile.tsx — Inspector Profile Screen
import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';

interface ProfileData {
  fullName: string;
  badgeNumber: string;
  office: string;
  phone: string;
  email: string;
  role: 'inspector' | 'supervisor';
}

const DEFAULT_PROFILE: ProfileData = {
  fullName: '', badgeNumber: '', office: '', phone: '', email: '', role: 'inspector',
};

function AvatarInitials({ name }: { name: string }) {
  const initials = name.trim().split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0]).join('').toUpperCase() || '؟';
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
          ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;
        const gradeLabel = avg !== null
          ? avg >= 90 ? 'A' : avg >= 75 ? 'B' : avg >= 60 ? 'C' : 'D' : '—';
        setStats({ total: inspections.length, avgGrade: gradeLabel, openCaps: openCapsList.length });
      });
      return () => { active = false; };
    }, [])
  );

  const handleSave = async () => {
    if (!profile.fullName.trim()) { Alert.alert('خطأ', 'الاسم الكامل مطلوب'); return; }
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            <Text style={[styles.statValue, stats.openCaps > 0 && { color: Colors.danger }]}>
              {stats.openCaps}
            </Text>
            <Text style={styles.statLabel}>إجراءات مفتوحة</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>البيانات الشخصية</Text>
          <Text style={styles.label}>الاسم الكامل *</Text>
          <TextInput style={styles.input} placeholder="أدخل الاسم الكامل" textAlign="right" {...field('fullName')} />
          <Text style={styles.label}>رقم الشارة</Text>
          <TextInput style={styles.input} placeholder="رقم الشارة الوظيفية" textAlign="right" keyboardType="numeric" {...field('badgeNumber')} />
          <Text style={styles.label}>المكتب / الوحدة</Text>
          <TextInput style={styles.input} placeholder="مكتب أو وحدة العمل" textAlign="right" {...field('office')} />
          <Text style={styles.label}>الهاتف</Text>
          <TextInput style={styles.input} placeholder="رقم الهاتف" textAlign="right" keyboardType="phone-pad" {...field('phone')} />
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput style={styles.input} placeholder="البريد الإلكتروني" textAlign="right" keyboardType="email-address" autoCapitalize="none" {...field('email')} />
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
  container:    { flex: 1, backgroundColor: Colors.background },
  headerBg:     { backgroundColor: Colors.primary, alignItems: 'center', paddingTop: 52, paddingBottom: Spacing.xl, gap: Spacing.sm },
  avatar:       { width: 80, height: 80, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText:   { fontSize: 28, fontWeight: FontWeight.extrabold, color: Colors.textInverse },
  headerName:   { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textInverse },
  roleBadge:    { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.md,
                  paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  roleBadgeText:{ color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  statsRow:     { flexDirection: 'row', backgroundColor: Colors.surface, marginHorizontal: Spacing.md,
                  marginTop: -Spacing.lg, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.md,
                  justifyContent: 'space-around' },
  statBox:      { alignItems: 'center', flex: 1 },
  statValue:    { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  statLabel:    { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs },
  statDivider:  { width: 1, backgroundColor: Colors.border },
  card:         { backgroundColor: Colors.surface, margin: Spacing.md, marginTop: Spacing.sm,
                  borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary,
                  textAlign: 'right', marginBottom: Spacing.md },
  label:        { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right',
                  marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input:        { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
                  padding: Spacing.sm, fontSize: FontSize.base, color: Colors.textPrimary,
                  backgroundColor: Colors.background },
  roleRow:      { flexDirection: 'row', gap: Spacing.sm },
  roleBtn:      { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
                  paddingVertical: Spacing.sm, alignItems: 'center', backgroundColor: Colors.background },
  roleBtnActive:{ borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleBtnText:  { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  roleBtnTextActive: { color: Colors.primary },
  saveBtn:      { margin: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.md,
                  paddingVertical: Spacing.md, alignItems: 'center' },
  saveBtnText:  { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
