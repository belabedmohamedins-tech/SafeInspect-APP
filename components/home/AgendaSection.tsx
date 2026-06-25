import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BLUE, Colors, Radius, Spacing } from '../../constants';
import { AgendaItem } from '../../src/types';
import { formatDateForAgenda } from '../../src/utils/dateUtils';

interface Props {
  items: AgendaItem[];
  onItemPress: (item: AgendaItem) => void;
  onAddPress: () => void;
  onViewAll: () => void;
}

export default function AgendaSection({ items, onItemPress, onAddPress, onViewAll }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>المهام القادمة</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>عرض الكل</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome name="calendar-check-o" size={40} color={Colors.border} />
          <Text style={styles.emptyText}>لا توجد مهام مجدولة</Text>
          <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
            <Text style={styles.addBtnText}>+ إضافة مهمة</Text>
          </TouchableOpacity>
        </View>
      ) : (
        items.map(item => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => onItemPress(item)}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.facilityName}>{item.facilityName}</Text>
                <View style={styles.dateRow}>
                  <FontAwesome name="calendar" size={12} color={Colors.textSecondary} />
                  <Text style={styles.date}>{formatDateForAgenda(item.date)}</Text>
                </View>
                {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
              </View>
              <FontAwesome name="chevron-left" size={16} color={BLUE} />
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section:      { backgroundColor: Colors.textInverse, marginTop: Spacing.sm, paddingVertical: Spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.surfaceOffset },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  title:        { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  viewAll:      { color: BLUE, fontSize: 14, fontWeight: '500' },
  empty:        { alignItems: 'center', padding: 20, marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.surfaceOffset },
  emptyText:    { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  addBtn:       { marginTop: 10, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: BLUE, borderRadius: Radius.sm },
  addBtnText:   { color: Colors.textInverse, fontSize: 12, fontWeight: 'bold' },
  card:         { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, marginHorizontal: Spacing.base, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceOffset },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  facilityName: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  dateRow:      { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  date:         { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
  notes:        { fontSize: 13, color: '#34495e', marginTop: 2 },
});