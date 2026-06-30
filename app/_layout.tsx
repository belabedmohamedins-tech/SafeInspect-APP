// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nProvider } from '../src/i18n';
import { AuthRepository } from '../src/repositories/AuthRepository';
import { SettingsRepository } from '../src/repositories/SettingsRepository';
import { initializeDatabase } from '../src/db/schema';
import { startSyncScheduler } from '../src/db/syncEngine';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [dbReady, setDbReady] = useState(false);

  // ── 1. Initialize DB and sync scheduler on app start ──────────────────────
  useEffect(() => {
    let stopSync: (() => void) | undefined;

    initializeDatabase()
      .then(() => {
        setDbReady(true);
        stopSync = startSyncScheduler(30_000);
      })
      .catch((err) => {
        console.error('[RAQIB] Database initialization failed:', err);
      });

    return () => {
      stopSync?.();
    };
  }, []);

  // ── 2. Single auth guard — runs once after DB is ready ────────────────────
  //
  // Decision tree:
  //   a. onboardingDone not set → /screens/onboarding  (first-run)
  //   b. PIN set in SecureStore → /pin-lock             (must authenticate)
  //   c. otherwise             → /(tabs)/home           (straight in)
  //
  // Uses AuthRepository.getPin() for PIN (SecureStore) and
  // SettingsRepository.getAll() for arbitrary string flags (AsyncStorage).
  // These are the only two correct read paths — do NOT mix them.
  useEffect(() => {
    if (!dbReady) return;

    (async () => {
      const currentPath = segments.join('/');

      // ── 2a. Onboarding ────────────────────────────────────────────────────
      const all = await SettingsRepository.getAll();
      if (all['onboardingDone'] !== 'true') {
        if (!currentPath.includes('onboarding')) {
          router.replace('/screens/onboarding');
        }
        return;
      }

      // ── 2b. PIN guard ─────────────────────────────────────────────────────
      // PIN lives in SecureStore — only AuthRepository.getPin() can read it.
      const pin = await AuthRepository.getPin();
      if (pin && !currentPath.includes('pin-lock')) {
        router.replace('/pin-lock');
        return;
      }

      // ── 2c. All clear ─────────────────────────────────────────────────────
      if (!currentPath.includes('(tabs)')) {
        router.replace('/(tabs)/home');
      }
    })();
  }, [dbReady]);

  return (
    <I18nProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Auth screens — gesture swipe-back disabled so users cannot bypass */}
        <Stack.Screen name="pin-lock" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="screens/onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        {/* App screens */}
        <Stack.Screen name="screens/notifications" options={{ headerShown: false }} />
        <Stack.Screen name="screens/inspector-profile" options={{ headerShown: false }} />
        <Stack.Screen name="screens/approval-queue" options={{ headerShown: false }} />
        <Stack.Screen name="screens/approval-detail" options={{ headerShown: false }} />
        <Stack.Screen name="screens/stats" options={{ headerShown: false }} />
        <Stack.Screen name="screens/cap" options={{ headerShown: false }} />
        <Stack.Screen name="screens/audit-log" options={{ headerShown: false }} />
        <Stack.Screen name="screens/backup" options={{ headerShown: false }} />
        <Stack.Screen name="screens/settings" options={{ headerShown: false }} />
        <Stack.Screen name="screens/brief" options={{ headerShown: false }} />
        <Stack.Screen name="screens/geofence-check" options={{ headerShown: false }} />
        <Stack.Screen name="screens/signature" options={{ headerShown: false }} />
        <Stack.Screen name="screens/map" options={{ headerShown: false }} />
        <Stack.Screen name="screens/legal" options={{ headerShown: false }} />
        <Stack.Screen name="screens/checklists" options={{ headerShown: false }} />
        <Stack.Screen name="screens/reports" options={{ headerShown: false }} />
        {/* reports/[id] is auto-registered by expo-router file system — do NOT add it here */}
      </Stack>
    </I18nProvider>
  );
}
