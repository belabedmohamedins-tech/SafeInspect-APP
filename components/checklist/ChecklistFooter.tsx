import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants';

interface Props {
  onCancel: () => void;
  onSignature: () => void;
  onFinish: () => void;
}

export default function ChecklistFooter({ onCancel, onSignature, onFinish }: Props) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.btnText}>إلغاء</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signatureBtn} onPress={onSignature}>
        <FontAwesome name="pencil" size={18} color="#fff" />
        <Text style={[styles.btnText, { marginLeft: 8 }]}>توقيع</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.finishBtn} onPress={onFinish}>
        <Text style={styles.btnText}>إنهاء وحفظ التفتيش</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'space-between', margin: Spacing.base },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.danger,
    padding: 15,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  signatureBtn: {
    flex: 1,
    backgroundColor: Colors.warning,
    padding: 15,
    borderRadius: Radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },
  finishBtn: {
    flex: 1,
    backgroundColor: Colors.success,
    padding: 15,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  btnText: { color: Colors.textInverse, fontSize: 16, fontWeight: 'bold' },
});
