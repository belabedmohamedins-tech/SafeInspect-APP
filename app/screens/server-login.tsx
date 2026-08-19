// app/screens/server-login.tsx
//
// Server login screen — inspector enters their ministry matricule + password
// once to activate cloud sync, push notifications, and supervisor approval.
//
// Flow:
//   onboarding done + PIN set -> /(tabs)/home
//   server-login is optional; users can skip to use the app offline-only.
//   After successful login, the JWT is stored in SecureStore and all future
//   syncs are authenticated automatically.
//
// W95 (SPEC12-C): handleSkip() now persists StorageKeys.SERVER_LOGIN_SKIPPED = 'true'
// so that _layout.tsx's auth guard does not redirect the user back to this screen
// on every subsequent app launch. The skip is permanent until the user logs in
// (at which point isLoggedIn() returns true and the guard passes regardless).

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
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../../src/services/serverAuth';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { StorageKeys } from '../../src/repositories/keys';

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
      setError('\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(m, p);

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? '\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644');
      return;
    }

    // Success — go to home. Sync will pick up the token automatically.
    router.replace('/(tabs)/home');
  }

  async function handleSkip() {
    // W95 (SPEC12-C): persist the skip decision so _layout.tsx does not
    // redirect back to this screen on the next app launch.
    await SettingsRepository.set(StorageKeys.SERVER_LOGIN_SKIPPED, 'true');
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
          <Text style={styles.logo}>\uD83D\uDEE1\uFE0F</Text>
          <Text style={styles.title}>\u0631\u0628\u0637 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0627\u0644\u062E\u0627\u062F\u0645</Text>
          <Text style={styles.subtitle}>
            \u0623\u062F\u062E\u0644 \u0631\u0642\u0645 \u062A\u0633\u062C\u064A\u0644\u0643 \u0627\u0644\u0648\u0632\u0627\u0631\u064A \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0644\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629
            \u0648\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Matricule */}
          <Text style={styles.label}>\u0631\u0642\u0645 \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0648\u0632\u0627\u0631\u064A</Text>
          <TextInput
            style={styles.input}
            value={matricule}
            onChangeText={setMatricule}
            placeholder="\u0645\u062B\u0627\u0644: INS-001"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
            textAlign="right"
            editable={!loading}
          />

          {/* Password */}
          <Text style={styles.label}>\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"
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
              <Text style={styles.eyeIcon}>{showPass ? '\uD83D\uDE48' : '\uD83D\uDC41\uFE0F'}</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>\u26A0\uFE0F  {error}</Text>
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
              <Text style={styles.loginBtnText}>\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644</Text>
            )}
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>\u062A\u062E\u0637\u064A \u2014 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u062F\u0648\u0646 \u0625\u0646\u062A\u0631\u0646\u062A</Text>
          </TouchableOpacity>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          \u064A\u0645\u0643\u0646\u0643 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0627\u062D\u0642\u064B\u0627 \u0645\u0646 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A.
          \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0627\u0644\u0645\u062D\u0644\u064A\u0629 \u0645\u062D\u0645\u064A\u0629 \u062F\u0627\u0626\u0645\u064B\u0627 \u0628\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064A.
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
