// app/(tabs)/inspection/categories.tsx
// F-10 fix (2026-08-08): replaced static facilitiesData import with
// getAllFacilities() loaded via useFocusEffect+useState. Unique activities
// now come from the merged DB+hardcoded source so user-added facilities
// are always reflected without a full app restart.
// W29 (2026-08-09): TSC fix — Colors.cardBackground→Colors.background,
//   Colors.text→Colors.textPrimary (neither key exists in constants/theme.ts).
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants';
import { getAllFacilities } from '../../../src/facilitiesService';

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activities, setActivities] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllFacilities().then(facilities => {
        if (!active) return;
        const unique = Array.from(new Set(facilities.map(f => f.activity))).sort();
        setActivities(unique);
      });
      return () => { active = false; };
    }, [])
  );

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        router.push({
          pathname: '/(tabs)/inspection/facilities',
          params: {
            ...params,
            category: item,
          },
        });
      }}
    >
      {/* RTL: icon on right side, text to the left */}
      <Text style={styles.categoryText}>{item}</Text>
      <FontAwesome name="folder" size={24} color={Colors.primary} />
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
        data={activities}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
