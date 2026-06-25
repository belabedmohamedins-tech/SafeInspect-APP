import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  active: 'all' | 'completed' | 'in-progress';
  onChange: (value: 'all' | 'completed' | 'in-progress') => void;
}

const options: Array<{ label: string; value: Props['active'] }> = [
  { label: 'الكل',    value: 'all' },
  { label: 'مكتمل',  value: 'completed' },
  { label: 'مسودة',  value: 'in-progress' },
];

export default function InspectionFilterBar({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const selected = active === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, selected && styles.activeOption]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.optionText, selected && styles.activeOptionText]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  option:          { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.background },
  activeOption:    { backgroundColor: Colors.primary },
  optionText:      { color: Colors.textPrimary, fontWeight: '600' },
  activeOptionText:{ color: Colors.textInverse },
});
