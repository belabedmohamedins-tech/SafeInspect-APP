// app/screens/facilities/index.tsx
// Facilities list — tap a facility card to open its profile dossier
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../../constants';
import { FacilityRepository } from '../../../src/repositories/FacilityRepository';
import { Facility } from '../../../src/types';

export default function FacilitiesScreen() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);

  // useFocusEffect callback must be synchronous — run async logic inside
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      FacilityRepository.getAll().then(all => {
        if (active) {
          setFacilities(all);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, [])
  );

  const load = useCallback(() => {
    setLoading(true);
    FacilityRepository.getAll().then(all => {
      setFacilities(all);
      setLoading(false);
    });
  }, []);

  const filtered = search.trim()
    ? facilities.filter(f =>
        f.projectName.includes(search) ||
        f.ownerName.includes(search)   ||
        f.activity.includes(search)    ||
        f.address.includes(search)
      )
    : facilities;

  const handleDelete = (facility: Facility) => {
    Alert.alert(
      'حذف المنشأة',
      `هل تريد حذف «${facility.projectName}» نهائياً؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف', style: 'destructive',
          onPress: async () => {
            await FacilityRepository.delete(facility.id);
            load();
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Facility }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push({ pathname: '/screens/facilities/profile', params: { id: item.id } })}
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.75}
    >
      <View style={s.cardIcon}>
        <FontAwesome name="building" size={20} color={Colors.primary} />
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>{item.projectName}</Text>
        <Text style={s.cardActivity} numberOfLines={1}>{item.activity}</Text>
        <Text style={s.cardAddress} numberOfLines={1}>{item.address}</Text>
      </View>
      <FontAwesome name="chevron-left" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <FontAwesome name="arrow-right" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>المنشآت</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/screens/facilities/add')}
        >
          <FontAwesome name="plus" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <FontAwesome name="search" size={15} color={Colors.textSecondary} />
        <TextInput
          style={s.searchInput}
          placeholder="بحث..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <FontAwesome name="times-circle" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <FontAwesome name="building" size={48} color={Colors.border} />
          <Text style={s.emptyTitle}>
            {search ? 'لا توجد نتائج' : 'لا توجد منشآت'}
          </Text>
          {!search && (
            <TouchableOpacity
              style={s.addEmptyBtn}
              onPress={() => router.push('/screens/facilities/add')}
            >
              <Text style={s.addEmptyBtnText}>إضافة منشأة</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={f => f.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={s.count}>{filtered.length} منشأة</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:   { padding: Spacing.xs },
  title:     { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  addBtn:    { padding: Spacing.xs },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, margin: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, textAlign: 'right' },

  count: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.sm },
  list:  { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },

  card:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border },
  cardIcon:  { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  cardBody:  { flex: 1, gap: 2 },
  cardName:  { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  cardActivity:{ fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  cardAddress: { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'right' },

  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  addEmptyBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radius.full, backgroundColor: Colors.primary },
  addEmptyBtnText: { fontSize: FontSize.base, color: '#fff', fontWeight: FontWeight.semibold },
});
