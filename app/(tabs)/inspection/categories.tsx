// app/(tabs)/inspection/categories.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { facilities } from '../../../src/facilitiesData';
import { Colors } from '../../../src/constants/colors.ts';

export default function CategoriesScreen() {
  const router = useRouter();
  // Retrieve preliminary data passed from start.tsx
  const params = useLocalSearchParams();

  const uniqueActivities = Array.from(new Set(facilities.map(f => f.activity))).sort();

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        // Pass all preliminary data along to facilities screen
        router.push({
          pathname: '/(tabs)/inspection/facilities',
          params: {
            ...params, // includes cause, reference, committeeMembers, writer, lat, lng
            category: item,
          },
        });
      }}
    >
      <FontAwesome name="folder" size={24} color={Colors.blue} />
      <Text style={styles.categoryText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'اختر نوع المنشأة',
          headerStyle: { backgroundColor: Colors.blue },
          headerTintColor: '#fff',
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
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  list: { padding: 10 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: { fontSize: 16, color: '#34495e', marginLeft: 12 },
  empty: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#95a5a6', fontSize: 16 },
});