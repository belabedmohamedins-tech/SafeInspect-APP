// app/agenda/index.tsx
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
import { Colors, Spacing } from '../../constants';
import { getFacilityById } from '../../src/facilitiesService';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { AgendaItem } from '../../src/types';
import { formatDateForAgenda } from '../../src/utils/dateUtils';

const STATUS_COLORS: Record<AgendaItem['status'], string> = {
  pending:   Colors.blue,
  completed: '#27ae60',
  cancelled: '#95a5a6',
};

export default function AgendaListScreen() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const router = useRouter();

  const load = async () => {
    try { setItems(await AgendaRepository.getAll()); }
    catch (e) { console.error('Failed to load agenda', e); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه المهمة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف', style: 'destructive',
          onPress: async () => {
            await AgendaRepository.delete(id);
            setItems(prev => prev.filter(i => i.id !== id));
          },
        },
      ]
    );
  };

  const toggleStatus = async (item: AgendaItem) => {
    const next: AgendaItem['status'] = item.status === 'pending' ? 'completed' : 'pending';
    const updated = { ...item, status: next };
    await AgendaRepository.save(updated);
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  };

  // Launch checklist for this agenda item — works for both hardcoded and user facilities
  const handleLaunch = async (item: AgendaItem) => {
    const facility = await getFacilityById(item.facilityId);
    if (!facility) {
      Alert.alert('تنبيه', 'لم يتم العثور على المنشأة المرتبطة بهذه المهمة');
      return;
    }
    router.push({
      pathname: '/(tabs)/inspection/checklist',
      params: {
        facilityId:      facility.id,
        facilityName:    facility.projectName,
        facilityAddress: facility.address,
        activity:        facility.activity,
        agendaId:        item.id,
      },
    });
  };

  const renderItem = ({ item }: { item: AgendaItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleLaunch(item)}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <Text style={styles.facilityName} numberOfLines={1}>{item.facilityName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push({ pathname: '/agenda/edit', params: { id: item.id } })}
          >
            <FontAwesome name="pencil" size={16} color={Colors.warning ?? '#e67e22'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
            <FontAwesome name="trash" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.date}>{formatDateForAgenda(item.date)}</Text>
      {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}

      {/* Status toggle */}
      <TouchableOpacity
        style={[styles.statusBtn, { backgroundColor: STATUS_COLORS[item.status] }]}
        onPress={() => toggleStatus(item)}
      >
        <Text style={styles.statusText}>
          {item.status === 'completed'
            ? 'تم الإنجاز ✓'
            : item.status === 'cancelled'
            ? 'ملغاة'
            : 'تحديد كمكتمل'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'المهام المجدولة',
          headerStyle: { backgroundColor: Colors.blue },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/agenda/add')}
              style={{ marginRight: Spacing.base }}
            >
              <FontAwesome name="plus" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="calendar" size={48} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>لا توجد مهام مجدولة</Text>
            <TouchableOpacity
              style={[styles.emptyAction, { backgroundColor: Colors.blue }]}
              onPress={() => router.push('/agenda/add')}
            >
              <Text style={styles.emptyActionText}>+ إضافة مهمة</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.base, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  facilityName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { padding: 4 },
  date:   { fontSize: 13, color: '#7f8c8d', marginBottom: 4 },
  notes:  { fontSize: 13, color: '#34495e', marginBottom: Spacing.sm },
  statusBtn: { padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 4 },
  statusText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 48, gap: Spacing.md },
  emptyTitle: { fontSize: 16, color: '#95a5a6', fontWeight: '500' },
  emptyAction: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: 8 },
  emptyActionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
