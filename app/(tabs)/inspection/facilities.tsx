// app/(tabs)/inspection/facilities.tsx
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { facilities } from '../../../src/facilitiesData';
import { Colors } from '../../../src/constants/colors.ts';

export default function FacilitiesByCategoryScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const decodedCategory = decodeURIComponent(params.category as string);
  const filtered = facilities.filter(f => f.activity === decodedCategory);

  const handleFacilityPress = (facility: typeof facilities[0]) => {
    Alert.alert(
      'بدء تفتيش',
      `هل تريد بدء تفتيش للمنشأة "${facility.projectName}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم',
          onPress: () => {
            // Pass all preliminary data + facility details to checklist
            router.push({
              pathname: '/(tabs)/inspection/checklist',
              params: {
                ...params, // cause, reference, committeeMembers, writer, lat, lng, category
                facilityId: facility.id,
                facilityName: facility.projectName,
                facilityAddress: facility.address,
                activity: facility.activity,
              },
            });
          },
        },
      ]
    );
  };

  const renderFacility = ({ item }: { item: typeof facilities[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleFacilityPress(item)}
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
          title: decodedCategory,
          headerStyle: { backgroundColor: Colors.blue },
          headerTintColor: '#fff',
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderFacility}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد منشآت في هذا التصنيف</Text>
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