import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  onCancel: () => void;
  onSignature: () => void;
  onFinish: () => void;
}

export default function ChecklistFooter({ onCancel, onSignature, onFinish }: Props) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
        <Text style={styles.cancelText}>إلغاء</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.signatureBtn]} onPress={onSignature}>
        <Text style={styles.signatureText}>توقيع</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.finishBtn]} onPress={onFinish}>
        <Text style={styles.finishText}>حفظ وإنهاء</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer:       { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: Colors.textInverse, borderTopWidth: 1, borderTopColor: Colors.border },
  btn:          { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn:    { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  cancelText:   { color: Colors.textSecondary, fontWeight: '600' },
  signatureBtn: { backgroundColor: Colors.warning },
  signatureText:{ color: Colors.textInverse, fontWeight: '600' },
  finishBtn:    { backgroundColor: Colors.primary },
  finishText:   { color: Colors.textInverse, fontWeight: '600' },
});
