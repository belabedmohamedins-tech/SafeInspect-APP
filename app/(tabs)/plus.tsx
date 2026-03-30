import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BLUE = '#1986df';

const secondaryItems = [
  { name: 'المنشآت', icon: 'building', route: '/screens/facilities' },
  { name: 'التقارير', icon: 'file-text', route: '/screens/reports' },
  { name: 'إحصائيات', icon: 'bar-chart', route: '/screens/stats' },
  { name: 'المراجع', icon: 'book', route: '/screens/legal' },
  { name: 'قوائم التفتيش', icon: 'print', route: '/screens/checklists' },
  { name: 'الخريطة', icon: 'map-marker', route: '/screens/map' }, // new map entry
];

export default function PlusScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof secondaryItems[0] }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(item.route as any)}
    >
      <FontAwesome name={item.icon as any} size={24} color={BLUE} />
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={secondaryItems}
        keyExtractor={(item) => item.route}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  list: { padding: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginLeft: 16,
  },
});