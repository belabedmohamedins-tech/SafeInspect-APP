// app/(tabs)/inspection/checklist.tsx
// Phase-5: opening-meeting gate safety-net + closing-meeting gate.
// Phase-6: decision-support panel shown when all items are evaluated;
//          escalationOverrideReason threaded into saveInspection.
// Phase-1.2: NumericInputField wired — handleNumericChange threaded into InspectionItem.

import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import MeetingGateModal from '../../../components/checklist/MeetingGateModal';
import SignatureModal from '../../../components/checklist/SignatureModal';
import InspectionItem from '../../../components/InspectionItem';
import { Colors, Spacing } from '../../../constants';
import { DifferentialBanner } from '../../../src/components/DifferentialBanner';
import { DiffStatusIndicator } from '../../../src/components/DiffStatusIndicator';
import { DecisionSupportPanel } from '../../../src/components/DecisionSupportPanel';
import { useChecklistData } from '../../../src/hooks/useChecklistData';
import { useCollapsibleSections } from '../../../src/hooks/useCollapsibleSections';
import { useSignature } from '../../../src/hooks/useSignature';
import {
  buildDifferentialView,
  DifferentialView,
} from '../../../src/services/differentialView';
import { suggestDecision, SuggestedDecision } from '../../../src/services/decisionSupport';
import { createCapItemsFromInspection } from '../../../src/services/capFactory';
import { InspectionRepository } from '../../../src/repositories/InspectionRepository';
import { SavedInspection } from '../../../src/types';

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

  // ── Phase-3 ───────────────────────────────────────────────────────────────
  const inspectionType    = (params.inspectionType as string | undefined) ?? 'routine';
  const priorInspectionId = params.priorInspectionId as string | undefined;
  const isFollowUp        = inspectionType === 'follow-up';

  // ── Phase-5: meeting gate state ──────────────────────────────────────────
  const openingFromParam = params.openingMeetingDone === 'true';
  const [openingDone,     setOpeningDone]     = useState(openingFromParam);
  const [closingDone,     setClosingDone]     = useState(false);
  const [showOpeningGate, setShowOpeningGate] = useState(!openingFromParam);
  const [showClosingGate, setShowClosingGate] = useState(false);
  const pendingFinish = useRef(false);

  // ── Phase-6: decision support state ─────────────────────────────────────
  const [escalationOverrideReason, setEscalationOverrideReason] = useState<string | undefined>(undefined);

  const [diffView, setDiffView] = useState<DifferentialView | null>(null);

  // ── Build checklist params ───────────────────────────────────────────────
  const checklistParams = {
    draftId:             params.draftId as string | undefined,
    facilityId:          params.facilityId as string,
    facilityName:        params.facilityName as string,
    facilityAddress:     params.facilityAddress as string,
    activity:            params.activity as string | undefined,
    agendaId:            params.agendaId as string | undefined,
    cause:               (params.cause     as string) ?? '',
    reference:           (params.reference as string) ?? '',
    committeeMembers:    parseStringArray(params.committeeMembers as string | string[] | undefined),
    writer:              (params.writer    as string) ?? '',
    lat:                 params.lat ? parseFloat(params.lat as string) : undefined,
    lng:                 params.lng ? parseFloat(params.lng as string) : undefined,
    inspectionType,
    priorInspectionId,
    // Phase-5: live flags
    openingMeetingDone: openingDone,
    closingMeetingDone: closingDone,
    // Phase-6: escalation override reason
    escalationOverrideReason,
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
    handleNumericChange,
    handleFinish: _handleFinish,
  } = useChecklistData(checklistParams, signature);

  const { isCollapsed, toggleSection, getSectionProgress } = useCollapsibleSections(
    sections.map(s => s.title)
  );

  // Phase-3: differential view
  useEffect(() => {
    if (!isFollowUp || isLoading || data.length === 0) return;
    const shell: SavedInspection = {
      id:              checklistParams.draftId ?? '__current__',
      facilityId:      checklistParams.facilityId,
      facilityName:    checklistParams.facilityName,
      facilityAddress: checklistParams.facilityAddress,
      date:            new Date().toISOString(),
      inspectorName:   '',
      items:           data,
      status:          'in-progress',
      inspectionType:  'follow-up',
      priorInspectionId,
    };
    buildDifferentialView(shell).then(setDiffView).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFollowUp, isLoading, data.length]);

  // ── Phase-6: compute suggested decision whenever items change ─────────────
  const allEvaluated = !isLoading && data.length > 0 &&
    data.every(i => i.complianceStatus !== 'not-evaluated');

  const suggestedDecision = useMemo<SuggestedDecision | null>(() => {
    if (!allEvaluated) return null;
    return suggestDecision(data);
  }, [allEvaluated, data]);

  // ── Phase-5: opening gate confirmed (safety-net path) ────────────────────
  const handleOpeningConfirmed = () => {
    setShowOpeningGate(false);
    setOpeningDone(true);
  };

  const handleOpeningCancelled = () => {
    setShowOpeningGate(false);
    router.back();
  };

  // ── Phase-5/6: handleFinish ──────────────────────────────────────────────
  const handleFinish = () => {
    if (
      suggestedDecision &&
      suggestedDecision.overrideRequired &&
      escalationOverrideReason === ''
    ) {
      Alert.alert(
        'سبب التجاوز مطلوب',
        'الإجراء المقترح يستوجب إدخال سبب التجاوز قبل الإنهاء.',
        [{ text: 'موافق' }],
      );
      return;
    }
    if (!closingDone) {
      pendingFinish.current = true;
      setShowClosingGate(true);
    } else {
      doFinish();
    }
  };

  const handleClosingConfirmed = () => {
    setShowClosingGate(false);
    setClosingDone(true);
    if (pendingFinish.current) {
      pendingFinish.current = false;
      setTimeout(doFinish, 0);
    }
  };

  const handleClosingCancelled = () => {
    pendingFinish.current = false;
    setShowClosingGate(false);
  };

  const doFinish = async () => {
    await _handleFinish();
    try {
      let saved: SavedInspection | undefined;
      if (checklistParams.draftId) {
        saved = (await InspectionRepository.getById(checklistParams.draftId)) ?? undefined;
      } else {
        const all = await InspectionRepository.getAll();
        saved = all
          .filter(i => i.facilityId === checklistParams.facilityId && i.status === 'completed')
          .sort((a, b) => b.date.localeCompare(a.date))[0];
      }
      if (saved) await createCapItemsFromInspection(saved);
    } catch (err) {
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

      {/* Phase-5: opening-meeting indicator strip */}
      {openingDone && (
        <View style={styles.meetingDoneStrip}>
          <FontAwesome name="handshake-o" size={13} color="#27ae60" />
          <Text style={styles.meetingDoneText}>تم اجتماع الافتتاح</Text>
        </View>
      )}

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
                  onNumericChange={handleNumericChange}
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
          <>
            {/* Phase-6: decision support panel */}
            {suggestedDecision && (
              <DecisionSupportPanel
                decision={suggestedDecision}
                onOverrideReasonChange={setEscalationOverrideReason}
              />
            )}
            <ChecklistFooter
              onCancel={handleCancel}
              onSignature={() => setShowSignature(true)}
              onFinish={handleFinish}
            />
          </>
        }
      />

      <SignatureModal
        visible={showSignature}
        onConfirm={handleSignature}
        onClose={() => setShowSignature(false)}
      />

      <MeetingGateModal
        visible={showOpeningGate}
        type="opening"
        facilityName={checklistParams.facilityName}
        onConfirm={handleOpeningConfirmed}
        onCancel={handleOpeningCancelled}
      />

      <MeetingGateModal
        visible={showClosingGate}
        type="closing"
        facilityName={checklistParams.facilityName}
        onConfirm={handleClosingConfirmed}
        onCancel={handleClosingCancelled}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:          { flex: 1 },
  centered:          { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText:       { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  meetingDoneStrip:  {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eafaf1', paddingHorizontal: Spacing.base,
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#a9dfbf',
  },
  meetingDoneText:   { fontSize: 12, color: '#27ae60', fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceOffset,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    marginTop: 4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border,
  },
  sectionTitle:     { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  sectionProgress:  { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  diffPipContainer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xs },
});
