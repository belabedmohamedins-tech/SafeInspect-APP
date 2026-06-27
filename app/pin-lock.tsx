// app/pin-lock.tsx
//
// Full-screen PIN entry gate.
// Reached from app/index.tsx when a PIN is configured.
// On success → replaces to /(tabs)/home.
// On MAX_ATTEMPTS failures → shows lockout state.

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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

export default function PinLockScreen() {
  const router = useRouter();
  const [entered, setEntered]         = useState('');
  const [error, setError]             = useState(false);
  const [attempts, setAttempts]       = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Load initial failed-attempt count so UI reflects persisted state
  useEffect(() => {
    AuthRepository.getFailedAttempts().then(n => {
      setAttempts(n);
      if (n >= AuthRepository.MAX_ATTEMPTS) setIsLockedOut(true);
    });
  }, []);

  const handleKey = useCallback(async (key: string) => {
    if (isLockedOut) return;

    if (key === 'del') {
      setEntered(prev => prev.slice(0, -1));
      setError(false);
      return;
    }

    const next = entered + key;
    setEntered(next);

    if (next.length < PIN_LENGTH) return;

    // Full PIN entered — validate
    const stored = await AuthRepository.getPin();
    if (next === stored) {
      await AuthRepository.resetFailedAttempts();
      router.replace('/(tabs)/home');
    } else {
      Vibration.vibrate(300);
      setError(true);
      setEntered('');
      const newCount = await AuthRepository.incrementFailedAttempts();
      setAttempts(newCount);
      if (newCount >= AuthRepository.MAX_ATTEMPTS) {
        setIsLockedOut(true);
      }
    }
  }, [entered, isLockedOut, router]);

  const remaining = Math.max(0, AuthRepository.MAX_ATTEMPTS - attempts);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <Text style={styles.title}>SafeInspect</Text>
        <Text style={styles.subtitle}>
          {isLockedOut ? 'الحساب مقفل' : 'أدخل رمز الدخول'}
        </Text>

        {isLockedOut ? (
          <View style={styles.lockoutBox}>
            <Text style={styles.lockoutText}>
              تم إيقاف الحساب بعد {AuthRepository.MAX_ATTEMPTS} محاولات فاشلة.{`\n`}
              تواصل مع المسؤول لإعادة التعيين.
            </Text>
          </View>
        ) : (
          <>
            {/* PIN dots */}
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

            {/* Error message */}
            {error && (
              <Text style={styles.errorText}>
                رمز خاطئ — {remaining} محاولة{remaining === 1 ? '' : ' '} متبقية
              </Text>
            )}

            {/* Numeric pad */}
            <View style={styles.pad}>
              {PAD_KEYS.map((key, idx) => {
                if (key === null) {
                  return <View key={idx} style={styles.padKey} />;
                }
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
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f2d3b',
  },
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
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4a8fa8',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#4a8fa8',
  },
  dotError: {
    borderColor: '#e74c3c',
    backgroundColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
  },
  pad: {
    width: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  padKey: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1a3f52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  padKeyPressed: {
    backgroundColor: '#265a72',
  },
  padLabel: {
    fontSize: 28,
    fontWeight: '600',
    color: '#e8f4f8',
  },
  delLabel: {
    fontSize: 22,
    color: '#a0bfc8',
  },
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
