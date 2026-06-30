// components/InspectionItem.tsx
// Phase-7:
//   • NumericInputField shown for measurement items BEFORE status is set
//     (entering a reading drives complianceStatus automatically via the hook).
//   • All 5 ComplianceStatus values available as buttons:
//     compliant / non-compliant / na / observation-only / unable-to-verify.
//   • STATUS_BUTTONS split into primary row (3) + secondary row (2 extras).

import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { memo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants';
import { NumericInputField } from '../src/components/NumericInputField';
import { copyToAppStorage, deletePhoto } from '../src/services/PhotoService';
import { ComplianceStatus, InspectionItem } from '../src/types';
import { getStatusColor, getStatusText } from '../src/utils/statusUtils';

interface Props {
  item: InspectionItem;
  onStatusChange:  (id: string, status: ComplianceStatus) => void;
  onCommentChange: (id: string, comment: string) => void;
  onPhotoTake:     (id: string, uri: string | undefined) => void;
  /** Phase-1.2 / Phase-7: called whenever the inspector changes a numeric measurement. */
  onNumericChange?: (id: string, value: number | undefined) => void;
}

/** Primary buttons — always visible. */
const PRIMARY_BUTTONS: ComplianceStatus[] = ['compliant', 'non-compliant', 'na'];

/**
 * Secondary buttons — shown in a smaller row beneath.
 * Phase 4 statuses: observation-only (no penalty) and unable-to-verify.
 */
const SECONDARY_BUTTONS: ComplianceStatus[] = ['observation-only', 'unable-to-verify'];

/** Map ControlType value → Arabic display label */
function controlTypeLabel(ct: string): string {
  switch (ct) {
    case 'visual':      return 'بصري';
    case 'doc':         return 'مستندي';
    case 'test':        return 'اختباري';
    case 'measurement': return 'قياسي';
    default:            return ct;
  }
}

/**
 * Wrapped in React.memo so that tapping one item's status button only
 * re-renders THAT item — not every item in the list.
 */
const InspectionItemComponent: React.FC<Props> = memo(function InspectionItemComponent({
  item,
  onStatusChange,
  onCommentChange,
  onPhotoTake,
  onNumericChange,
}) {
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  // ─── Photo source picker ─────────────────────────────────────────
  const handlePhotoPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['إلغاء', 'التقاط صورة', 'اختيار من المعرض'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await launchCamera();
          if (buttonIndex === 2) await launchGallery();
        }
      );
    } else {
      Alert.alert(
        'إضافة صورة',
        '',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'التقاط صورة', onPress: launchCamera },
          { text: 'اختيار من المعرض', onPress: launchGallery },
        ]
      );
    }
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('صلاحية مطلوبة', 'يرجى السماح باستخدام الكاميرا لالتقاط الصور');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.75,
    });
    if (!result.canceled) {
      await persistPhoto(result.assets[0].uri);
    }
  };

  const launchGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('صلاحية مطلوبة', 'يرجى السماح بالوصول إلى المعرض لاختيار الصورة');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
    });
    if (!result.canceled) {
      await persistPhoto(result.assets[0].uri);
    }
  };

  const persistPhoto = async (tempUri: string) => {
    try {
      if (item.photoUri) {
        await deletePhoto(item.photoUri);
      }
      const permanentUri = await copyToAppStorage(tempUri, item.id);
      if (permanentUri) {
        onPhotoTake(item.id, permanentUri);
      } else {
        Alert.alert('خطأ', 'تعذّر حفظ الصورة. حاول مرة أخرى.');
      }
    } catch (error) {
      console.warn('[InspectionItem] persistPhoto error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الصورة.');
    }
  };

  // ─── Delete photo ────────────────────────────────────────────────
  const handleDeletePhoto = () => {
    Alert.alert(
      'حذف الصورة',
      'هل تريد حذف الصورة المرفقة بهذا البند؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            if (item.photoUri) await deletePhoto(item.photoUri);
            onPhotoTake(item.id, undefined);
            setPhotoModalVisible(false);
          },
        },
      ]
    );
  };

  // ─── Status button handler ───────────────────────────────────────
  const handleStatusPress = (status: ComplianceStatus) => {
    onStatusChange(
      item.id,
      item.complianceStatus === status ? 'not-evaluated' : status
    );
  };

  const isEvaluated   = item.complianceStatus !== 'not-evaluated';
  const hasMeasurement = !!item.numericField;

  return (
    <View style={styles.container}>

      {/* ── Header row: badges + info button ── */}
      <View style={styles.headerRow}>
        <View style={styles.badgeContainer}>
          {item.axis && (
            <View style={styles.axisBadge}>
              <Text style={styles.axisText}>{item.axis}</Text>
            </View>
          )}
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          {item.controlType && (
            <View
              style={[
                styles.controlBadge,
                item.controlType === 'visual'      && styles.controlVisual,
                item.controlType === 'doc'         && styles.controlDoc,
                item.controlType === 'test'        && styles.controlTest,
                item.controlType === 'measurement' && styles.controlMeasurement,
              ]}>
              <Text style={styles.controlText}>
                {controlTypeLabel(item.controlType)}
              </Text>
            </View>
          )}
          {/* Phase-7: show repeat-violation badge */}
          {item.isRepeatViolation && (
            <View style={styles.repeatBadge}>
              <Text style={styles.repeatBadgeText}>تكرار</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setLegalModalVisible(true)} style={styles.infoButton}>
          <FontAwesome name="info-circle" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Criteria + legal reference ── */}
      <Text style={styles.criteria}>{item.criteria}</Text>
      <Text style={styles.reference}>{item.legalReference}</Text>

      {/* ── Phase-7: Numeric field shown BEFORE status for measurement items ── */}
      {hasMeasurement && item.numericField && (
        <NumericInputField
          spec={item.numericField}
          value={item.numericValue}
          onChange={(v) => onNumericChange?.(item.id, v)}
          disabled={false}
        />
      )}

      {/* ── Primary status buttons (compliant / non-compliant / na) + camera ── */}
      <View style={[styles.buttonsRow, hasMeasurement && styles.buttonsRowTopMargin]}>
        {PRIMARY_BUTTONS.map((status) => {
          const active = item.complianceStatus === status;
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                { backgroundColor: active ? getStatusColor(status) : Colors.surfaceOffset },
                active && styles.statusButtonActive,
              ]}
              onPress={() => handleStatusPress(status)}
              accessibilityLabel={getStatusText(status)}
              accessibilityState={{ selected: active }}>
              <Text style={[styles.statusButtonText, active && styles.statusButtonTextActive]}>
                {getStatusText(status)}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.cameraButton,
            item.photoUri && styles.cameraButtonActive,
          ]}
          onPress={handlePhotoPress}
          accessibilityLabel="إضافة صورة"
        >
          <FontAwesome
            name="camera"
            size={18}
            color={item.photoUri ? Colors.textInverse : Colors.primary}
          />
          {item.photoUri && <View style={styles.photoDot} />}
        </TouchableOpacity>
      </View>

      {/* ── Secondary status buttons (observation-only / unable-to-verify) ── */}
      <View style={styles.secondaryRow}>
        {SECONDARY_BUTTONS.map((status) => {
          const active = item.complianceStatus === status;
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.secondaryButton,
                active && { backgroundColor: getStatusColor(status) + 'ee', borderColor: getStatusColor(status) },
              ]}
              onPress={() => handleStatusPress(status)}
              accessibilityLabel={getStatusText(status)}
              accessibilityState={{ selected: active }}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  active && { color: '#fff', fontWeight: '700' },
                ]}>
                {getStatusText(status)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Reset hint ── */}
      {isEvaluated && (
        <Text style={styles.resetHint}>اضغط على الزر المحدد مرة أخرى لإلغاء التقييم</Text>
      )}

      {/* ── Comment field ── */}
      {isEvaluated && (
        <TextInput
          style={styles.commentInput}
          placeholder="ملاحظات (اختياري)..."
          placeholderTextColor={Colors.textTertiary}
          value={item.comment}
          onChangeText={(text) => onCommentChange(item.id, text)}
          multiline
          textAlign="right"
        />
      )}

      {/* ── Photo thumbnail ── */}
      {item.photoUri && (
        <Pressable onPress={() => setPhotoModalVisible(true)} style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: item.photoUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.thumbnailOverlay}>
            <FontAwesome name="expand" size={14} color="#fff" />
          </View>
        </Pressable>
      )}

      {/* Full-screen photo viewer */}
      <Modal
        animationType="fade"
        transparent
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalBar}>
            <TouchableOpacity
              onPress={handleDeletePhoto}
              style={styles.photoModalAction}
              accessibilityLabel="حذف الصورة"
            >
              <FontAwesome name="trash" size={20} color="#ff6b6b" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPhotoModalVisible(false)}
              style={styles.photoModalAction}
              accessibilityLabel="إغلاق"
            >
              <FontAwesome name="times" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          {item.photoUri && (
            <Image
              source={{ uri: item.photoUri }}
              style={styles.photoModalImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.photoModalCaption}>
            <Text style={styles.photoModalCaptionText} numberOfLines={2}>
              {item.criteria}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Legal reference modal */}
      <Modal
        animationType="slide"
        transparent
        visible={legalModalVisible}
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>السند القانوني</Text>
            <Text style={styles.modalReference}>{item.legalReference}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLegalModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },

  axisBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  axisText: { fontSize: 11, color: Colors.primary },

  categoryBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  categoryText: { fontSize: 11, color: Colors.warning },

  controlBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  controlVisual:      { backgroundColor: Colors.success + '20' },
  controlDoc:         { backgroundColor: Colors.warning + '20' },
  controlTest:        { backgroundColor: Colors.danger  + '20' },
  controlMeasurement: { backgroundColor: '#007AFF20' },
  controlText:        { fontSize: 11, fontWeight: '500', color: Colors.textPrimary },

  repeatBadge: {
    backgroundColor: '#ff6b6b22',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  repeatBadgeText: { fontSize: 11, fontWeight: '700', color: '#c0392b' },

  infoButton: { padding: Spacing.xs },

  criteria:  { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  reference: { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.md },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  buttonsRowTopMargin: { marginTop: Spacing.sm },

  statusButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    marginHorizontal: 2,
    borderRadius: Radius.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  statusButtonText:       { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  statusButtonTextActive: { color: Colors.textInverse },

  // ── Secondary row (observation-only / unable-to-verify) ──
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 5,
    marginHorizontal: 2,
    borderRadius: Radius.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceOffset,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  cameraButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.primary + '18',
    borderRadius: Radius.md - 2,
    marginHorizontal: 2,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cameraButtonActive: {
    backgroundColor: Colors.primary,
  },
  photoDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4cd964',
    borderWidth: 1,
    borderColor: Colors.surface,
  },

  resetHint: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },

  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
    textAlignVertical: 'top',
    minHeight: 56,
    color: Colors.textPrimary,
    fontSize: 13,
    backgroundColor: Colors.background,
  },

  thumbnailWrapper: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: Radius.md,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 4,
    padding: 4,
  },

  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalBar: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  photoModalAction: {
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.full,
  },
  photoModalImage: {
    width: '100%',
    height: '75%',
  },
  photoModalCaption: {
    position: 'absolute',
    bottom: 40,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  photoModalCaptionText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'right',
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalReference: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.base - 6,
    borderRadius: Radius.md - 2,
    alignItems: 'center',
  },
  modalCloseText: { color: Colors.textInverse, fontSize: 16, fontWeight: 'bold' },
});

export default InspectionItemComponent;
