// app/(tabs)/inspection/checklist.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, SectionList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChecklistFooter from '../../../components/checklist/ChecklistFooter';
import ChecklistHeader from '../../../components/checklist/ChecklistHeader';
import ChecklistProgressBar from '../../../components/checklist/ChecklistProgressBar';
import SignatureModal from '../../../components/checklist/SignatureModal';
import InspectionItem from '../../../components/InspectionItem';
import { Colors, Spacing } from '../../../constants';
import { useChecklistData } from '../../../src/hooks/useChecklistData';
import { useCollapsibleSections } from '../../../src/hooks/useCollapsibleSections';
import { useSignature } from '../../../src/hooks/useSignature';

export default function ChecklistScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const { showSignature, setShowSignature, signature, handleSignature } = useSignature();

  const checklistParams = {
    draftId:          params.draftId as string | undefined,
    facilityId:       params.facilityId as string,
    facilityName:     params.facilityName as string,
    facilityAddress:  params.facilityAddress as string,
    activity:         params.activity as string | undefined,
    agendaId:         params.agendaId as string | undefined,
    cause:            params.cause as string,
    reference:        params.reference as string,
    committeeMembers: [],
    writer:           params.writer as string,
    lat:              params.lat ? parseFloat(params.lat as string) : undefined,
    lng:              params.lng ? parseFloat(params.lng as string) : undefined,
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
    handleFinish,
  } = useChecklistData(checklistParams, signature);

  const { isCollapsed, toggleSection, getSectionProgress } = useCollapsibleSections(
    sections.map(s => s.title)
  );

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
        renderItem={({ item, section }) => (
          <Collapsible collapsed={isCollapsed(section.title)}>
            <InspectionItem
              item={item}
              onStatusChange={handleStatusChange}
              onCommentChange={handleCommentChange}
              onPhotoTake={handlePhotoTake}
            />
          </Collapsible>
        )}
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
});
