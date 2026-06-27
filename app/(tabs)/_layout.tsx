// app/(tabs)/_layout.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants';
import { NotificationBell } from '../../components/layout/NotificationBell';

export default function TabLayout() {
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
