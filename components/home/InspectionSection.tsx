import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants';
import DraftListItem from '../inspection/DraftListItem';
import { SavedInspection } from '../../src/types';

interface Props {
  title: string;
  items: SavedInspection[];
  emptyIcon?: string;
  emptyText?: string;
  emptyActionLabel?: string;
  onItemPress: (item: SavedInspection) => void;
  onViewAll?: () => void;
  onEmptyAction?: () => void;
}

export default function InspectionSection({
  title,
  items = [],
  emptyText = 'لا توجد عناصر',
  emptyActionLabel,
  onItemPress,
  onViewAll,
  onEmptyAction,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onViewAll && items.length > 0 && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>عرض الكل</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Divider under header */}
      <View style={styles.divider} />

      {/* Empty state */}
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{emptyText}</Text>
          {emptyActionLabel && onEmptyAction && (
            <TouchableOpacity style={styles.emptyAction} onPress={onEmptyAction}>
              <Text style={styles.emptyActionText}>{emptyActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={items.slice(0, 5)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <DraftListItem
              inspection={item}
              onPress={() => onItemPress(item)}
              onDelete={() => {}}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Single card with shadow — no double borders between stacked sections
  container: {
    backgroundColor: Colors.textInverse,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  title:           { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  viewAll:         { color: Colors.primary, fontSize: 14, fontWeight: '500' },
  divider:         { height: 1, backgroundColor: Colors.surfaceOffset },
  empty:           { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  emptyText:       { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  emptyAction:     { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: 8 },
  emptyActionText: { color: Colors.textInverse, fontWeight: '600', fontSize: 14 },
});
