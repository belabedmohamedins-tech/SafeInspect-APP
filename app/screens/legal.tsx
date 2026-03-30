import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { criteriaByActivity } from '../../src/criteriaData';
import { InspectionItem } from '../../src/types';

const BLUE = '#1986df';

export default function LegalReferencesScreen() {
  const [selectedActivity, setSelectedActivity] = useState<string>('default');
  
  const activities = Object.keys(criteriaByActivity).filter(key => key !== 'default');
  const currentCriteria = criteriaByActivity[selectedActivity] || criteriaByActivity.default;

  const groupByAxis = (items: InspectionItem[]) => {
    const groups: { [key: string]: InspectionItem[] } = {};
    items.forEach(item => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'ar'));
  };

  const groupedData = groupByAxis(currentCriteria);

  const renderAxisGroup = ({ item: [axis, items] }: { item: [string, InspectionItem[]] }) => (
    <View style={styles.axisGroup}>
      <Text style={styles.axisTitle}>{axis}</Text>
      {items.map(item => (
        <View key={item.id} style={styles.itemCard}>
          <Text style={styles.criteria}>{item.criteria}</Text>
          <Text style={styles.reference}>📜 {item.legalReference}</Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedActivity}
          onValueChange={(itemValue) => setSelectedActivity(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="جميع المعايير (القاعدة العامة)" value="default" />
          {activities.map((activity) => (
            <Picker.Item key={activity} label={activity} value={activity} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={groupedData}
        keyExtractor={([axis]) => axis}
        renderItem={renderAxisGroup}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="file-text" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>لا توجد معايير لهذا النشاط</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // للتوافق مع الخلفية العامة
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#2c3e50',
  },
  list: {
    padding: 10,
  },
  axisGroup: {
    marginBottom: 20,
  },
  axisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
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
    color: '#34495e',
    marginBottom: 4,
    textAlign: 'right',
  },
  reference: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
    textAlign: 'right',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: BLUE + '20', // 20% شفافية
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  categoryText: {
    fontSize: 11,
    color: BLUE,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
});