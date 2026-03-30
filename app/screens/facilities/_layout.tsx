// app/(tabs)/facilities/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

const BLUE = '#1986df';

export default function FacilitiesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'المنشآت',
          headerStyle: { backgroundColor: BLUE },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen name="[category]" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ headerShown: false }} />
    </Stack>
  );
}