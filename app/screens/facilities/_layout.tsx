// app/screens/facilities/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../../constants';

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
      {/* [category] removed — no such file exists, was causing layout warning */}
      <Stack.Screen name="add" options={{ headerShown: false }} />
      <Stack.Screen name="all" options={{ headerShown: false }} />
    </Stack>
  );
}
