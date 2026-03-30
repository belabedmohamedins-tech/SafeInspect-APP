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
import { ComplianceStatus, InspectionItem } from '../src/types';

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

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return '#4caf50';
      case 'non-compliant':
        return '#f44336';
      case 'na':
        return '#9e9e9e';
      default:
        return '#f0f0f0';
    }
  };

  const getStatusText = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return 'مطابق';
      case 'non-compliant':
        return 'غير مطابق';
      case 'na':
        return 'غير معني';
      default:
        return 'لم يقيم';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with axis/category badges and info button */}
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
                item.controlType === 'doc' && styles.controlDoc,
                item.controlType === 'test' && styles.controlTest,
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
          <FontAwesome name="info-circle" size={20} color="#3E729B" />
        </TouchableOpacity>
      </View>

      {/* Criteria text */}
      <Text style={styles.criteria}>{item.criteria}</Text>
      <Text style={styles.reference}>{item.legalReference}</Text>

      {/* Status buttons: مطابق, غير مطابق, غير معني */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            item.complianceStatus === 'compliant' && styles.statusButtonActive,
            { backgroundColor: item.complianceStatus === 'compliant' ? '#4caf50' : '#f0f0f0' },
          ]}
          onPress={() => onStatusChange(item.id, 'compliant')}>
          <Text
            style={[
              styles.statusButtonText,
              item.complianceStatus === 'compliant' && styles.statusButtonTextActive,
            ]}>
            مطابق
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            item.complianceStatus === 'non-compliant' && styles.statusButtonActive,
            { backgroundColor: item.complianceStatus === 'non-compliant' ? '#f44336' : '#f0f0f0' },
          ]}
          onPress={() => onStatusChange(item.id, 'non-compliant')}>
          <Text
            style={[
              styles.statusButtonText,
              item.complianceStatus === 'non-compliant' && styles.statusButtonTextActive,
            ]}>
            غير مطابق
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            item.complianceStatus === 'na' && styles.statusButtonActive,
            { backgroundColor: item.complianceStatus === 'na' ? '#9e9e9e' : '#f0f0f0' },
          ]}
          onPress={() => onStatusChange(item.id, 'na')}>
          <Text
            style={[
              styles.statusButtonText,
              item.complianceStatus === 'na' && styles.statusButtonTextActive,
            ]}>
            غير معني
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <FontAwesome name="camera" size={18} color="#2196f3" />
        </TouchableOpacity>
      </View>

      {/* Comment toggle (only if non-compliant or na) */}
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

      {/* Modal for full legal reference */}
      <Modal
        animationType="slide"
        transparent={true}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  axisBadge: {
    backgroundColor: '#3498db20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  axisText: {
    fontSize: 11,
    color: '#3E729B',
  },
  categoryBadge: {
    backgroundColor: '#9b59b620',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#9b59b6',
  },
  controlBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  controlVisual: {
    backgroundColor: '#2ecc7120',
  },
  controlDoc: {
    backgroundColor: '#f39c1220',
  },
  controlTest: {
    backgroundColor: '#e67e2220',
  },
  controlText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2c3e50',
  },
  infoButton: {
    padding: 4,
  },
  criteria: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reference: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonActive: {
    // backgroundColor handled inline
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  cameraButton: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    marginHorizontal: 2,
    width: 40,
    alignItems: 'center',
  },
  addComment: {
    color: '#2196f3',
    marginVertical: 8,
    textAlign: 'right',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalReference: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#3E729B',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InspectionItemComponent;