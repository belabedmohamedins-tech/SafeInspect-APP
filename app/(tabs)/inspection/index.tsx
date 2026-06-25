// app/(tabs)/inspection/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraftListItem from '../../../components/inspection/DraftListItem';
import EmptyInspectionState from '../../../components/inspection/EmptyInspectionState';
import InspectionFilterBar from '../../../components/inspection/InspectionFilterBar';
import InspectionSearchBar from '../../../components/inspection/InspectionSearchBar';
import { Colors, Spacing } from '../../../constants';
import { useInspectionList } from '../../../src/hooks/useInspectionList';
import { SavedInspection } from '../../../src/types';

export default function InspectionIndexScreen() {
  const router = useRouter();
  const {
    filtered, searchQuery, setSearchQuery,
    activeFilter, setActiveFilter, deleteInspection,
  } = useInspectionList();

  const handleDraftPress = (draft: SavedInspection) => {
    router.push({
      pathname: '/(tabs)/inspection/checklist',
      params: {
        draftId:         draft.id,
        facilityId:      draft.facilityId,
        facilityName:    draft.facilityName,
        facilityAddress: draft.facilityAddress,
      },
    });
  };

  const handleReportPress = (ins: SavedInspection) => {
    router.push(`/reports/${ins.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <InspectionSearchBar value={searchQuery} onChange={setSearchQuery} />
      <InspectionFilterBar active={activeFilter} onChange={setActiveFilter} />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DraftListItem
            inspection={item}
            onPress={() =>
              item.status === 'in-progress'
                ? handleDraftPress(item)
                : handleReportPress(item)
            }
            onDelete={() => deleteInspection(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyInspectionState onNewInspection={() => router.push('/(tabs)/inspection/start')} />
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  list:     { paddingBottom: Spacing.base },
});