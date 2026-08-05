// app/screens/supervisor-approvals.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, SafeAreaView, ActivityIndicator, RefreshControl,
  Animated, I18nManager,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SavedInspection } from '../../src/types';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { useTranslation } from '../../src/i18n';
import { approveInspection, rejectInspection } from '../../src/services/serverAuth';

I18nManager.forceRTL(true);

type FilterState = 'pending' | 'approved' | 'rejected';

export default function SupervisorApprovalsScreen() {
  const router = useRouter();
  const { t }  = useTranslation();

  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [filter, setFilter]           = useState<FilterState>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const load = useCallback(async () => {
    setLoading(true);
    const all = await InspectionRepository.getAll();
    setInspections(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const all = await InspectionRepository.getAll();
    setInspections(all);
    setRefreshing(false);
  };

  const filtered = inspections.filter(i => {
    if (filter === 'pending')  return i.status === 'submitted' || i.status === 'pending-review';
    if (filter === 'approved') return i.status === 'approved';
    if (filter === 'rejected') return i.status === 'rejected';
    return true;
  });

  const handleApprove = async (item: SavedInspection) => {
    setActionLoading(item.id);
    try {
      await approveInspection(item.id);
      await InspectionRepository.updateStatus(item.id, 'approved');
      setInspections(prev =>
        prev.map(i => i.id === item.id ? { ...i, status: 'approved' as const } : i),
      );
      Alert.alert('تمت الموافقة ✓', `تمت الموافقة على تقرير ${item.facilityName}`);
    } catch {
      Alert.alert('خطأ', 'تعذّرت الموافقة. تحقق من الاتصال.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (item: SavedInspection) => {
    Alert.alert(
      'رفض التقرير',
      `هل تريد رفض تقرير ${item.facilityName}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'رفض',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(item.id);
            try {
              await rejectInspection(item.id);
              await InspectionRepository.updateStatus(item.id, 'rejected');
              setInspections(prev =>
                prev.map(i => i.id === item.id ? { ...i, status: 'rejected' as const } : i),
              );
            } catch {
              Alert.alert('خطأ', 'تعذّر الرفض.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: SavedInspection }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.facilityName}>{item.facilityName}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('ar-DZ')}</Text>
      {item.facilityAddress ? (
        <Text style={styles.cardAddr}>{item.facilityAddress}</Text>
      ) : null}

      {(item.status === 'submitted' || item.status === 'pending-review') && (
        <View style={styles.actions}>
          {actionLoading === item.id ? (
            <ActivityIndicator size="small" color="#1e40af" />
          ) : (
            <>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleReject(item)}
              >
                <MaterialIcons name="close" size={16} color="#dc2626" />
                <Text style={styles.rejectBtnText}>رفض</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(item)}
              >
                <MaterialIcons name="check" size={16} color="#fff" />
                <Text style={styles.approveBtnText}>موافقة</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>موافقات المشرف</Text>
        <TouchableOpacity
          onPress={() => router.push('/screens/server-login' as unknown as Href)}
          style={styles.logoutBtn}
        >
          <MaterialIcons name="logout" size={20} color="#bfdbfe" />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['pending','approved','rejected'] as FilterState[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'pending' ? 'قيد الانتظار' : f === 'approved' ? 'موافق عليه' : 'مرفوض'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="inbox" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>لا توجد تقارير</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    submitted:      { bg: '#eff6ff', color: '#3b82f6', label: 'مُقدَّم' },
    'pending-review': { bg: '#fefce8', color: '#ca8a04', label: 'قيد المراجعة' },
    approved:       { bg: '#f0fdf4', color: '#16a34a', label: 'موافق عليه' },
    rejected:       { bg: '#fef2f2', color: '#dc2626', label: 'مرفوض' },
    draft:          { bg: '#f8fafc', color: '#64748b', label: 'مسودة' },
  };
  const s = map[status] ?? { bg: '#f8fafc', color: '#64748b', label: status };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1e40af', paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { padding: 6 },
  logoutBtn: { padding: 6 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  filterRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  filterTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  filterTabActive: { borderBottomWidth: 2, borderBottomColor: '#1e40af' },
  filterTabText: { fontSize: 13, color: '#64748b' },
  filterTabTextActive: { color: '#1e40af', fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  facilityName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1e293b', textAlign: 'right' },
  cardDate: { fontSize: 12, color: '#94a3b8', textAlign: 'right', marginTop: 4 },
  cardAddr: { fontSize: 12, color: '#64748b', textAlign: 'right', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'flex-end' },
  rejectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#fca5a5', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  rejectBtnText: { fontSize: 13, color: '#dc2626', fontWeight: '600' },
  approveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1e40af', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  approveBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 14, color: '#94a3b8' },
});
