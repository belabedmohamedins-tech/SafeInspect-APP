// app/pin-lock.tsx
//
// Full-screen authentication gate.
// Priority order on mount:
//   1. Biometric enabled + available  → prompt immediately
//   2. Biometric success              → navigate to home
//   3. Biometric fail / cancel        → fall back to PIN pad
//   4. Correct PIN                    → navigate to home
//   5. MAX_ATTEMPTS wrong PINs        → lockout screen

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthRepository } from '../src/repositories/AuthRepository';

const PIN_LENGTH = 4;

const PAD_KEYS: (string | null)[] = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  null, '0', 'del',
];

type BiometricType = 'FACE_RECOGNITION' | 'FINGERPRINT' | 'IRIS' | 'none';

export default function PinLockScreen() {
  const router = useRouter();

  const [entered,        setEntered]        = useState('');
  const [error,          setError]          = useState(false);
  const [attempts,       setAttempts]       = useState(0);
  const [isLockedOut,    setIsLockedOut]    = useState(false);
  const [bioAvailable,   setBioAvailable]   = useState(false);
  const [bioType,        setBioType]        = useState<BiometricType>('none');
  const [bioPrompting,   setBioPrompting]   = useState(false);

  // ── Navigate home after successful auth ─────────────────────────
  const goHome = useCallback(async () => {
    await AuthRepository.resetFailedAttempts();
    router.replace('/(tabs)/home');
  }, [router]);

  // ── Biometric prompt ─────────────────────────────────────────
  const triggerBiometric = useCallback(async () => {
    setBioPrompting(true);
    const success = await AuthRepository.authenticateWithBiometric();
    setBioPrompting(false);
    if (success) {
      goHome();
    }
    // On fail/cancel: do nothing — PIN pad is already visible
  }, [goHome]);

  // ── On mount: load state + auto-prompt biometric ────────────────
  useEffect(() => {
    (async () => {
      // Restore persisted attempt count
      const n = await AuthRepository.getFailedAttempts();
      setAttempts(n);
      if (n >= AuthRepository.MAX_ATTEMPTS) {
        setIsLockedOut(true);
        return;
      }

      // Check biometric availability + preference
      const available = await AuthRepository.isBiometricAvailable();
      const enabled   = await AuthRepository.isBiometricEnabled();

      if (available && enabled) {
        const type = await AuthRepository.getBiometricType() as BiometricType;
        setBioAvailable(true);
        setBioType(type);
        // Auto-prompt on cold open
        await triggerBiometric();
      }
    })();
  }, [triggerBiometric]);

  // ── PIN key handler ───────────────────────────────────────────
  const handleKey = useCallback(async (key: string) => {
    if (isLockedOut || bioPrompting) return;

    if (key === 'del') {
      setEntered(prev => prev.slice(0, -1));
      setError(false);
      return;
    }

    const next = entered + key;
    setEntered(next);
    if (next.length < PIN_LENGTH) return;

    // Validate full PIN
    const stored = await AuthRepository.getPin();
    if (next === stored) {
      goHome();
    } else {
      Vibration.vibrate(300);
      setError(true);
      setEntered('');
      const newCount = await AuthRepository.incrementFailedAttempts();
      setAttempts(newCount);
      if (newCount >= AuthRepository.MAX_ATTEMPTS) setIsLockedOut(true);
    }
  }, [entered, isLockedOut, bioPrompting, goHome]);

  // ── Biometric icon label ──────────────────────────────────────
  const bioIcon = bioType === 'FACE_RECOGNITION' ? '🙃' : '👆';
  const bioLabel = bioType === 'FACE_RECOGNITION'
    ? 'الدخول بالوجه'
    : 'الدخول بالبصمة';

  const remaining = Math.max(0, AuthRepository.MAX_ATTEMPTS - attempts);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <Text style={styles.title}>SafeInspect</Text>
        <Text style={styles.subtitle}>
          {isLockedOut ? 'الحساب مقفل' : 'أدخل رمز الدخول'}
        </Text>

        {/* ── Lockout state ── */}
        {isLockedOut ? (
          <View style={styles.lockoutBox}>
            <Text style={styles.lockoutText}>
              تم إيقاف الحساب بعد {AuthRepository.MAX_ATTEMPTS} محاولات فاشلة.{
              `\n`}تواصل مع المسؤول لإعادة التعيين.
            </Text>
          </View>
        ) : (
          <>
            {/* ── Biometric prompt spinner ── */}
            {bioPrompting && (
              <View style={styles.bioPrompting}>
                <ActivityIndicator size="large" color="#4a8fa8" />
                <Text style={styles.bioPromptText}>{bioLabel}…</Text>
              </View>
            )}

            {/* ── PIN dots ── */}
            {!bioPrompting && (
              <>
                <View style={styles.dotsRow}>
                  {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i < entered.length && styles.dotFilled,
                        error && styles.dotError,
                      ]}
                    />
                  ))}
                </View>

                {error && (
                  <Text style={styles.errorText}>
                    رمز خاطئ — {remaining} محاولة{remaining === 1 ? '' : ' '}متبقية
                  </Text>
                )}

                {/* ── Numeric pad ── */}
                <View style={styles.pad}>
                  {PAD_KEYS.map((key, idx) => {
                    if (key === null) return <View key={idx} style={styles.padKey} />;
                    if (key === 'del') {
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={styles.padKey}
                          onPress={() => handleKey('del')}
                          accessibilityLabel="حذف"
                        >
                          <Text style={styles.delLabel}>⌫</Text>
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <Pressable
                        key={idx}
                        style={({ pressed }) => [
                          styles.padKey,
                          pressed && styles.padKeyPressed,
                        ]}
                        onPress={() => handleKey(key)}
                        accessibilityLabel={key}
                      >
                        <Text style={styles.padLabel}>{key}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* ── Biometric fallback button ── */}
                {bioAvailable && (
                  <TouchableOpacity
                    style={styles.bioBtn}
                    onPress={triggerBiometric}
                    accessibilityLabel={bioLabel}
                  >
                    <Text style={styles.bioIcon}>{bioIcon}</Text>
                    <Text style={styles.bioLabel}>{bioLabel}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f2d3b' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0bfc8',
    marginBottom: 40,
  },
  // Dots
  dotsRow: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#4a8fa8',
    backgroundColor: 'transparent',
  },
  dotFilled:  { backgroundColor: '#4a8fa8' },
  dotError:   { borderColor: '#e74c3c', backgroundColor: '#e74c3c' },
  errorText:  { color: '#e74c3c', fontSize: 13, marginBottom: 24, textAlign: 'center' },
  // Pad
  pad: {
    width: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  padKey: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#1a3f52',
    alignItems: 'center', justifyContent: 'center',
  },
  padKeyPressed: { backgroundColor: '#265a72' },
  padLabel:  { fontSize: 28, fontWeight: '600', color: '#e8f4f8' },
  delLabel:  { fontSize: 22, color: '#a0bfc8' },
  // Biometric
  bioPrompting: { alignItems: 'center', gap: 16, marginVertical: 24 },
  bioPromptText: { color: '#a0bfc8', fontSize: 15 },
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#4a8fa8',
  },
  bioIcon:  { fontSize: 20 },
  bioLabel: { color: '#4a8fa8', fontSize: 14, fontWeight: '600' },
  // Lockout
  lockoutBox: {
    backgroundColor: '#2d1515',
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
  },
  lockoutText: {
    color: '#e74c3c',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
