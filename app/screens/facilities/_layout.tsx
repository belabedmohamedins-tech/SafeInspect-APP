// app/(tabs)/facilities/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../../src/constants/colors.ts';

export default function FacilitiesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'المنشآت',
          headerStyle: { backgroundColor: Colors.blue },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen name="[category]" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ headerShown: false }} />
    </Stack>
  );
}