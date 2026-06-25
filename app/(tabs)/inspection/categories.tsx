// app/(tabs)/inspection/categories.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants';
import { facilities } from '../../../src/facilitiesData';

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const uniqueActivities = Array.from(new Set(facilities.map(f => f.activity))).sort();

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
