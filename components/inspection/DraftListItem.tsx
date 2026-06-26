import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants';
import { SavedInspection } from '../../src/types';

interface Props {
  inspection: SavedInspection;
  onPress: () => void;
  onDelete?: () => void;  // optional — when omitted the delete button is hidden
}

export default function DraftListItem({ inspection, onPress, onDelete }: Props) {
  const isDraft = inspection.status === 'in-progress';

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert('تأكيد الحذف', 'هل تريد حذف هذا العنصر؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.content}>
        <Text style={styles.title}>{inspection.facilityName || 'تفتيش بدون اسم'}</Text>
        <Text style={styles.subtitle}>{inspection.facilityAddress || 'بدون عنوان'}</Text>
        <Text style={styles.meta}>{isDraft ? 'مسودة' : 'مكتمل'} • {inspection.date ? new Date(inspection.date).toLocaleDateString('ar-SA') : ''}</Text>
      </View>

      {/* Delete button — only shown when onDelete prop is provided */}
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>حذف</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.textInverse,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content:      { flex: 1, marginRight: 8 },
  title:        { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  subtitle:     { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  meta:         { fontSize: 12, color: Colors.primary },
  deleteButton: { backgroundColor: '#f7e6e6', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  deleteText:   { color: Colors.danger, fontWeight: '700' },
});
