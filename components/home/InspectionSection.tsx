import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BLUE, Colors, Radius, Spacing } from '../../constants';
import { SavedInspection } from '../../src/types';
import { formatDateForAgenda } from '../../src/utils/dateUtils';

interface Props {
  title: string;
  items: SavedInspection[];
  emptyIcon: string;
  emptyText: string;
  emptyActionLabel?: string;
  onItemPress: (item: SavedInspection) => void;
  onViewAll: () => void;
  onEmptyAction?: () => void;
}

export default function InspectionSection({
  title, items, emptyIcon, emptyText,
  emptyActionLabel, onItemPress, onViewAll, onEmptyAction,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>عرض الكل</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome name={emptyIcon as any} size={40} color={Colors.border} />
          <Text style={styles.emptyText}>{emptyText}</Text>
          {emptyActionLabel && onEmptyAction && (
            <TouchableOpacity style={styles.addBtn} onPress={onEmptyAction}>
              <Text style={styles.addBtnText}>{emptyActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        items.map(item => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => onItemPress(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.facilityName}>{item.facilityName}</Text>
              <Text style={styles.date}>{formatDateForAgenda(item.date)}</Text>
            </View>
            <Text style={styles.address}>{item.facilityAddress}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section:      { backgroundColor: Colors.textInverse, marginTop: Spacing.sm, paddingVertical: Spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.surfaceOffset },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  viewAll:      { color: BLUE, fontSize: 14, fontWeight: '500' },
  empty:        { alignItems: 'center', padding: 20, marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.surfaceOffset },
  emptyText:    { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  addBtn:       { marginTop: 10, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: BLUE, borderRadius: Radius.sm },
  addBtnText:   { color: Colors.textInverse, fontSize: 12, fontWeight: 'bold' },
  card:         { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, marginHorizontal: Spacing.base, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceOffset },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  facilityName: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  date:         { fontSize: 11, color: Colors.textSecondary },
  address:      { fontSize: 12, color: Colors.textTertiary },
});