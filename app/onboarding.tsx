// app/onboarding.tsx
//
// This file exists because Expo Router's file-system routing would serve
// /onboarding from here if it were a real screen. The canonical onboarding
// experience lives at app/screens/onboarding.tsx (4-slide carousel).
//
// We redirect immediately so no matter which path resolves, the user always
// sees the correct screen.
import { Redirect } from 'expo-router';

export default function OnboardingRedirect() {
  return <Redirect href="/screens/onboarding" />;
}
