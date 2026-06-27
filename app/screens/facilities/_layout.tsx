// app/screens/facilities/_layout.tsx
import { Stack } from 'expo-router';

export default function FacilitiesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="all" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
