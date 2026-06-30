// app/(tabs)/inspection/categories.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants';
import { facilities as builtInFacilities } from '../../../src/facilitiesData';
import { Facility } from '../../../src/types';

// Lazy import — UserFacilitiesRepository may not exist on older builds;
// wrap in try/catch so the screen degrades gracefully.
let UserFacilitiesRepository: { getAll: () => Promise<Facility[]> } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  UserFacilitiesRepository = require('../../../src/repositories/UserFacilitiesRepository').UserFacilitiesRepository;
} catch { /* not available — built-in facilities only */ }

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // FIX (P2): merge user-added facilities so their activity types appear
  // in the category list alongside the built-in ones.
  const [userFacilities, setUserFacilities] = useState<Facility[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (UserFacilitiesRepository) {
        UserFacilitiesRepository.getAll()
          .then(result => { if (active) setUserFacilities(result); })
          .catch(() => { /* non-fatal */ });
      }
      return () => { active = false; };
    }, [])
  );

  const uniqueActivities = useMemo(() => {
    const all = [...builtInFacilities, ...userFacilities];
    return Array.from(new Set(all.map(f => f.activity).filter(Boolean))).sort() as string[];
  }, [userFacilities]);

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        router.push({
          pathname: '/(tabs)/inspection/facilities',
          params: {
            ...params, // includes cause, reference, committeeMembers, writer, lat, lng
            category: item,
          },
        });
      }}
    >
      <FontAwesome name="folder" size={24} color={Colors.primary} />
      <Text style={styles.categoryText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'اختر نوع المنشأة',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.textInverse,
        }}
      />
      <FlatList
        data={uniqueActivities}
        keyExtractor={(item) => item}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد أنواع منشآت</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: 'transparent' },
  list:         { padding: 10 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textInverse,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: { fontSize: 16, color: Colors.textPrimary, marginLeft: 12 },
  empty:        { alignItems: 'center', padding: 20 },
  emptyText:    { color: Colors.textTertiary, fontSize: 16 },
});
