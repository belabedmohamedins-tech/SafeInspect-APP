// app/_layout.tsx
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AuthRepository } from '../src/repositories/AuthRepository';
import { initializeDatabase } from '../src/db/schema';
import { startSyncScheduler } from '../src/db/syncEngine';
import { I18nProvider } from '../src/i18n';
import { SettingsRepository } from '../src/repositories/SettingsRepository';
import { isLoggedIn, registerPushToken } from '../src/services/serverAuth';

// Keep splash screen visible until fonts + DB are ready
SplashScreen.preventAutoHideAsync();

// ── Expo Go guard (mirrors CapNotificationService) ──────────────────────────────────────
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

  // ── Load @expo/vector-icons fonts (FontAwesome, MaterialIcons, etc.) ──────────
  // Without this, icon components render as blank squares on first load.
  const [fontsLoaded, fontError] = useFonts({
    ...require('@expo/vector-icons/FontAwesome').font,
    ...require('@expo/vector-icons/MaterialIcons').font,
    ...require('@expo/vector-icons/Ionicons').font,
  });

  // Hide splash screen once both fonts and DB are ready
  useEffect(() => {
    if ((fontsLoaded || fontError) && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dbReady]);

  // Sub ref so we can remove the listener on unmount
  const notifSubRef = useRef<ReturnType<
    typeof import('expo-notifications')['addNotificationResponseReceivedListener']
  > | null>(null);

  // ── 1. Initialize DB and sync scheduler on app start ────────────────────────────
useEffect(() => {
    let stopSync: (() => void) | undefined;

    initializeDatabase()
      .then(() => {
        setDbReady(true);
        stopSync = startSyncScheduler(30_000);
      })
      .catch((err) => {
        console.error('[RAQIB] Database initialization failed:', err);
        // Still mark ready so app doesn’t hang forever on a DB error
        setDbReady(true);
      });

    return () => {
      stopSync?.();
    };
  }, []);

  // ── 2. Single auth guard — runs once after DB is ready ────────────────────────
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

  // ── 4. Notification tap deep-link handler ───────────────────────────────────
  useEffect(() => {
    if (!Notifications) return;

    notifSubRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const data = response.notification.request.content.data as Record<string, string> | undefined;
          if (!data) return;

          const screen = data.screen;

          if (screen === 'actions') {
            const filter = data.filter as string | undefined;
            router.push({
              pathname: '/(tabs)/actions',
              params:   filter ? { filter } : {},
            });
            return;
          }

          if (data.agendaId) {
            router.push({
              pathname: '/(tabs)/agenda',
              params:   { highlight: data.agendaId },
            });
            return;
          }

          if (data.type === 'APPROVAL_ACTION' && data.inspectionId) {
            router.push({
              pathname: '/screens/approval-queue',
              params:   { highlight: data.inspectionId },
            });
            return;
          }

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

  // Don’t render anything until fonts are loaded (avoids blank-icon flash)
  if (!fontsLoaded && !fontError) return null;

  return (
    <I18nProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pin-lock"              options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="screens/onboarding"    options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="screens/server-login"  options={{ headerShown: false, gestureEnabled: false }} />
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
      </Stack>
    </I18nProvider>
  );
}
