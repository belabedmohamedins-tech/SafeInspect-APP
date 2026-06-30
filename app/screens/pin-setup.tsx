// app/screens/pin-setup.tsx
//
// PIN setup flow — two steps:
//   Step 1: user enters a new 4-digit PIN.
//   Step 2: user confirms it.
//   Match → AuthRepository.setPin(pin) → go back to settings.
//   Mismatch → shake + reset to step 1.
//
// Also handles PIN removal: if the user navigates here with
// the query param `action=remove`, the current PIN is cleared.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
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
import { AuthRepository } from '../../src/repositories/AuthRepository';

const PIN_LENGTH = 4;

const DIGIT_KEYS: (string | 'backspace')[] = [
  '1','2','3',
  '4','5','6',
  '7','8','9',
  '','0','backspace',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PinDots({ filled, shake }: { filled: number; shake: Animated.Value }) {
  return (
    <Animated.View
      style={[
        styles.dotsRow,
        {
          transform: [{
            translateX: shake.interpolate({
              inputRange:  [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, -10,   10,  -10,  0],
            }),
          }],
        },
      ]}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < filled ? styles.dotFilled : styles.dotEmpty]}
        />
      ))}
    </Animated.View>
  );
}

function KeypadButton({
  label,
  onPress,
  disabled,
}: {
  label: string | 'backspace' | '';
  onPress: () => void;
  disabled: boolean;
}) {
  if (label === '') return <View style={styles.keyEmpty} />;

  if (label === 'backspace') {
    return (
      <TouchableOpacity
        style={[styles.key, styles.keyIcon, disabled && styles.keyDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="backspace-outline" size={26} color="#4a8fa8" />
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

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PinSetupScreen() {
  const router = useRouter();
  const { action } = useLocalSearchParams<{ action?: string }>();

  const [step,    setStep]    = useState<'enter' | 'confirm'>('enter');
  const [pin,     setPin]     = useState('');
  const [first,   setFirst]   = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    shake.setValue(0);
    Animated.timing(shake, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => shake.setValue(0));
    if (Platform.OS !== 'web') Vibration.vibrate(400);
  }, [shake]);

  const handleKey = useCallback(async (key: string | 'backspace' | '') => {
    if (key === '' || success) return;
    setError('');

    if (key === 'backspace') {
      setPin(p => p.slice(0, -1));
      return;
    }

    const next = pin + key;
    setPin(next);

    if (next.length < PIN_LENGTH) return;

    // PIN complete
    if (step === 'enter') {
      // Move to confirmation step
      setFirst(next);
      setPin('');
      setStep('confirm');
    } else {
      // Confirm step — compare
      if (next === first) {
        // ✓ Match — save and exit
        await AuthRepository.setPin(next);
        setSuccess(true);
        setPin('');
        setTimeout(() => router.back(), 800);
      } else {
        // ✗ Mismatch — reset to step 1
        triggerShake();
        setPin('');
        setFirst('');
        setStep('enter');
        setError('الرمزان غير متطابقَين — أعد المحاولة');
      }
    }
  }, [pin, step, first, success, triggerShake, router]);

  const title = success
    ? 'تم تفعيل القفل ✓'
    : step === 'enter'
      ? 'أدخل رمز PIN الجديد'
      : 'أكّد رمز PIN';

  const inputDisabled = success || pin.length === PIN_LENGTH;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Back button */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4a8fa8" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons
              name={success ? 'checkmark-circle' : 'lock-open-outline'}
              size={40}
              color={success ? '#4caf50' : '#4a8fa8'}
            />
          </View>
          <Text style={styles.appName}>إعداد قفل PIN</Text>
          <Text style={styles.subtitle}>{title}</Text>
        </View>

        {/* Step indicator */}
        {!success && (
          <View style={styles.steps}>
            <View style={[styles.stepDot, step === 'enter'   && styles.stepDotActive]} />
            <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
          </View>
        )}

        {/* Dots */}
        <PinDots filled={pin.length} shake={shake} />

        {/* Error */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.hintText}>
            {!success && step === 'confirm' ? 'أعد إدخال الرمز للتأكيد' : ' '}
          </Text>
        )}

        {/* Keypad */}
        {!success && (
          <View style={styles.keypad}>
            {DIGIT_KEYS.map((key, idx) => (
              <KeypadButton
                key={idx}
                label={key}
                onPress={() => handleKey(key)}
                disabled={inputDisabled}
              />
            ))}
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#0f2d3b' },
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center',
                paddingHorizontal: 32, gap: 24 },

  back: { position: 'absolute', top: 16, left: 16, padding: 8 },

  header:     { alignItems: 'center', gap: 8 },
  logoCircle: { width: 80, height: 80, borderRadius: 40,
                backgroundColor: 'rgba(74,143,168,0.15)',
                borderWidth: 1.5, borderColor: 'rgba(74,143,168,0.4)',
                alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  appName:    { fontSize: 22, fontWeight: '700', color: '#e8f4f8', letterSpacing: 0.5 },
  subtitle:   { fontSize: 14, color: '#6fa8be' },

  steps:      { flexDirection: 'row', gap: 8 },
  stepDot:    { width: 8, height: 8, borderRadius: 4,
                backgroundColor: 'rgba(74,143,168,0.3)' },
  stepDotActive: { backgroundColor: '#4a8fa8' },

  dotsRow:    { flexDirection: 'row', gap: 20 },
  dot:        { width: 18, height: 18, borderRadius: 9 },
  dotEmpty:   { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#4a8fa8' },
  dotFilled:  { backgroundColor: '#4a8fa8' },

  errorText:  { fontSize: 13, color: '#e57373', textAlign: 'center', minHeight: 20 },
  hintText:   { fontSize: 13, color: '#6fa8be', textAlign: 'center', minHeight: 20 },

  keypad:     { width: '100%', maxWidth: 300, flexDirection: 'row',
                flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  key:        { width: 80, height: 80, borderRadius: 40,
                backgroundColor: 'rgba(74,143,168,0.12)',
                borderWidth: 1, borderColor: 'rgba(74,143,168,0.25)',
                alignItems: 'center', justifyContent: 'center' },
  keyPressed: { backgroundColor: 'rgba(74,143,168,0.35)' },
  keyIcon:    { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyEmpty:   { width: 80, height: 80 },
  keyDisabled:{ opacity: 0.3 },
  keyLabel:   { fontSize: 26, fontWeight: '400', color: '#e8f4f8' },
});
