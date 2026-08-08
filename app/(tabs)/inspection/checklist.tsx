// app/(tabs)/inspection/checklist.tsx
// Phase-5: opening-meeting gate safety-net + closing-meeting gate.
// Phase-6: decision-support panel shown when all items are evaluated;
//          escalationOverrideReason threaded into saveInspection.
// Phase-7: suggestDecision call site fixed — passes ScoringResult (from
//          computeScoreAndGrade) + diffView rather than the raw items array.
// Phase-U: empty-checklist guard — shows a clear error state when no criteria
//          load for the selected activity, instead of a blank list + Finish.
// Z12-04: removed duplicate createCapItemsFromInspection call from doFinish();
//         InspectionRepository.save() already calls it via capFactory.
// Z12-05: autosave draft on cancel so progress is never silently lost.
// W2: fix chevron direction — chevron-down when collapsed (invite to open),
//     chevron-up when expanded (invite to close). Standard accordion UX:
//     the arrow always points toward the action (down = more below, up = less).
// W3: fix scroll-jump on slow upward scroll — maintainVisibleContentPosition +
//     stickySectionHeadersEnabled=false + stable renderItem/renderSectionHeader
//     callbacks so VirtualizedList skips unnecessary row re-renders.
// W4: fix 3-step tap cycle (down→right→down before section opens). Root cause:
//     renderItem and renderSectionHeader each called isCollapsed() — a
//     useCallback — which could reflect different render-cycle snapshots,
//     causing Collapsible prop and chevron icon to be out of sync. Fix: both
//     callbacks now read directly from the collapsed Record<string,boolean>
//     (same object reference in the same render), so icon and Collapsible prop
//     are always guaranteed to match. dep arrays updated accordingly.

import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { suggestDecision, DecisionSuggestion } from '../../../src/services/decisionSupport';
import { SavedInspection } from '../../../src/types';
import { computeScoreAndGrade } from '../../../src/utils/scoringUtils';

// Stable minIndexForVisible so the object reference never changes between renders.
const MAINTAIN_VISIBLE = { minIndexForVisible: 0, autoscrollToTopThreshold: 10 };

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

  const inspectionType = (params.inspectionType as string | undefined) ?? 'routine';
  const priorInspectionId = params.priorInspectionId as string | undefined;
  const isFollowUp = inspectionType === 'follow-up';

  const openingFromParam = params.openingMeetingDone === 'true';
  const [openingDone, setOpeningDone] = useState(openingFromParam);
  const [closingDone, setClosingDone] = useState(false);
  const [showOpeningGate, setShowOpeningGate] = useState(!openingFromParam);
  const [showClosingGate, setShowClosingGate] = useState(false);
  const pendingFinish = useRef(false);

  const [escalationOverrideReason, setEscalationOverrideReason] = useState<string | undefined>(undefined);
  const [diffView, setDiffView] = useState<DifferentialView | null>(null);

  const checklistParams = {
    draftId: params.draftId as string | undefined,
    facilityId: params.facilityId as string,
    facilityName: params.facilityName as string,
    facilityAddress: params.facilityAddress as string,
    activity: params.activity as string | undefined,
    agendaId: params.agendaId as string | undefined,
    cause: (params.cause as string) ?? '',
    reference: (params.reference as string) ?? '',
    committeeMembers: parseStringArray(params.committeeMembers as string | string[] | undefined),
    writer: (params.writer as string) ?? '',
    lat: params.lat ? parseFloat(params.lat as string) : undefined,
    lng: params.lng ? parseFloat(params.lng as string) : undefined,
    inspectionType,
    priorInspectionId,
    openingMeetingDone: openingDone,
    closingMeetingDone: closingDone,
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
    saveDraft,
  } = useChecklistData(checklistParams, signature);

  // W4: destructure `collapsed` (the raw record) in addition to the helpers so
  // renderItem and renderSectionHeader can read from the SAME object reference
  // in the same render cycle — preventing icon/Collapsible desync.
  const { collapsed, toggleSection, getSectionProgress } = useCollapsibleSections(
    sections.map(s => s.title)
  );

  useEffect(() => {
    if (!isFollowUp || isLoading || data.length === 0) return;
    const shell: SavedInspection = {
      id: checklistParams.draftId ?? '__current__',
      facilityId: checklistParams.facilityId,
      facilityName: checklistParams.facilityName,
      facilityAddress: checklistParams.facilityAddress,
      date: new Date().toISOString(),
      inspectorName: '',
      items: data,
      status: 'in-progress',
      inspectionType: 'follow-up',
      priorInspectionId,
    };
    buildDifferentialView(shell).then(setDiffView).catch(console.error);
  }, [isFollowUp, isLoading, data.length]);

  const allEvaluated =
    !isLoading && data.length > 0 && data.every(i => i.complianceStatus !== 'not-evaluated');

  const suggestedDecision = useMemo<DecisionSuggestion | null>(() => {
    if (!allEvaluated) return null;
    const scoring = computeScoreAndGrade(data);
    return suggestDecision(scoring, diffView);
  }, [allEvaluated, data, diffView]);

  const handleOpeningConfirmed = () => {
    setShowOpeningGate(false);
    setOpeningDone(true);
  };

  const handleOpeningCancelled = () => {
    setShowOpeningGate(false);
    router.back();
  };

  const handleFinish = () => {
    if (suggestedDecision?.urgency === 'critical' && !escalationOverrideReason) {
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
  };

  const handleCancel = () => {
    Alert.alert(
      'تأكيد الإلغاء',
      'هل أنت متأكد من إلغاء التفتيش؟ سيتم حفظ التقدم كمسودة.',
      [
        { text: 'استمرار التفتيش', style: 'cancel' },
        {
          text: 'إلغاء التفتيش',
          style: 'destructive',
          onPress: async () => {
            try {
              await saveDraft?.();
            } catch {
              // non-fatal — navigate regardless
            }
            router.replace('/(tabs)/inspection');
          },
        },
      ]
    );
  };

  // W4: read collapsed[section.title] directly (not via isCollapsed()) so the
  // Collapsible prop and the chevron icon in renderSectionHeader always come
  // from the SAME collapsed object reference in the same render pass.
  const renderItem = useCallback(
    ({ item, section }: { item: any; section: any }) => {
      const diffEntry = isFollowUp
        ? diffView?.all.find((e: any) => e.item.id === item.id)
        : undefined;
      return (
        <Collapsible collapsed={collapsed[section.title] ?? true}>
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
    },
    [collapsed, isFollowUp, diffView, handleStatusChange, handleCommentChange, handlePhotoTake, handleNumericChange]
  );

  // W2: chevron-down = collapsed (section closed, one tap opens it)
  //     chevron-up   = expanded  (section open,   one tap closes it)
  // W4: read collapsed[title] directly — same snapshot as renderItem's
  //     Collapsible prop so icon and open/close state never diverge.
  const renderSectionHeader = useCallback(
    ({ section: { title, data: sectionData } }: { section: { title: string; data: any[] } }) => (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(title)}
      >
        <FontAwesome
          name={(collapsed[title] ?? true) ? 'chevron-down' : 'chevron-up'}
          size={14}
          color={Colors.textPrimary}
          style={{ marginLeft: Spacing.sm }}
        />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionProgress}>{getSectionProgress(sectionData)}</Text>
      </TouchableOpacity>
    ),
    [collapsed, toggleSection, getSectionProgress]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>جاري تحميل قائمة التفتيش...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <FontAwesome name="exclamation-triangle" size={40} color={Colors.warning ?? '#f39c12'} />
        <Text style={styles.emptyTitle}>لا توجد معايير لهذا النشاط</Text>
        <Text style={styles.emptySubtitle}>
          تحقق من نوع المنشأة المختار أو تواصل مع مسؤول التطبيق
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>العودة</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ChecklistHeader
        facilityName={checklistParams.facilityName}
        facilityAddress={checklistParams.facilityAddress}
      />

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
        // W3: prevents layout-shift-induced scroll-jumps when items above the
        // visible area change height (e.g. Collapsible open/close, status update).
        maintainVisibleContentPosition={MAINTAIN_VISIBLE}
        // W3: sticky headers force re-measurement on every render cycle which
        // compounds the scroll-jump. Disable them — section headers are still
        // visible as normal rows.
        stickySectionHeadersEnabled={false}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          isFollowUp ? (
            <DifferentialBanner
              diff={diffView}
              priorDate={diffView?.priorInspection?.date}
            />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        ListFooterComponent={
          <>
            {suggestedDecision && (
              <DecisionSupportPanel
                suggestion={suggestedDecision}
                overrideReason={escalationOverrideReason}
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
  safeArea: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  loadingText: { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceOffset,
    borderRadius: 8,
  },
  backButtonText: { fontSize: 14, color: Colors.textPrimary },
  meetingDoneStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eafaf1',
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#a9dfbf',
  },
  meetingDoneText: { fontSize: 12, color: '#27ae60', fontWeight: '600' },
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
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  sectionProgress: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  diffPipContainer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xs },
});
