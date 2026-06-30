// app/screens/server-login.tsx
//
// Server login screen — inspector enters their ministry matricule + password
// once to activate cloud sync, push notifications, and supervisor approval.
//
// Flow:
//   onboarding done + PIN set → /(tabs)/home
//   server-login is optional; users can skip to use the app offline-only.
//   After successful login, the JWT is stored in SecureStore and all future
//   syncs are authenticated automatically.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../../src/services/serverAuth';

export default function ServerLoginScreen() {
  const router = useRouter();

  const [matricule, setMatricule]   = useState('');
  const [password,  setPassword]    = useState('');
  const [loading,   setLoading]     = useState(false);
  const [error,     setError]       = useState<string | null>(null);
  const [showPass,  setShowPass]    = useState(false);

  async function handleLogin() {
    const m = matricule.trim();
    const p = password.trim();

    if (!m || !p) {
      setError('يرجى إدخال رقم التسجيل وكلمة المرور');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(m, p);

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? 'فشل تسجيل الدخول');
      return;
    }

    // Success — go to home. Sync will pick up the token automatically.
    router.replace('/(tabs)/home');
  }

  function handleSkip() {
    // User chooses offline-only mode for now
    router.replace('/(tabs)/home');
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️</Text>
          <Text style={styles.title}>ربط الحساب بالخادم</Text>
          <Text style={styles.subtitle}>
            أدخل رقم تسجيلك الوزاري وكلمة المرور لتفعيل المزامنة
            وإشعارات الموافقة.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Matricule */}
          <Text style={styles.label}>رقم التسجيل الوزاري</Text>
          <TextInput
            style={styles.input}
            value={matricule}
            onChangeText={setMatricule}
            placeholder="مثال: INS-001"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
            textAlign="right"
            editable={!loading}
          />

          {/* Password */}
          <Text style={styles.label}>كلمة المرور</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="كلمة المرور"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              textAlign="right"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPass(v => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          ) : null}

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>تخطي — الاستخدام بدون إنترنت</Text>
          </TouchableOpacity>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          يمكنك تسجيل الدخول لاحقاً من الإعدادات.
          بياناتك المحلية محمية دائماً بالرقم السري.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    textAlign: 'right',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#F1F5F9',
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingLeft: 48,
  },
  eyeBtn: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorBox: {
    backgroundColor: '#7F1D1D22',
    borderWidth: 1,
    borderColor: '#EF444444',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'right',
  },
  loginBtn: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  skipText: {
    color: '#64748B',
    fontSize: 13,
  },
  footerNote: {
    marginTop: 40,
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
});
