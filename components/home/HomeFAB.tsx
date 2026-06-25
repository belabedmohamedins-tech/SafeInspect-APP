import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BLUE, Colors } from '../../constants';

interface Props {
  onNewInspection: () => void;
  onNewAgenda: () => void;
}

export default function HomeFAB({ onNewInspection, onNewAgenda }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.item} onPress={() => { setVisible(false); onNewInspection(); }}>
              <FontAwesome name="plus-circle" size={24} color={BLUE} />
              <Text style={[styles.itemText, { color: BLUE }]}>بدء تفتيش جديد</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.item} onPress={() => { setVisible(false); onNewAgenda(); }}>
              <FontAwesome name="calendar-plus-o" size={24} color={Colors.warning} />
              <Text style={[styles.itemText, { color: Colors.warning }]}>برمجة خرجة ميدانية</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab:      { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  overlay:  { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:    { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 },
  item:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10 },
  itemText: { fontSize: 18, fontWeight: '500', marginLeft: 15 },
  divider:  { height: 1, backgroundColor: Colors.surfaceOffset, marginVertical: 5 },
});