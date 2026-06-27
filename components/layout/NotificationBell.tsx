// components/layout/NotificationBell.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { NotificationRepository } from '../../src/repositories/NotificationRepository';

export function NotificationBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const n = await NotificationRepository.getUnreadCount();
    setCount(n);
  }, []);

  useFocusEffect(useCallback(() => {
    refresh();
    // Poll every 30 s while screen is focused
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]));

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => router.push('/screens/notifications')}
      accessibilityLabel="مركز الإشعارات"
    >
      <Text style={styles.icon}>🔔</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  icon:      { fontSize: 20 },
  badge:     { position: 'absolute', top: 0, right: 0, backgroundColor: '#e74c3c',
               borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center',
               justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
