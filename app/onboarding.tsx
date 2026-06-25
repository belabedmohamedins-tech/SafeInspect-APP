import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants';
import { SettingsRepository } from '../src/repositories/SettingsRepository';

export default function OnboardingScreen() {
  const router = useRouter();
  const [officeName, setOfficeName] = useState('');

  const handleSave = async () => {
    if (!officeName.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم الهيكل البلدي لحفظ الصحة');
      return;
    }
    try {
      await SettingsRepository.set({ officeName: officeName.trim() });
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to save office name', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>مرحباً بك</Text>
        <Text style={styles.subtitle}>يرجى إدخال اسم الهيكل البلدي لحفظ الصحة</Text>
        <TextInput
          style={styles.input}
          value={officeName}
          onChangeText={setOfficeName}
          placeholder="مثال: الهيكل البلدي لحفظ الصحة لبلدية سيدي إبراهيم"
          placeholderTextColor={Colors.textTertiary}
          textAlign="right"
        />
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>حفظ والمتابعة</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title:     { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  subtitle:  { fontSize: 16, color: Colors.textSecondary, marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: 20,
  },
  button:     { backgroundColor: Colors.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: Colors.textInverse, fontSize: 18, fontWeight: 'bold' },
});
