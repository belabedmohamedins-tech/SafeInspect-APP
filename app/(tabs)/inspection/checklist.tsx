// app/(tabs)/inspection/checklist.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChecklistFooter from '../../../components/checklist/ChecklistFooter';
import ChecklistHeader from '../../../components/checklist/ChecklistHeader';
import ChecklistProgressBar from '../../../components/checklist/ChecklistProgressBar';
import SignatureModal from '../../../components/checklist/SignatureModal';
import InspectionItem from '../../../components/InspectionItem';
import { Colors, Spacing } from '../../../constants';
import { DifferentialBanner } from '../../../src/components/DifferentialBanner';
import { DiffStatusIndicator } from '../../../src/components/DiffStatusIndicator';
import { useChecklistData } from '../../../src/hooks/useChecklistData';
import { useCollapsibleSections } from '../../../src/hooks/useCollapsibleSections';
import { useSignature } from '../../../src/hooks/useSignature';
import {
  buildDifferentialView,
  DifferentialView,
} from '../../../src/services/differentialView';
import { createCapItemsFromInspection } from '../../../src/services/capFactory';
import { SavedInspection } from '../../../src/types';
import { InspectionRepository } from '../../../src/repositories/InspectionRepository';

/** Safely parse a JSON string that is expected to be a string[]. */
function parseStringArray(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const str = Array.isArray(raw) ? raw[0] : raw;
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }
}

export default function ChecklistScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const { showSignature, setShowSignature, signature, handleSignature } = useSignature();

  // ── Phase-3: inspection type + prior id ─────────────────────────────────────
  const inspectionType     = (params.inspectionType as string | undefined) ?? 'routine';
  const priorInspectionId  = params.priorInspectionId as string | undefined;
  const isFollowUp         = inspectionType === 'follow-up';

  // ── Phase-3: differential view state ────────────────────────────────────────
  const [diffView, setDiffView] = useState<DifferentialView | null>(null);

  const checklistParams = {
    draftId:            params.draftId as string | undefined,
    facilityId:         params.facilityId as string,
    facilityName:       params.facilityName as string,
    facilityAddress:    params.facilityAddress as string,
    activity:           params.activity as string | undefined,
    agendaId:           params.agendaId as string | undefined,
    cause:              (params.cause     as string) ?? '',
    reference:          (params.reference as string) ?? '',
    committeeMembers:   parseStringArray(params.committeeMembers as string | string[] | undefined),
    writer:             (params.writer    as string) ?? '',
    lat:                params.lat ? parseFloat(params.lat as string) : undefined,
    lng:                params.lng ? parseFloat(params.lng as string) : undefined,
    // Phase-3
    inspectionType,
    priorInspectionId,
  };

  const {
    data,
    isLoading,
    sections,
    totalItems,
    evaluatedItems,
    progressPercent,
    handleStatusChange,
    handleCommentChange,
    handlePhotoTake,
    handleFinish: _handleFinish,
  } = useChecklistData(checklistParams, signature);

  const { isCollapsed, toggleSection, getSectionProgress } = useCollapsibleSections(
    sections.map(s => s.title)
  );

  // ── Phase-3: load differential view once data is ready ─────────────────────
  useEffect(() => {
    if (!isFollowUp || isLoading || data.length === 0) return;

    const shell: SavedInspection = {
      id:             checklistParams.draftId ?? '__current__',
      facilityId:     checklistParams.facilityId,
      facilityName:   checklistParams.facilityName,
      facilityAddress: checklistParams.facilityAddress,
      date:           new Date().toISOString(),
      inspectorName:  '',
      items:          data,
      status:         'in-progress',
      inspectionType: 'follow-up',
      priorInspectionId,
    };

    buildDifferentialView(shell).then(setDiffView).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFollowUp, isLoading, data.length]);

  // ── Phase-4: wrap handleFinish to auto-create CAP items ────────────────────
  const handleFinish = async () => {
    await _handleFinish();
    // Retrieve the just-saved inspection to feed to capFactory.
    // We use draftId if available; otherwise look up the latest completed
    // inspection for this facility as a best-effort.
    try {
      let saved: SavedInspection | undefined;
      if (checklistParams.draftId) {
        saved = await InspectionRepository.getById(checklistParams.draftId);
      } else {
        const all = await InspectionRepository.getAll();
        saved = all
          .filter(i => i.facilityId === checklistParams.facilityId && i.status === 'completed')
          .sort((a, b) => b.date.localeCompare(a.date))[0];
      }
      if (saved) await createCapItemsFromInspection(saved);
    } catch (err) {
      // Non-fatal — CAP creation is best-effort; the inspection was already saved.
      console.warn('[CAP] Failed to auto-create corrective actions:', err);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'تأكيد الإلغاء',
      'هل أنت متأكد من إلغاء التفتيش؟ سيتم حفظ التقدم كمسودة.',
      [
        { text: 'استمرار التفتيش', style: 'cancel' },
        { text: 'إلغاء التفتيش', style: 'destructive', onPress: () => router.replace('/(tabs)/inspection') },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>جاري تحميل قائمة التفتيش...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ChecklistHeader
        facilityName={checklistParams.facilityName}
        facilityAddress={checklistParams.facilityAddress}
      />

      <ChecklistProgressBar
        evaluated={evaluatedItems}
        total={totalItems}
        percent={progressPercent}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          isFollowUp ? (
            <DifferentialBanner
              diff={diffView}
              priorDate={diffView?.priorInspection?.date}
            />
          ) : null
        }
        renderItem={({ item, section }) => {
          const diffEntry = isFollowUp
            ? diffView?.all.find(e => e.item.id === item.id)
            : undefined;

          return (
            <Collapsible collapsed={isCollapsed(section.title)}>
              <View>
                <InspectionItem
                  item={item}
                  onStatusChange={handleStatusChange}
                  onCommentChange={handleCommentChange}
                  onPhotoTake={handlePhotoTake}
                />
                {diffEntry && (
                  <View style={styles.diffPipContainer}>
                    <DiffStatusIndicator diffStatus={diffEntry.diffStatus} />
                  </View>
                )}
              </View>
            </Collapsible>
          );
        }}
        renderSectionHeader={({ section: { title, data: sectionData } }) => (
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(title)}>
            <FontAwesome
              name={isCollapsed(title) ? 'chevron-right' : 'chevron-down'}
              size={14}
              color={Colors.textPrimary}
              style={{ marginLeft: Spacing.sm }}
            />
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionProgress}>{getSectionProgress(sectionData)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        ListFooterComponent={
          <ChecklistFooter
            onCancel={handleCancel}
            onSignature={() => setShowSignature(true)}
            onFinish={handleFinish}
          />
        }
      />

      <SignatureModal
        visible={showSignature}
        onConfirm={handleSignature}
        onClose={() => setShowSignature(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1 },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText:   { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceOffset,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginTop: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle:    { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  sectionProgress: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  diffPipContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
});
