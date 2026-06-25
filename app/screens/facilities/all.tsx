// app/facilities/all.tsx
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { facilities } from '../../../src/facilitiesData';
import { Colors } from '../../../constants';

export default function AllFacilitiesScreen() {
  const router = useRouter();

  const renderFacility = ({ item }: { item: typeof facilities[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: '/(tabs)/inspection/checklist',
          params: {
            facilityId: item.id,
            facilityName: item.projectName,
            facilityAddress: item.address,
            activity: item.activity,
          },
        });
      }}
    >
      <Text style={styles.projectName}>{item.projectName}</Text>
      <Text style={styles.owner}>{item.ownerName}</Text>
      <Text style={styles.address}>{item.address || 'بدون عنوان'}</Text>
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
      <FlatList
        data={facilities}
        keyExtractor={(item) => item.id}
        renderItem={renderFacility}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد منشآت</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  list: { padding: 10 },
  card: {
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
  projectName: { fontSize: 16, fontWeight: 'bold', color: '#34495e' },
  owner: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  address: { fontSize: 13, color: '#95a5a6', marginTop: 2 },
  empty: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#95a5a6', fontSize: 16 },
});
