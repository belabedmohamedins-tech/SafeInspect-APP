// components/CollapsibleSection.tsx
import { FontAwesome } from '@expo/vector-icons';
import React, { ReactNode, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<Props> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setIsOpen(!isOpen)} activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        <FontAwesome name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#3E729B" />
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});

export default CollapsibleSection;