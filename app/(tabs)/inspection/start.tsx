import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants';

export default function InspectionStartScreen() {
  const router = useRouter();
  const [cause, setCause] = useState('routine');
  const [reference, setReference] = useState('');
  const [committeeMembers, setCommitteeMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');
  const [writer, setWriter] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه', 'لا يمكن الحصول على الموقع الجغرافي');
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoordinates({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setLocationLoading(false);
    })();
  }, []);

  const addMember = () => {
    if (newMember.trim()) {
      setCommitteeMembers([...committeeMembers, newMember.trim()]);
      setNewMember('');
    }
  };

  const removeMember = (index: number) => {
    setCommitteeMembers(committeeMembers.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!writer.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم المحرر');
      return;
    }
    if (committeeMembers.length === 0) {
      Alert.alert('تنبيه', 'الرجاء إضافة أعضاء اللجنة');
      return;
    }
    router.push({
      pathname: '/(tabs)/inspection/categories',
      params: {
        cause,
        reference,
        committeeMembers: JSON.stringify(committeeMembers),
        writer,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>بيانات التفتيش الأولية</Text>

        <Text style={styles.label}>سبب التفتيش</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={cause} onValueChange={setCause} style={styles.picker}>
            <Picker.Item label="تفتيش روتيني" value="routine" />
            <Picker.Item label="بعد شكوى" value="complaint" />
            <Picker.Item label="متابعة بعد إنذار" value="followup" />
            <Picker.Item label="تفتيش استثنائي" value="extraordinary" />
          </Picker>
        </View>

        <Text style={styles.label}>مرجع المستند (اختياري)</Text>
        <TextInput
          style={styles.input}
          value={reference}
          onChangeText={setReference}
          placeholder="رقم الشكوى / الإنذار / ..."
          placeholderTextColor="#95a5a6"
          textAlign="right"
        />

        <Text style={styles.label}>المحرر (حامل الجهاز)</Text>
        <TextInput
          style={styles.input}
          value={writer}
          onChangeText={setWriter}
          placeholder="الاسم الكامل"
          placeholderTextColor="#95a5a6"
          textAlign="right"
        />

        <Text style={styles.label}>أعضاء اللجنة</Text>
        <View style={styles.memberInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            value={newMember}
            onChangeText={setNewMember}
            placeholder="اسم العضو"
            placeholderTextColor="#95a5a6"
            textAlign="right"
          />
          <TouchableOpacity style={styles.addButton} onPress={addMember}>
            <FontAwesome name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {committeeMembers.map((member, idx) => (
          <View key={idx} style={styles.memberItem}>
            <Text style={styles.memberText}>{member}</Text>
            <TouchableOpacity onPress={() => removeMember(idx)}>
              <FontAwesome name="trash" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.label}>الموقع الجغرافي</Text>
        {locationLoading ? (
          <Text style={styles.locationText}>جاري الحصول على الموقع...</Text>
        ) : coordinates ? (
          <Text style={styles.locationText}>
            خط العرض: {coordinates.lat.toFixed(6)} – خط الطول: {coordinates.lng.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.locationText}>لا يمكن الحصول على الموقع</Text>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>التالي</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fcff' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#34495e', marginBottom: 4, marginTop: 15 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'right',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    marginBottom: 10,
  },
  picker: { height: 50, width: '100%', color: '#2c3e50' },
  memberInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addButton: {
    backgroundColor: Colors.blue,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  memberText: { fontSize: 14, color: '#2c3e50', textAlign: 'right', flex: 1 },
  locationText: { fontSize: 14, color: '#7f8c8d', marginBottom: 10 },
  nextButton: {
    backgroundColor: Colors.blue,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
