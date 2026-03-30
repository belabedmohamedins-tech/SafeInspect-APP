// app/(tabs)/inspection/_layout.tsx
import { Stack } from 'expo-router';

export default function InspectionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="facilities" />
      <Stack.Screen name="checklist" />
    </Stack>
  );
}