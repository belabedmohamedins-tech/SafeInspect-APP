import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InspectionRepository } from '../src/repositories/InspectionRepository';
import { InspectionItem } from '../src/types';

export default function PreviewScreen() {
  const { inspectionId, title } = useLocalSearchParams();
  const router = useRouter();
  const [criteriaItems, setCriteriaItems] = useState<InspectionItem[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      if (!inspectionId) return;
      const inspection = await InspectionRepository.getById(inspectionId as string);
      if (inspection) {
        setCriteriaItems(inspection.items);
      }
    };

    loadItems();
  }, [inspectionId]);

  const groupedData = useMemo(() => {
    const groups: { [key: string]: InspectionItem[] } = {};
    criteriaItems.forEach((item: InspectionItem) => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'ar'));
  }, [criteriaItems]);

  const renderAxisGroup = ({ item: [axis, items] }: { item: [string, any[]] }) => (
    <View style={styles.axisGroup}>
      <Text style={styles.axisTitle}>{axis}</Text>
      {items.map((criteria: any, index: number) => (
        <View key={index} style={styles.card}>
          <Text style={styles.criteria}>{criteria.criteria}</Text>
          <Text style={styles.reference}>{criteria.legalReference}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Stack.Screen واحد فقط لتكوين الهيدر */}
      <Stack.Screen
        options={{
          title: `معاينة: ${title || 'قائمة'}`,
          headerStyle: { backgroundColor: '#f8fcff' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
              <FontAwesome name="arrow-right" size={22} color='#1986df' />
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
  safeArea: { flex: 1, backgroundColor: '#f8fcff' },
  list: { padding: 10 },
  axisGroup: { marginBottom: 20 },
  axisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
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
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'right',
  },
  reference: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
});