import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  facilityName: string;
  facilityAddress: string;
}

export default function ChecklistHeader({ facilityName, facilityAddress }: Props) {
  return (
    <View style={[styles.header, { backgroundColor: Colors.primary }]}>
      <Text style={styles.title}>
        {facilityName ? `تفتيش: ${facilityName}` : 'التفتيش البيئي'}
      </Text>
      {facilityAddress ? <Text style={styles.subtitle}>{facilityAddress}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.textInverse, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.border },
});
