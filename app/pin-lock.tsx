// app/pin-lock.tsx
//
// PIN lock screen — shown by app/index.tsx when a PIN is configured.
//
// Flow:
//   1. On mount: if biometric is enabled + available → try biometric first.
//   2. User enters 4-digit PIN via keypad.
//   3. Correct → reset failed attempts → navigate to /(tabs)/home.
//   4. Wrong   → increment failed attempts.
//              → after MAX_ATTEMPTS (5) → lockout state (no more input).
//   5. Lockout message explains the user must contact admin to reset
//      (or reinstall — acceptable for a local-only app).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthRepository } from '../src/repositories/AuthRepository';

// ─── Constants ───────────────────────────────────────────────────────────────

const PIN_LENGTH = 4;
const MAX   = AuthRepository.MAX_ATTEMPTS;

const KEYS: (string | 'backspace' | 'biometric')[] = [
  '1','2','3',
  '4','5','6',
  '7','8','9',
  'biometric','0','backspace',
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function PinDots({ filled, shake }: { filled: number; shake: Animated.Value }) {
  return (
    <Animated.View
      style={[
        styles.dotsRow,
        {
          transform: [{
            translateX: shake.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, -10, 10, -10, 0],
            }),
          }],
        },
      ]}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < filled ? styles.dotFilled : styles.dotEmpty,
          ]}
        />
      ))}
    </Animated.View>
  );
}

function KeypadButton({
  label,
  onPress,
  disabled,
  biometricType,
}: {
  label: string | 'backspace' | 'biometric';
  onPress: () => void;
  disabled: boolean;
  biometricType: string;
}) {
  if (label === 'biometric') {
    const icon = biometricType === 'FACE_RECOGNITION'
      ? 'scan-outline'
      : biometricType === 'FINGERPRINT'
        ? 'finger-print-outline'
        : null;
    if (!icon) return <View style={styles.keyEmpty} />;
    return (
      <TouchableOpacity
        style={[styles.key, styles.keyIcon, disabled && styles.keyDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name={icon as any} size={28} color="#a0c4d8" />
      </TouchableOpacity>
    );
  }

  if (label === 'backspace') {
    return (
      <TouchableOpacity
        style={[styles.key, styles.keyIcon, disabled && styles.keyDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="backspace-outline" size={26} color="#a0c4d8" />
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.key,
        pressed && styles.keyPressed,
        disabled && styles.keyDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.keyLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function PinLockScreen() {
  const router = useRouter();

  const [pin,           setPin]           = useState('');
  const [attempts,      setAttempts]      = useState(0);
  const [isLockedOut,   setIsLockedOut]   = useState(false);
  const [bioAvailable,  setBioAvailable]  = useState(false);
  const [bioEnabled,    setBioEnabled]    = useState(false);
  const [biometricType, setBiometricType] = useState('none');
  const [error,         setError]         = useState('');

  const shake = useRef(new Animated.Value(0)).current;

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const [locked, biometricEnabled, biometricAvailable, bioType, currentAttempts] =
        await Promise.all([
          AuthRepository.isLockedOut(),
          AuthRepository.isBiometricEnabled(),
          AuthRepository.isBiometricAvailable(),
          AuthRepository.getBiometricType(),
          AuthRepository.getFailedAttempts(),
        ]);

      setIsLockedOut(locked);
      setBioEnabled(biometricEnabled);
      setBioAvailable(biometricAvailable);
      setBiometricType(bioType);
      setAttempts(currentAttempts);

      // Auto-trigger biometric if enabled and available
      if (!locked && biometricEnabled && biometricAvailable) {
        handleBiometric();
      }
    };
    init();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const triggerShake = useCallback(() => {
    shake.setValue(0);
    Animated.timing(shake, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => shake.setValue(0));
    if (Platform.OS !== 'web') Vibration.vibrate(400);
  }, [shake]);

  const handleSuccess = useCallback(async () => {
    await AuthRepository.resetFailedAttempts();
    router.replace('/(tabs)/home');
  }, [router]);

  const handleBiometric = useCallback(async () => {
    const ok = await AuthRepository.authenticateWithBiometric();
    if (ok) {
      handleSuccess();
    } else {
      setError('فشل التحقق البيومتري — أدخل الرمز يدوياً');
    }
  }, [handleSuccess]);

  // ── PIN input ─────────────────────────────────────────────────────────────
  const handleKey = useCallback(async (key: string) => {
    setError('');

    if (key === 'biometric') {
      handleBiometric();
      return;
    }

    if (key === 'backspace') {
      setPin(p => p.slice(0, -1));
      return;
    }

    const next = pin + key;
    setPin(next);

    if (next.length < PIN_LENGTH) return;

    // PIN complete — validate
    const stored = await AuthRepository.getPin();
    if (next === stored) {
      setPin('');
      handleSuccess();
    } else {
      setPin('');
      triggerShake();
      const newAttempts = await AuthRepository.incrementFailedAttempts();
      setAttempts(newAttempts);
      if (newAttempts >= MAX) {
        setIsLockedOut(true);
      } else {
        setError(`رمز خاطئ — ${MAX - newAttempts} محاولة متبقية`);
      }
    }
  }, [pin, handleBiometric, handleSuccess, triggerShake]);

  // ── Render ────────────────────────────────────────────────────────────────
  const inputDisabled = isLockedOut || pin.length === PIN_LENGTH;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Logo / title */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={40} color="#4a8fa8" />
          </View>
          <Text style={styles.appName}>SafeInspect</Text>
          <Text style={styles.subtitle}>أدخل رمز PIN للمتابعة</Text>
        </View>

        {/* Dots */}
        <PinDots filled={pin.length} shake={shake} />

        {/* Error / lockout message */}
        {isLockedOut ? (
          <View style={styles.lockoutBox}>
            <Ionicons name="lock-closed" size={20} color="#e57373" />
            <Text style={styles.lockoutText}>
              تم تجاوز الحد الأقصى للمحاولات.{`\n`}
              يرجى التواصل مع المسؤول أو إعادة تثبيت التطبيق.
            </Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.attemptsHint}>
            {attempts > 0 ? `${attempts}/${MAX} محاولات خاطئة` : ' '}
          </Text>
        )}

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYS.map((key) => (
            <KeypadButton
              key={String(key)}
              label={key as string}
              onPress={() => handleKey(key as string)}
              disabled={inputDisabled || isLockedOut}
              biometricType={
                bioEnabled && bioAvailable ? biometricType : 'none'
              }
            />
          ))}
        </View>

        {/* Biometric hint */}
        {bioEnabled && bioAvailable && !isLockedOut && (
          <TouchableOpacity
            style={styles.bioHint}
            onPress={handleBiometric}
            activeOpacity={0.7}
          >
            <Text style={styles.bioHintText}>
              {biometricType === 'FACE_RECOGNITION'
                ? 'تسجيل الدخول بالوجه'
                : 'تسجيل الدخول بالبصمة'}
            </Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    gap: 28,
  },

  // Header
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74,143,168,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(74,143,168,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e8f4f8',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6fa8be',
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4a8fa8',
  },
  dotFilled: {
    backgroundColor: '#4a8fa8',
  },

  // Error / hints
  errorText: {
    fontSize: 13,
    color: '#e57373',
    textAlign: 'center',
    minHeight: 20,
  },
  attemptsHint: {
    fontSize: 13,
    color: '#6fa8be',
    textAlign: 'center',
    minHeight: 20,
  },
  lockoutBox: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(229,115,115,0.1)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(229,115,115,0.3)',
    maxWidth: 300,
  },
  lockoutText: {
    flex: 1,
    fontSize: 13,
    color: '#e57373',
    textAlign: 'right',
    lineHeight: 20,
  },

  // Keypad
  keypad: {
    width: '100%',
    maxWidth: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74,143,168,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,143,168,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: 'rgba(74,143,168,0.35)',
  },
  keyIcon: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  keyEmpty: {
    width: 80,
    height: 80,
  },
  keyDisabled: {
    opacity: 0.3,
  },
  keyLabel: {
    fontSize: 26,
    fontWeight: '400',
    color: '#e8f4f8',
  },

  // Biometric hint
  bioHint: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bioHintText: {
    fontSize: 13,
    color: '#4a8fa8',
    textDecorationLine: 'underline',
  },
});
