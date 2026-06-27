// app/agenda/edit.tsx
// Edit date, notes, and facility for an existing agenda item.
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants';
import { getAllFacilities } from '../../src/facilitiesService';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { AgendaItem, Facility } from '../../src/types';

export default function EditAgendaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [item, setItem]         = useState<AgendaItem | null>(null);

  // Facility picker state
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [filtered, setFiltered]           = useState<Facility[]>([]);
  const [facilityName, setFacilityName]   = useState('');
  const [facilityId, setFacilityId]       = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [activity, setActivity]           = useState('');
  const [showPicker, setShowPicker]       = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Date / notes
  const [date, setDate]                   = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [notes, setNotes]                 = useState('');

  useEffect(() => {
    (async () => {
      if (!id) { router.back(); return; }
      const [allItems, facilities] = await Promise.all([
        AgendaRepository.getAll(),
        getAllFacilities(),
      ]);
      const found = allItems.find(i => i.id === id);
      if (!found) {
        Alert.alert('خطأ', 'لم يتم العثور على المهمة'); router.back(); return;
      }
      setItem(found);
      setFacilityName(found.facilityName);
      setFacilityId(found.facilityId);
      setFacilityAddress(found.facilityAddress ?? '');
      setActivity(found.activity ?? '');
      setDate(new Date(found.date));
      setNotes(found.notes ?? '');
      setAllFacilities(facilities);
      setFiltered(facilities);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (facilityName.trim() === '') { setFiltered(allFacilities); return; }
    const q = facilityName.toLowerCase();
    setFiltered(allFacilities.filter(f =>
      f.projectName.toLowerCase().includes(q) || f.ownerName.toLowerCase().includes(q)
    ));
  }, [facilityName, allFacilities]);

  const selectFacility = (f: Facility) => {
    setFacilityName(f.projectName);
    setFacilityId(f.id);
    setFacilityAddress(f.address ?? '');
    setActivity(f.activity ?? '');
    setShowPicker(false);
    inputRef.current?.blur();
  };

  const handleSave = async () => {
    if (!facilityId) {
      Alert.alert('تنبيه', 'الرجاء اختيار منشأة'); return;
    }
    setSaving(true);
    try {
      const updated: AgendaItem = {
        ...item!,
        facilityId,
        facilityName,
        facilityAddress,
        activity,
        date: date.toISOString(),
        notes,
      };
      await AgendaRepository.save(updated);
      router.back();
    } catch (e) {
      console.error('EditAgenda save error:', e);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'تعديل مهمة',
          headerStyle: { backgroundColor: Colors.warning ?? '#e67e22' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        {/* Facility picker */}
        <Text style={styles.label}>المنشأة</Text>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={facilityName}
            onChangeText={t => { setFacilityName(t); setFacilityId(''); }}
            onFocus={() => setShowPicker(true)}
            placeholder="ابحث عن منشأة..."
            placeholderTextColor="#95a5a6"
          />
          {facilityName !== '' && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setFacilityName(''); setFacilityId(''); }}
            >
              <FontAwesome name="times-circle" size={18} color="#95a5a6" />
            </TouchableOpacity>
          )}
        </View>

        {showPicker && filtered.length > 0 && (
          <View style={styles.pickerList}>
            {filtered.slice(0, 30).map(f => (
              <TouchableOpacity
                key={f.id}
                style={styles.pickerItem}
                onPress={() => selectFacility(f)}
              >
                <Text style={styles.pickerName}>{f.projectName}</Text>
                <Text style={styles.pickerOwner}>{f.ownerName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date / time */}
        <Text style={styles.label}>التاريخ والوقت</Text>
        <TouchableOpacity
          style={[styles.input, styles.dateInput]}
          onPress={() => setDatePickerVisible(true)}
        >
          <FontAwesome name="calendar" size={14} color="#7f8c8d" style={{ marginLeft: Spacing.sm }} />
          <Text style={styles.dateText}>
            {date.toLocaleDateString('ar-DZ')}  {date.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          date={date}
          onConfirm={d => { setDate(d); setDatePickerVisible(false); }}
          onCancel={() => setDatePickerVisible(false)}
          locale="ar"
        />

        {/* Notes */}
        <Text style={styles.label}>ملاحظات</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="أضف ملاحظات..."
          placeholderTextColor="#95a5a6"
        />

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.warning ?? '#e67e22', opacity: saving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>حفظ التعديلات</Text>
          }
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: Spacing.base },
  label:     { fontSize: 14, fontWeight: '600', color: '#34495e', marginTop: Spacing.base, marginBottom: 4 },
  inputRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 6 },
  input:     { flex: 1, padding: 12, fontSize: 15, color: '#2c3e50' },
  clearBtn:  { padding: 12 },
  dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 6, flex: undefined },
  dateText:  { fontSize: 15, color: '#2c3e50' },
  pickerList:{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 6, maxHeight: 220, overflow: 'hidden' },
  pickerItem:{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  pickerName:{ fontSize: 14, color: '#2c3e50', fontWeight: '500' },
  pickerOwner:{ fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  textArea:  { height: 100, flex: undefined, textAlignVertical: 'top' },
  saveBtn:   { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 28, marginBottom: 20 },
  saveBtnText:{ color: '#fff', fontSize: 16, fontWeight: '600' },
});
