// app/(tabs)/plus.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, Spacing } from '../../constants';

const MENU_ITEMS = [
  { name: 'المنشآت',            icon: 'building',      route: '/screens/facilities' },
  { name: 'التقارير',           icon: 'file-text',     route: '/screens/reports' },
  { name: 'إحصائيات',          icon: 'bar-chart',     route: '/screens/stats' },
  { name: 'المراجع',           icon: 'book',           route: '/screens/legal' },
  { name: 'قوائم التفتيش',     icon: 'print',         route: '/screens/checklists' },
  { name: 'الخريطة',           icon: 'map-marker',    route: '/screens/map' },
  { name: 'إجراءات تصحيحية',  icon: 'wrench',        route: '/screens/cap' },
  { name: 'سجل الأحداث',       icon: 'history',       route: '/screens/audit-log' },
  { name: 'طابور الاعتماد',    icon: 'check-square',  route: '/screens/approval-queue' },
  { name: 'الإشعارات',         icon: 'bell',          route: '/screens/notifications' },
  { name: 'ملفي الشخصي',      icon: 'user-circle',   route: '/screens/inspector-profile' },
  { name: 'النسخ الاحتياطي',   icon: 'cloud-upload',  route: '/screens/backup' },
  { name: 'الإعدادات',         icon: 'cog',           route: '/screens/settings' },
] as const;

export default function PlusScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>القائمة</Text>
      <FlatList
        data={MENU_ITEMS}
        keyExtractor={item => item.route}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.75}
          >
            <View style={styles.iconWrap}>
              <FontAwesome name={item.icon as any} size={26} color={Colors.primary} />
            </View>
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  row:  { gap: Spacing.md, marginBottom: Spacing.md },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xl,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceOffset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
