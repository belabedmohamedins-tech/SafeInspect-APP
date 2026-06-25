import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Signature from 'react-native-signature-canvas';

interface Props {
  visible: boolean;
  onConfirm: (sig: string) => void;
  onClose: () => void;
}

export default function SignatureModal({ visible, onConfirm, onClose }: Props) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>التوقيع</Text>
          <Signature
            onOK={onConfirm}
            onEmpty={() => {}}
            descriptionText="وقع هنا"
            clearText="مسح"
            confirmText="حفظ"
            webStyle={`
              .m-signature-pad { box-shadow: none; border: 1px solid #bdc3c7; border-radius: 8px; }
              .m-signature-pad--body { border: none; }
              .m-signature-pad--footer { display: none; }
              .m-signature-pad--body canvas { width: 100%; height: 100%; }
            `}
          />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#2c3e50',
  },
  closeBtn: {
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  closeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
