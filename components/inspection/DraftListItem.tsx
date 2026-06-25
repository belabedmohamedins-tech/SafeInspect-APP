import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/colors';
import { SavedInspection } from '../../src/types';

interface Props {
  inspection: SavedInspection;
  onPress: () => void;
  onDelete: () => void;
}

export default function DraftListItem({ inspection, onPress, onDelete }: Props) {
  const isDraft = inspection.status === 'in-progress';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.content}>
        <Text style={styles.title}>{inspection.facilityName || 'تفتيش بدون اسم'}</Text>
        <Text style={styles.subtitle}>{inspection.facilityAddress || 'بدون عنوان'}</Text>
        <Text style={styles.meta}>{isDraft ? 'مسودة' : 'مكتمل'} • {inspection.date ? new Date(inspection.date).toLocaleDateString('ar-SA') : ''}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert('تأكيد الحذف', 'هل تريد حذف هذا العنصر؟', [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'حذف', style: 'destructive', onPress: onDelete },
          ]);
        }}
      >
        <Text style={styles.deleteText}>حذف</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: { flex: 1, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.mid, marginBottom: 4 },
  meta: { fontSize: 12, color: Colors.blue },
  deleteButton: {
    backgroundColor: '#f7e6e6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: { color: Colors.red, fontWeight: '700' },
});
