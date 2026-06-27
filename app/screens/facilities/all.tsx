// app/screens/facilities/all.tsx
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../../constants';
import { getAllFacilities } from '../../../src/facilitiesService';
import { Facility } from '../../../src/types';

export default function AllFacilitiesScreen() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading]       = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getAllFacilities().then(data => {
        if (active) { setFacilities(data); setLoading(false); }
      });
      return () => { active = false; };
    }, [])
  );

  const handlePress = (item: Facility) => {
    // Always go through inspection/start so the user fills in
    // cause, reference, committee members, and writer first.
    router.push({
      pathname: '/(tabs)/inspection/start',
      params: {
        facilityId:      item.id,
        facilityName:    item.projectName,
        facilityAddress: item.address,
        activity:        item.activity,
      },
    });
  };

  const renderFacility = ({ item }: { item: Facility }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <Text style={styles.projectName}>{item.projectName}</Text>
      <Text style={styles.owner}>{item.ownerName}</Text>
      <Text style={styles.address} numberOfLines={1}>{item.address || 'بدون عنوان'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'جميع المنشآت',
          headerStyle: { backgroundColor: Colors.blue },
          headerTintColor: '#fff',
        }}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : (
        <FlatList
          data={facilities}
          keyExtractor={item => item.id}
          renderItem={renderFacility}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>لا توجد منشآت</Text>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: Colors.blue }]}
                onPress={() => router.push('/screens/facilities/add')}
              >
                <Text style={styles.addBtnText}>+ إضافة منشأة</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:      { padding: Spacing.sm },
  card: {
    backgroundColor: '#fff', padding: Spacing.base,
    borderRadius: 8, marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2,
  },
  projectName: { fontSize: 15, fontWeight: '700', color: '#34495e', textAlign: 'right' },
  owner:       { fontSize: 13, color: '#7f8c8d', marginTop: 3, textAlign: 'right' },
  address:     { fontSize: 12, color: '#95a5a6', marginTop: 2, textAlign: 'right' },
  empty:       { alignItems: 'center', padding: 48, gap: Spacing.md },
  emptyText:   { color: '#95a5a6', fontSize: 15 },
  addBtn:      { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: 8 },
  addBtnText:  { color: '#fff', fontSize: 14, fontWeight: '600' },
});
