import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  onNewInspection: () => void;
  onNewAgenda: () => void;
}

export default function HomeFAB({ onNewInspection, onNewAgenda }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <FontAwesome name="plus" size={24} color={Colors.textInverse} />
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.item} onPress={() => { setVisible(false); onNewInspection(); }}>
              <FontAwesome name="plus-circle" size={24} color={Colors.primary} />
              <Text style={[styles.itemText, { color: Colors.primary }]}>بدء تفتيش جديد</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.item} onPress={() => { setVisible(false); onNewAgenda(); }}>
              <FontAwesome name="calendar-plus-o" size={24} color={Colors.warning} />
              <Text style={[styles.itemText, { color: Colors.warning }]}>جدولة تفتيش جديدة</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: Colors.textInverse,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 36,
  },
  item:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemText: { fontSize: 17, fontWeight: '600', marginLeft: 12 },
  divider:  { height: 1, backgroundColor: Colors.border },
});
