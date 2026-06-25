import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
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
import { Colors } from '../../src/constants/colors.ts';
import { facilities } from '../../src/facilitiesData';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { AgendaItem } from '../../src/types';

export default function AddAgendaScreen() {
  const router = useRouter();
  const [facilityName, setFacilityName] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [activity, setActivity] = useState('');
  const [filteredFacilities, setFilteredFacilities] = useState(facilities);
  const [showFacilityPicker, setShowFacilityPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [notes, setNotes] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (facilityName.trim() === '') {
      setFilteredFacilities(facilities);
    } else {
      const filtered = facilities.filter(f =>
        f.projectName.toLowerCase().includes(facilityName.toLowerCase())
      );
      setFilteredFacilities(filtered);
    }
  }, [facilityName]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const selectFacility = (facility: typeof facilities[0]) => {
    setFacilityName(facility.projectName);
    setFacilityId(facility.id);
    setFacilityAddress(facility.address);
    setActivity(facility.activity);
    setShowFacilityPicker(false);
    inputRef.current?.blur();
  };

  const saveAgendaItem = async () => {
    if (!facilityId) {
      Alert.alert('تنبيه', 'الرجاء اختيار منشأة من القائمة');
      return;
    }
    try {
      const newItem: AgendaItem = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        facilityId,
        facilityName,
        facilityAddress,
        activity,
        date: date.toISOString(),
        notes,
        status: 'pending',
      };
      await AgendaRepository.save(newItem);
      router.back();
    } catch (error) {
      console.error('Error saving agenda item', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'إضافة مهمة جديدة',
          headerStyle: { backgroundColor: Colors.blue },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>المنشأة</Text>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={facilityName}
            onChangeText={setFacilityName}
            onFocus={() => setShowFacilityPicker(true)}
            placeholder="ابحث عن منشأة..."
            placeholderTextColor="#95a5a6"
          />
          {facilityName !== '' && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setFacilityName('');
                setFacilityId('');
                setFacilityAddress('');
                setActivity('');
              }}
            >
              <FontAwesome name="times-circle" size={18} color="#95a5a6" />
            </TouchableOpacity>
          )}
        </View>

        {showFacilityPicker && filteredFacilities.length > 0 && (
          <View style={styles.pickerList}>
            {filteredFacilities.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.pickerItem}
                onPress={() => selectFacility(item)}
              >
                <Text style={styles.pickerItemText}>{item.projectName}</Text>
                <Text style={styles.pickerItemOwner}>{item.ownerName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>التاريخ والوقت</Text>
        <TouchableOpacity style={styles.input} onPress={showDatePicker}>
          <Text style={styles.inputText}>
            {date.toLocaleDateString('ar-DZ')} {date.toLocaleTimeString('ar-DZ')}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          date={date}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          locale="ar"
        />

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

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: Colors.blue }]} onPress={saveAgendaItem}>
          <Text style={styles.saveButtonText}>حفظ المهمة</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 5,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  clearButton: {
    padding: 12,
  },
  inputText: {
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  pickerList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  pickerItemOwner: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  textArea: {
    height: 100,
    flex: undefined,
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
