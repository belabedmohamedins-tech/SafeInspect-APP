// components/InspectionItem.tsx
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants';
import { ComplianceStatus, InspectionItem } from '../src/types';
import { getStatusColor, getStatusText } from '../src/utils/statusUtils';

interface Props {
  item: InspectionItem;
  onStatusChange: (id: string, status: ComplianceStatus) => void;
  onCommentChange: (id: string, comment: string) => void;
  onPhotoTake: (id: string, uri: string) => void;
}

/** All four status buttons shown in the action row, including reset. */
const STATUS_BUTTONS: ComplianceStatus[] = ['compliant', 'non-compliant', 'na'];

const InspectionItemComponent: React.FC<Props> = ({
  item,
  onStatusChange,
  onCommentChange,
  onPhotoTake,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('صلاحية الكاميرا مطلوبة لالتقاط الصور');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      onPhotoTake(item.id, result.assets[0].uri);
    }
  };

  /** Tapping the active status button resets the item to 'not-evaluated'. */
  const handleStatusPress = (status: ComplianceStatus) => {
    if (item.complianceStatus === status) {
      onStatusChange(item.id, 'not-evaluated');
    } else {
      onStatusChange(item.id, status);
    }
  };

  const isEvaluated = item.complianceStatus !== 'not-evaluated';

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
                item.controlType === 'visual' && styles.controlVisual,
                item.controlType === 'doc'    && styles.controlDoc,
                item.controlType === 'test'   && styles.controlTest,
              ]}>
              <Text style={styles.controlText}>
                {item.controlType === 'visual' ? 'بصري'
                  : item.controlType === 'doc' ? 'مستندي'
                  : 'اختباري'}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.infoButton}>
          <FontAwesome name="info-circle" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Criteria + legal reference ── */}
      <Text style={styles.criteria}>{item.criteria}</Text>
      <Text style={styles.reference}>{item.legalReference}</Text>

      {/* ── Status buttons + camera ── */}
      <View style={styles.buttonsRow}>
        {STATUS_BUTTONS.map((status) => {
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
              <Text
                style={[
                  styles.statusButtonText,
                  active && styles.statusButtonTextActive,
                ]}>
                {getStatusText(status)}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <FontAwesome name="camera" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Reset hint (shown when a status is active) ── */}
      {isEvaluated && (
        <Text style={styles.resetHint}>اضغط على الزر المحدد مرة أخرى لإلغاء التقييم</Text>
      )}

      {/* ── Comment field — always visible once item has any status ── */}
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
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
      )}

      {/* ── Legal reference modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>السند القانوني</Text>
            <Text style={styles.modalReference}>{item.legalReference}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  controlVisual: { backgroundColor: Colors.success + '20' },
  controlDoc:    { backgroundColor: Colors.warning + '20' },
  controlTest:   { backgroundColor: Colors.danger  + '20' },
  controlText:   { fontSize: 11, fontWeight: '500', color: Colors.textPrimary },

  infoButton: { padding: Spacing.xs },

  criteria:  { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  reference: { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.md },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    marginHorizontal: 2,
    borderRadius: Radius.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonActive: {
    // Subtle elevation to reinforce selection
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  statusButtonText:       { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  statusButtonTextActive: { color: Colors.textInverse },

  cameraButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.primary + '18',
    borderRadius: Radius.md - 2,
    marginHorizontal: 2,
    width: 40,
    alignItems: 'center',
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

  thumbnail: { width: 100, height: 100, marginTop: Spacing.sm, borderRadius: Radius.sm },

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
