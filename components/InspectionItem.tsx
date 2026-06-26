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

const InspectionItemComponent: React.FC<Props> = ({
  item,
  onStatusChange,
  onCommentChange,
  onPhotoTake,
}) => {
  const [showComment, setShowComment] = useState(false);
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

  return (
    <View style={styles.container}>
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
                {item.controlType === 'visual'
                  ? 'بصري'
                  : item.controlType === 'doc'
                  ? 'مستندي'
                  : 'اختباري'}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.infoButton}>
          <FontAwesome name="info-circle" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.criteria}>{item.criteria}</Text>
      <Text style={styles.reference}>{item.legalReference}</Text>

      <View style={styles.buttonsRow}>
        {(['compliant', 'non-compliant', 'na'] as ComplianceStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  item.complianceStatus === status
                    ? getStatusColor(status)
                    : Colors.surfaceOffset,
              },
            ]}
            onPress={() => onStatusChange(item.id, status)}>
            <Text
              style={[
                styles.statusButtonText,
                item.complianceStatus === status && styles.statusButtonTextActive,
              ]}>
              {getStatusText(status)}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <FontAwesome name="camera" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {(item.complianceStatus === 'non-compliant' || item.complianceStatus === 'na') && (
        <TouchableOpacity onPress={() => setShowComment(!showComment)}>
          <Text style={styles.addComment}>
            {showComment ? 'إخفاء التعليق' : '➕ إضافة تعليق'}
          </Text>
        </TouchableOpacity>
      )}

      {showComment && (
        <TextInput
          style={styles.commentInput}
          placeholder="أدخل ملاحظاتك هنا..."
          value={item.comment}
          onChangeText={(text) => onCommentChange(item.id, text)}
          multiline
        />
      )}

      {item.photoUri && (
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
      )}

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

  addComment: { color: Colors.primary, marginVertical: Spacing.sm, textAlign: 'right' },

  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    textAlignVertical: 'top',
    minHeight: 60,
    color: Colors.textPrimary,
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
