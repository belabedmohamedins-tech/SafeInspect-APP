// app/_layout.tsx
import Constants from 'expo-constants';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AuthRepository } from '../src/repositories/AuthRepository';
import { initializeDatabase } from '../src/db/schema';
import { startSyncScheduler } from '../src/db/syncEngine';
import { I18nProvider } from '../src/i18n';
import { SettingsRepository } from '../src/repositories/SettingsRepository';

// ── Expo Go guard (mirrors CapNotificationService) ───────────────────────────────
const IS_EXPO_GO = Constants.appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;
try {
  if (!IS_EXPO_GO) {
    Notifications = require('expo-notifications');
  }
} catch (e) {
  console.warn('[_layout] expo-notifications unavailable:', e);
}

export default function RootLayout() {
  const router   = useRouter();
  const segments = useSegments();
  const [dbReady, setDbReady] = useState(false);

  // Sub ref so we can remove the listener on unmount
  const notifSubRef = useRef<ReturnType<
    typeof import('expo-notifications')['addNotificationResponseReceivedListener']
  > | null>(null);

  // ── 1. Initialize DB and sync scheduler on app start ────────────────────────
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

  // ── 2. Single auth guard — runs once after DB is ready ──────────────────────
  useEffect(() => {
    if (!dbReady) return;

    (async () => {
      const currentPath = segments.join('/');

      // 2a. Onboarding
      const all = await SettingsRepository.getAll();
      if (all['onboardingDone'] !== 'true') {
        if (!currentPath.includes('onboarding')) {
          router.replace('/screens/onboarding');
        }
        return;
      }

      // 2b. PIN guard
      const pin = await AuthRepository.getPin();
      if (pin && !currentPath.includes('pin-lock')) {
        router.replace('/pin-lock');
        return;
      }

      // 2c. All clear
      if (!currentPath.includes('(tabs)')) {
        router.replace('/(tabs)/home');
      }
    })();
  }, [dbReady]);

  // ── 3. Notification tap deep-link handler (Phase 15 + Phase 21) ──────────────
  //
  // Handles taps on any scheduled notification by reading its `data` payload.
  //
  // Supported payloads:
  //
  //   CAP notifications (per-item / daily digest / weekly digest):
  //     { screen: 'actions', filter: 'overdue' | 'all' }
  //     { screen: 'actions', capId: '<id>' }  ← per-item fallback
  //
  //   Agenda notifications (1-hour-before / morning-of):
  //     { agendaId: '<id>' }  ← navigates to the Agenda tab (Phase 21)
  //
  // No-op in Expo Go (Notifications is null there).
  useEffect(() => {
    if (!Notifications) return;

    notifSubRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const data = response.notification.request.content.data as Record<string, string> | undefined;
          if (!data) return;

          const screen = data.screen;

          // — CAP notifications —
          if (screen === 'actions') {
            const filter = data.filter as string | undefined;
            router.push({
              pathname: '/(tabs)/actions',
              params:   filter ? { filter } : {},
            });
            return;
          }

          // — Agenda notifications (Phase 21) —
          // Identifier pattern: "agenda-<id>-pre" or "agenda-<id>-day"
          // Payload: { agendaId: '<id>' }
          if (data.agendaId) {
            router.push({
              pathname: '/(tabs)/agenda',
              params:   { highlight: data.agendaId },
            });
            return;
          }

          // Future screens can be added here:
          // if (screen === 'reports') { router.push('/screens/reports'); }
        } catch (err) {
          console.warn('[_layout] notification tap handler error:', err);
        }
      },
    );

    return () => {
      notifSubRef.current?.remove();
    };
  }, []);

  return (
    <I18nProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Auth screens — gesture swipe-back disabled so users cannot bypass */}
        <Stack.Screen name="pin-lock" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="screens/onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        {/* App screens */}
        <Stack.Screen name="screens/notifications"      options={{ headerShown: false }} />
        <Stack.Screen name="screens/inspector-profile"  options={{ headerShown: false }} />
        <Stack.Screen name="screens/approval-queue"     options={{ headerShown: false }} />
        <Stack.Screen name="screens/approval-detail"    options={{ headerShown: false }} />
        <Stack.Screen name="screens/stats"              options={{ headerShown: false }} />
        <Stack.Screen name="screens/cap"                options={{ headerShown: false }} />
        <Stack.Screen name="screens/audit-log"          options={{ headerShown: false }} />
        <Stack.Screen name="screens/backup"             options={{ headerShown: false }} />
        <Stack.Screen name="screens/settings"           options={{ headerShown: false }} />
        <Stack.Screen name="screens/brief"              options={{ headerShown: false }} />
        <Stack.Screen name="screens/geofence-check"     options={{ headerShown: false }} />
        <Stack.Screen name="screens/signature"          options={{ headerShown: false }} />
        <Stack.Screen name="screens/map"                options={{ headerShown: false }} />
        <Stack.Screen name="screens/legal"              options={{ headerShown: false }} />
        <Stack.Screen name="screens/checklists"         options={{ headerShown: false }} />
        <Stack.Screen name="screens/reports"            options={{ headerShown: false }} />
        {/* reports/[id] is auto-registered by expo-router file system */}
      </Stack>
    </I18nProvider>
  );
}
