// app/index.tsx
//
// This file must exist so Expo Router has a root entry point, but all
// auth/routing logic lives exclusively in app/_layout.tsx.
//
// _layout.tsx mounts first and redirects to the correct screen
// (onboarding, pin-lock, or home) before this component ever renders.
// We render nothing — just a blank screen that is never seen.

import React from 'react';
import { View } from 'react-native';

export default function Index() {
  return <View style={{ flex: 1, backgroundColor: '#0f2d3b' }} />;
}
