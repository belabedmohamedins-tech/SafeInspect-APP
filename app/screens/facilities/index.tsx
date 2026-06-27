// app/screens/facilities/index.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../../constants';
import { deleteUserFacility, getAllFacilities, getUserFacilities, searchFacilities } from '../../../src/facilitiesService';
import { Facility } from '../../../src/types';

export default function FacilitiesScreen() {
  const router = useRouter();
  const [facilitiesList, setFacilitiesList] = useState<Facility[]>([]);
  const [userIds, setUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    const [all, user] = await Promise.all([getAllFacilities(), getUserFacilities()]);
    setFacilitiesList(all);
    setUserIds(new Set(user.map(f => f.id)));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      const all = await getAllFacilities();
      setFacilitiesList(all);
    } else {
      setFacilitiesList(await searchFacilities(text));
    }
  };

  const handleDelete = (facility: Facility) => {
    Alert.alert(
      'حذف منشأة',
      `هل تريد حذف «${facility.projectName}» نهائيا؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await deleteUserFacility(facility.id);
            load();
          },
        },
      ]
    );
  };

  const renderFacility = ({ item }: { item: Facility }) => {
    const isUserFacility = userIds.has(item.id);
    return (
      <View style={styles.card}>
        <View style={styles.cardBody}>
          <Text style={styles.projectName}>{item.projectName}</Text>
          <Text style={styles.owner}>{item.ownerName}</Text>
          <Text style={styles.address}>{item.address || 'بدون عنوان'}</Text>
          <Text style={styles.activity} numberOfLines={1}>{item.activity}</Text>
        </View>
        {isUserFacility && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.warning ?? '#e67e22' }]}
              onPress={() =>
                router.push({
                  pathname: '/screens/facilities/edit',
                  params: { id: item.id },
                })
              }
            >
              <FontAwesome name="pencil" size={15} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.danger ?? '#e74c3c' }]}
              onPress={() => handleDelete(item)}
            >
              <FontAwesome name="trash" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Add button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: Colors.blue }]}
        onPress={() => router.push('/screens/facilities/add')}
      >
        <FontAwesome name="plus-circle" size={22} color="#fff" />
        <Text style={styles.addButtonText}>إضافة منشأة جديدة</Text>
      </TouchableOpacity>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن منشأة..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#95a5a6"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <FontAwesome name="times-circle" size={16} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>

      {/* Full list — always visible */}
      <FlatList
        data={facilitiesList}
        keyExtractor={item => item.id}
        renderItem={renderFacility}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="building-o" size={40} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>لا توجد منشآت</Text>
            <Text style={styles.emptySubtitle}>اضغط «إضافة منشأة» للبدء</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.base,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, height: 44, fontSize: 15, textAlign: 'right', color: '#2c3e50' },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardBody: { flex: 1, padding: Spacing.base },
  projectName: { fontSize: 15, fontWeight: '700', color: '#2c3e50', textAlign: 'right' },
  owner:       { fontSize: 13, color: '#7f8c8d', marginTop: 2, textAlign: 'right' },
  address:     { fontSize: 12, color: '#95a5a6', marginTop: 2, textAlign: 'right' },
  activity:    { fontSize: 12, color: '#95a5a6', marginTop: 2, textAlign: 'right' },
  cardActions: { flexDirection: 'column', justifyContent: 'center' },
  actionBtn: {
    width: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyTitle:    { fontSize: 16, fontWeight: '600', color: '#7f8c8d', marginTop: Spacing.sm },
  emptySubtitle: { fontSize: 13, color: '#95a5a6' },
});
