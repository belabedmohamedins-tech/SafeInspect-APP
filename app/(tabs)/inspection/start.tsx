// app/(tabs)/inspection/start.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../../../constants';

export default function InspectionStartScreen() {
  const router = useRouter();
  const [cause, setCause]                     = useState('routine');
  const [reference, setReference]             = useState('');
  const [committeeMembers, setCommitteeMembers] = useState<string[]>([]);
  const [newMember, setNewMember]             = useState('');
  const [writer, setWriter]                   = useState('');
  const [coordinates, setCoordinates]         = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setLocationLoading(false);
          return;
        }
        // 10-second timeout so the form never hangs indefinitely
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 10_000)
          ),
        ]);
        if (!cancelled) {
          setCoordinates({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {
        // Silent fallback — GPS is optional, form still works without it
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    };
    fetchLocation();
    return () => { cancelled = true; };
  }, []);

  const addMember = () => {
    const trimmed = newMember.trim();
    if (trimmed) {
      setCommitteeMembers(prev => [...prev, trimmed]);
      setNewMember('');
    }
  };

  const removeMember = (index: number) => {
    setCommitteeMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!writer.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم المحرر');
      return;
    }
    if (committeeMembers.length === 0) {
      Alert.alert('تنبيه', 'الرجاء إضافة عضو واحد على الأقل في اللجنة');
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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>بيانات التفتيش الأولية</Text>

        <Text style={styles.label}>سبب التفتيش</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={cause} onValueChange={setCause} style={styles.picker}>
            <Picker.Item label="تفتيش روتيني"   value="routine" />
            <Picker.Item label="بعد شكوى"       value="complaint" />
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
          placeholderTextColor={Colors.textTertiary}
          textAlign="right"
        />

        <Text style={styles.label}>المحرر (حامل الجهاز)</Text>
        <TextInput
          style={styles.input}
          value={writer}
          onChangeText={setWriter}
          placeholder="الاسم الكامل"
          placeholderTextColor={Colors.textTertiary}
          textAlign="right"
        />

        <Text style={styles.label}>أعضاء اللجنة</Text>
        <View style={styles.memberInputRow}>
          <TextInput
            style={[styles.input, styles.memberInput]}
            value={newMember}
            onChangeText={setNewMember}
            placeholder="اسم العضو"
            placeholderTextColor={Colors.textTertiary}
            textAlign="right"
            onSubmitEditing={addMember}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={addMember}>
            <FontAwesome name="plus" size={18} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        {committeeMembers.map((member, idx) => (
          <View key={idx} style={styles.memberItem}>
            <Text style={styles.memberText}>{member}</Text>
            <TouchableOpacity onPress={() => removeMember(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome name="trash" size={16} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.label}>الموقع الجغرافي</Text>
        {locationLoading ? (
          <View style={styles.locationRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.locationText}>جاري الحصول على الموقع...</Text>
          </View>
        ) : coordinates ? (
          <View style={styles.locationRow}>
            <FontAwesome name="map-marker" size={14} color={Colors.success} />
            <Text style={styles.locationText}>
              {coordinates.lat.toFixed(6)}°ش – {coordinates.lng.toFixed(6)}°ش
            </Text>
          </View>
        ) : (
          <View style={styles.locationRow}>
            <FontAwesome name="exclamation-circle" size={14} color={Colors.warning} />
            <Text style={[styles.locationText, { color: Colors.warning }]}>
              لم يتم الحصول على الموقع — سيتم تسجيل التفتيش بدونه
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>التالي →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md - 2,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md - 2,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%', color: Colors.textPrimary },
  memberInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  memberInput:   { flex: 1, marginBottom: 0 },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceOffset,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md - 2,
    marginBottom: Spacing.xs,
  },
  memberText: { fontSize: 14, color: Colors.textPrimary, textAlign: 'right', flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  locationText: { fontSize: 13, color: Colors.textSecondary },
  nextButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  nextButtonText: { color: Colors.textInverse, fontSize: 16, fontWeight: 'bold' },
});
