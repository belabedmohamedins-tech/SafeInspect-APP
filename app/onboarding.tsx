import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BLUE = '#1986df';

export default function OnboardingScreen() {
  const router = useRouter();
  const [officeName, setOfficeName] = useState('');

  const handleSave = async () => {
    if (!officeName.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم الهيكل البلدي لحفظ الصحة');
      return;
    }
    try {
      await AsyncStorage.setItem('officeName', officeName.trim());
      console.log('Office name saved, navigating to home');
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
          placeholderTextColor="#95a5a6"
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
  container: { flex: 1, backgroundColor: '#f8fcff' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'right',
    marginBottom: 20,
  },
  button: { backgroundColor: BLUE, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});