import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BLUE, Colors } from '../../constants';

interface Props { officeName: string; }

export default function HomeHeader({ officeName }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.welcome}>{officeName || 'الهيكل البلدي لحفظ الصحة'}</Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString('ar-DZ', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header:  { backgroundColor: Colors.background, padding: 20, borderBottomWidth: 1, borderBottomColor: BLUE },
  welcome: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 2 },
  date:    { fontSize: 12, color: Colors.textTertiary },
});