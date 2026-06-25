import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsRepository } from '../src/repositories/SettingsRepository';

export default function SplashScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const { officeName } = await SettingsRepository.get();
        if (officeName) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Failed to check onboarding', error);
        router.replace('/onboarding');
      } finally {
        setIsChecking(false);
      }
    };
    checkOnboarding();
  }, []);

  if (isChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1986df" />
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fcff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});