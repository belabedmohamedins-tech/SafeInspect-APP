// app/index.tsx
//
// Entry-point / auth gate.
//
// Decision tree on every cold start:
//  1. No officeName   → onboarding (first-run setup)
//  2. PIN configured  → /pin-lock (must authenticate)
//  3. No PIN          → /(tabs)/home (directly)
//
// This keeps the gate logic in a single place so every future
// authentication method (biometric, session token) only needs
// to be wired here and in AuthRepository.

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthRepository } from '../src/repositories/AuthRepository';
import { SettingsRepository } from '../src/repositories/SettingsRepository';

export default function AuthGate() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        // Step 1: onboarding guard
        const { officeName } = await SettingsRepository.get();
        if (!officeName) {
          router.replace('/onboarding');
          return;
        }

        // Step 2: PIN guard
        const pin = await AuthRepository.getPin();
        if (pin) {
          router.replace('/pin-lock');
        } else {
          router.replace('/(tabs)/home');
        }
      } catch {
        router.replace('/onboarding');
      } finally {
        setIsChecking(false);
      }
    };
    check();
  }, []);

  if (!isChecking) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a8fa8" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0f2d3b' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
