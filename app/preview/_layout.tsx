// app/preview/_layout.tsx
import { Stack } from 'expo-router';

export default function PreviewLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    />
  );
}
