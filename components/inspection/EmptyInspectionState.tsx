import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  onNewInspection: () => void;
}

export default function EmptyInspectionState({ onNewInspection }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>لا توجد تفتيشات بعد</Text>
      <Text style={styles.subtitle}>ابدأ تفتيشًا جديدًا لبدء تسجيل البيانات.</Text>
      <TouchableOpacity style={styles.button} onPress={onNewInspection}>
        <Text style={styles.buttonText}>بدء تفتيش جديد</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.mid, textAlign: 'center', marginBottom: 16 },
  button: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: Colors.white, fontWeight: '700' },
});
