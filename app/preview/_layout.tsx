// app/preview/_layout.tsx
import { Stack } from 'expo-router';
import { Colors } from '../../constants';

export default function PreviewLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.textPrimary },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
      }}
    />
  );
}
