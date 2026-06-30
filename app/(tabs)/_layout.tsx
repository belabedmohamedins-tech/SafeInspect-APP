// app/(tabs)/_layout.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants';
import { NotificationBell } from '../../components/layout/NotificationBell';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';

/** Small red badge rendered on top of the tab icon when count > 0. */
function OverdueBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={badge.container}>
      <Text style={badge.text}>{count > 9 ? '9+' : String(count)}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  container: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 9, minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
  },
  text: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default function TabLayout() {
  const [overdueCount, setOverdueCount] = useState(0);

  // Refresh overdue count on every render cycle (lightweight: just count)
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const all = await CorrectiveActionRepository.getAll();
        const today = new Date().toISOString().slice(0, 10);
        const count = all.filter(
          a => a.status !== 'resolved' && a.deadline < today,
        ).length;
        if (active) setOverdueCount(count);
      } catch { /* ignore */ }
    };
    refresh();
    const interval = setInterval(refresh, 60_000); // refresh every minute
    return () => { active = false; clearInterval(interval); };
  }, []);

  return (
    <View style={styles.background}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.blue,
          tabBarInactiveTintColor: '#95a5a6',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'SafeInspect',
            tabBarLabel: 'الرئيسية',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="home" size={size} color={color} />
            ),
            headerShown: true,
            headerRight: () => <NotificationBell />,
          }}
        />
        <Tabs.Screen
          name="inspection"
          options={{
            title: 'التفتيش',
            tabBarLabel: 'التفتيش',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="clipboard" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="cap"
          options={{
            title: 'الإجراءات التصحيحية',
            tabBarLabel: 'CAP',
            tabBarIcon: ({ color, size }) => (
              <View>
                <FontAwesome name="check-square-o" size={size} color={color} />
                <OverdueBadge count={overdueCount} />
              </View>
            ),
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="plus"
          options={{
            title: 'المزيد',
            tabBarLabel: 'المزيد',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="plus-circle" size={size} color={color} />
            ),
            headerTitle: 'القائمة',
            headerShown: true,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f8fcff',
  },
});
