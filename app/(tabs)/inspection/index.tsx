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

  // FIX (P2): pass all stored draft metadata so useChecklistData can restore
  // writer / committeeMembers / cause / reference via paramsRef on load.
  // The hook reads these from paramsRef.current as a fallback only when the
  // stored draft fields are empty, so passing them here is safe.
  const handleDraftPress = (draft: SavedInspection) => {
    router.push({
      pathname: '/(tabs)/inspection/checklist',
      params: {
        draftId:          draft.id,
        facilityId:       draft.facilityId,
        facilityName:     draft.facilityName,
        facilityAddress:  draft.facilityAddress,
        activity:         draft.facilityActivity ?? '',
        cause:            draft.inspectionCause  ?? '',
        reference:        draft.referenceDocument ?? '',
        writer:           draft.inspectorName    ?? '',
        committeeMembers: JSON.stringify(draft.committeeMembers ?? []),
        lat: draft.coordinates?.latitude  != null ? String(draft.coordinates.latitude)  : '',
        lng: draft.coordinates?.longitude != null ? String(draft.coordinates.longitude) : '',
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
