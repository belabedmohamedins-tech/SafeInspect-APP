// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nProvider } from '../src/i18n';
import { SettingsRepository } from '../src/repositories/SettingsRepository';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const done = await SettingsRepository.get<string>('onboardingDone');
      if (done !== 'true') {
        if (!segments.join('/').includes('onboarding')) {
          router.replace('/screens/onboarding');
        }
      }
      setChecked(true);
    })();
  }, []);

  return (
    <I18nProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/onboarding" options={{ headerShown: false, gestureEnabled: false }} />
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
