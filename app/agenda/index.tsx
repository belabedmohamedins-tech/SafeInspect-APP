import { FontAwesome } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors.ts';
import { facilities } from '../../src/facilitiesData';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { AgendaItem } from '../../src/types';
import { formatDateForAgenda } from '../../src/utils/dateUtils';

export default function AgendaListScreen() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const router = useRouter();

  const loadAgenda = async () => {
    try {
      const agendaItems = await AgendaRepository.getAll();
      setItems(agendaItems);
    } catch (error) {
      console.error('Failed to load agenda', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAgenda();
    }, [])
  );

  const deleteAgendaItem = async (id: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه المهمة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const updated = items.filter(item => item.id !== id);
            await AgendaRepository.delete(id);
            setItems(updated);
          },
        },
      ]
    );
  };

  const toggleCompleted = async (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    const target = updated.find(item => item.id === id);
    if (target) {
      await AgendaRepository.save(target);
    }
    setItems(updated);
  };

  const handleAgendaPress = (item: AgendaItem) => {
    const facility = facilities.find(f => f.id === item.facilityId);
    if (facility) {
      router.push({
        pathname: '/(tabs)/inspection/checklist',
        params: {
          facilityId: facility.id,
          facilityName: facility.projectName,
          facilityAddress: facility.address,
          activity: facility.activity,
          agendaId: item.id,
        },
      });
    } else {
      Alert.alert('تنبيه', 'لم يتم العثور على المنشأة المرتبطة بهذه المهمة');
    }
  };

  const renderItem = ({ item }: { item: AgendaItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleAgendaPress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.facilityName}>{item.facilityName}</Text>
        <TouchableOpacity onPress={() => deleteAgendaItem(item.id)}>
          <FontAwesome name="trash" size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      <Text style={styles.date}>{formatDateForAgenda(item.date)}</Text>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      <TouchableOpacity
        style={[styles.checkButton, item.completed && styles.checkButtonCompleted]}
        onPress={() => toggleCompleted(item.id)}
      >
        <Text style={styles.checkButtonText}>
          {item.completed ? 'تم الإنجاز ✓' : 'تحديد كمكتمل'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'المهام المجدولة',
          headerStyle: { backgroundColor: Colors.blue }, // تم التغيير من '#2c3e50' إلى Colors.blue
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/agenda/add')} style={{ marginRight: 15 }}>
              <FontAwesome name="plus" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="calendar" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>لا توجد مهام مجدولة</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  list: { padding: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  facilityName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  date: { fontSize: 13, color: '#7f8c8d', marginBottom: 5 },
  notes: { fontSize: 14, color: '#34495e', marginBottom: 10 },
  checkButton: { 
    backgroundColor: Colors.blue, // تم التغيير من '#3E729B' إلى Colors.blue
    padding: 8, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  checkButtonCompleted: { 
    backgroundColor: '#27ae60' // يبقى أخضر للإشارة إلى الإنجاز
  },
  checkButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#95a5a6', marginTop: 10 },
});