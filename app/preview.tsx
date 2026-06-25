import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants';
import { InspectionRepository } from '../src/repositories/InspectionRepository';
import { CriteriaPreviewStore } from '../src/stores/CriteriaPreviewStore';
import { InspectionItem } from '../src/types';

export default function PreviewScreen() {
  // `inspectionId` is set when coming from a saved inspection (reports screen).
  // `title` is always set — used for the header title.
  // When `inspectionId` is absent we are previewing a template checklist;
  // in that case the items come from CriteriaPreviewStore (set by checklists.tsx).
  const { inspectionId, title } = useLocalSearchParams();
  const router = useRouter();
  const [criteriaItems, setCriteriaItems] = useState<InspectionItem[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      if (inspectionId) {
        // Path 1: real saved inspection — load from repository by ID
        const inspection = await InspectionRepository.getById(inspectionId as string);
        if (inspection) setCriteriaItems(inspection.items);
      } else {
        // Path 2: template checklist preview — read from in-memory store
        const storeItems = CriteriaPreviewStore.get();
        setCriteriaItems(storeItems);
        CriteriaPreviewStore.clear();
      }
    };
    loadItems();
  }, [inspectionId]);

  const groupedData = useMemo(() => {
    const groups: Record<string, InspectionItem[]> = {};
    criteriaItems.forEach(item => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'ar'));
  }, [criteriaItems]);

  const renderAxisGroup = ({ item: [axis, items] }: { item: [string, InspectionItem[]] }) => (
    <View style={styles.axisGroup}>
      <Text style={styles.axisTitle}>{axis}</Text>
      {items.map((criteria, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.criteria}>{criteria.criteria}</Text>
          <Text style={styles.reference}>{criteria.legalReference}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: `معاينة: ${title || 'قائمة'}`,
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.blue,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
              <FontAwesome name="arrow-right" size={22} color={Colors.blue} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={groupedData}
        keyExtractor={([axis]) => axis}
        renderItem={renderAxisGroup}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد معايير لعرضها</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 10 },
  axisGroup: { marginBottom: 20 },
  axisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  criteria: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 4,
    textAlign: 'right',
  },
  reference: {
    fontSize: 12,
    color: Colors.mid,
    textAlign: 'right',
  },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: Colors.mid },
});
