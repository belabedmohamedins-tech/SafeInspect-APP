import React from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants';
import DraftListItem from '../inspection/DraftListItem';
import { SavedInspection } from '../../src/types';

interface Props {
  drafts: SavedInspection[];
  recent: SavedInspection[];
  onInspectionPress: (inspection: SavedInspection) => void;
  onDeleteInspection: (id: string) => void;
}

export default function InspectionSection({
  drafts,
  recent,
  onInspectionPress,
  onDeleteInspection,
}: Props) {
  const sections = [
    ...(drafts.length > 0 ? [{ title: 'المسودات', data: drafts }] : []),
    ...(recent.length > 0 ? [{ title: 'آخر التفتيشات', data: recent }] : []),
  ];

  if (sections.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>لا توجد تفتيشات بعد. اضغط ➕ لبدء تفتيش جديد.</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DraftListItem
          inspection={item}
          onPress={() => onInspectionPress(item)}
          onDelete={() => onDeleteInspection(item.id)}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 4, backgroundColor: Colors.background },
  sectionTitle:  { fontSize: 14, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText:     { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
