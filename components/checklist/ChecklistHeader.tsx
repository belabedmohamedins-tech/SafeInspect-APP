import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  facilityName: string;
  facilityAddress: string;
}

export default function ChecklistHeader({ facilityName, facilityAddress }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.facilityName} numberOfLines={1}>{facilityName}</Text>
      <Text style={styles.facilityAddress} numberOfLines={1}>{facilityAddress}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.textInverse,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  facilityName:    { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'right' },
  facilityAddress: { fontSize: 13, color: Colors.textSecondary, textAlign: 'right', marginTop: 2 },
});
