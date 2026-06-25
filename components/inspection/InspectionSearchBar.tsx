import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function InspectionSearchBar({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="بحث عن منشأة أو عنوان"
        placeholderTextColor={Colors.textSecondary}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  input: {
    backgroundColor: Colors.textInverse,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
  },
});
