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
import { isLoggedIn, registerPushToken } from '../src/services/serverAuth';

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

      // 2c. Server login — prompt once if never logged in to the server
      //     (non-blocking: user can always skip and use offline mode)
      const serverSession = await isLoggedIn();
      if (!serverSession && !currentPath.includes('server-login')) {
        router.replace('/screens/server-login');
        return;
      }

      // 2d. All clear
      if (!currentPath.includes('(tabs)')) {
        router.replace('/(tabs)/home');
      }
    })();
  }, [dbReady]);

  // ── 3. Register device push token with the server ───────────────────────────
  //
  // Runs once after DB is ready. Safe in Expo Go (skipped via IS_EXPO_GO guard).
  // Non-fatal: push token registration failure never breaks the app.
  useEffect(() => {
    if (!dbReady || IS_EXPO_GO || !Notifications) return;

    (async () => {
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        const tokenData = await Notifications.getExpoPushTokenAsync();
        if (tokenData?.data) {
          await registerPushToken(tokenData.data);
        }
      } catch (err) {
        console.warn('[_layout] push token registration failed:', err);
      }
    })();
  }, [dbReady]);

  // ── 4. Notification tap deep-link handler (Phase 15 + Phase 21 + Tier-2) ────
  //
  // Handles taps on any scheduled or server-pushed notification.
  //
  // Supported payloads:
  //
  //   CAP notifications (per-item / daily digest / weekly digest):
  //     { screen: 'actions', filter: 'overdue' | 'all' }
  //     { screen: 'actions', capId: '<id>' }  ← per-item fallback
  //
  //   Agenda notifications (Phase 21):
  //     { agendaId: '<id>' }  ← navigates to the Agenda tab
  //
  //   Server approval notifications (Tier-2):
  //     { type: 'APPROVAL_ACTION', inspectionId: '<id>', action: 'approved'|'returned' }
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
          if (data.agendaId) {
            router.push({
              pathname: '/(tabs)/agenda',
              params:   { highlight: data.agendaId },
            });
            return;
          }

          // — Server approval notifications (Tier-2) —
          // Sent by the backend when a supervisor approves or returns an inspection.
          if (data.type === 'APPROVAL_ACTION' && data.inspectionId) {
            router.push({
              pathname: '/screens/approval-queue',
              params:   { highlight: data.inspectionId },
            });
            return;
          }

          // — Supervisor: new inspection pending approval —
          if (data.type === 'NEW_APPROVAL_PENDING') {
            router.push('/screens/supervisor-approvals');
            return;
          }
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
        <Stack.Screen name="pin-lock"              options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="screens/onboarding"    options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="screens/server-login"  options={{ headerShown: false, gestureEnabled: false }} />
        {/* App screens */}
        <Stack.Screen name="screens/notifications"         options={{ headerShown: false }} />
        <Stack.Screen name="screens/inspector-profile"     options={{ headerShown: false }} />
        <Stack.Screen name="screens/approval-queue"        options={{ headerShown: false }} />
        <Stack.Screen name="screens/approval-detail"       options={{ headerShown: false }} />
        <Stack.Screen name="screens/supervisor-approvals"  options={{ headerShown: false }} />
        <Stack.Screen name="screens/stats"                 options={{ headerShown: false }} />
        <Stack.Screen name="screens/cap"                   options={{ headerShown: false }} />
        <Stack.Screen name="screens/audit-log"             options={{ headerShown: false }} />
        <Stack.Screen name="screens/backup"                options={{ headerShown: false }} />
        <Stack.Screen name="screens/settings"              options={{ headerShown: false }} />
        <Stack.Screen name="screens/brief"                 options={{ headerShown: false }} />
        <Stack.Screen name="screens/geofence-check"        options={{ headerShown: false }} />
        <Stack.Screen name="screens/signature"             options={{ headerShown: false }} />
        <Stack.Screen name="screens/map"                   options={{ headerShown: false }} />
        <Stack.Screen name="screens/legal"                 options={{ headerShown: false }} />
        <Stack.Screen name="screens/checklists"            options={{ headerShown: false }} />
        <Stack.Screen name="screens/reports"               options={{ headerShown: false }} />
        {/* reports/[id] is auto-registered by expo-router file system */}
      </Stack>
    </I18nProvider>
  );
}
