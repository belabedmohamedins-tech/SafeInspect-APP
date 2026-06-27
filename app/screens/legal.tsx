// app/screens/legal.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing } from '../../constants';
import { criteriaByActivity } from '../../src/criteriaData';
import { InspectionItem } from '../../src/types';

export default function LegalReferencesScreen() {
  const [selectedActivity, setSelectedActivity] = useState<string>('default');

  const activities = Object.keys(criteriaByActivity).filter(key => key !== 'default');
  const currentCriteria = criteriaByActivity[selectedActivity] || criteriaByActivity.default;

  const groupedData = useMemo(() => {
    const groups: { [key: string]: InspectionItem[] } = {};
    currentCriteria.forEach(item => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'ar'));
  }, [currentCriteria]);

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
            <FontAwesome name="file-text" size={50} color={Colors.border} />
            <Text style={styles.emptyText}>لا توجد معايير لهذا النشاط</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:        { flex: 1, backgroundColor: Colors.background },
  pickerContainer: {
    backgroundColor: Colors.white,
    margin: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  picker:       { height: 50, width: '100%', color: Colors.dark },
  list:         { padding: Spacing.sm },
  axisGroup:    { marginBottom: Spacing.xl },
  axisTitle:    {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  criteria:  {
    fontSize: FontSize.base,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  reference: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'right',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.blue}33`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: Spacing.xs,
  },
  categoryText:   { fontSize: FontSize.xs, color: Colors.blue },
  emptyContainer: { alignItems: 'center', padding: Spacing.xxl },
  emptyText:      { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: Spacing.sm },
});
