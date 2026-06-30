// app/screens/supervisor-approvals.tsx
//
// Supervisor / Admin — server-side approval queue.
//
// Fetches pending approvals from GET /approvals on the SafeInspect API.
// Supports:
//   - Approve: POST /approvals/:id/approve   → backend notifies the inspector
//   - Return:  POST /approvals/:id/return    → modal to enter a comment
//
// Requires an active server session (server-login).
// If not logged in, shows a prompt to go to server-login.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../src/services/apiClient';
import { isLoggedIn } from '../../src/services/serverAuth';

// ── Types ────────────────────────────────────────────────────────────────────────

interface ApprovalInspection {
  id:             string;
  facilityId:     string;
  inspectorId:    string;
  status:         string;
  inspectionDate: string | null;
  inspector:      { name: string; matricule: string };
  facility:       { projectName: string; address: string; activity: string };
}

interface Approval {
  id:          string;
  inspectionId: string;
  status:      string;
  comment:     string | null;
  createdAt:   string;
  inspection:  ApprovalInspection;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ar-DZ', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SupervisorApprovalsScreen() {
  const router = useRouter();

  const [approvals,   setApprovals]   = useState<Approval[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [loggedIn,    setLoggedIn]    = useState<boolean | null>(null);

  // Return-comment modal
  const [returnModal,    setReturnModal]    = useState(false);
  const [returnTarget,   setReturnTarget]   = useState<Approval | null>(null);
  const [returnComment,  setReturnComment]  = useState('');
  const [actionLoading,  setActionLoading]  = useState(false);

  // Status filter
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'RETURNED'>('PENDING');

  // ── Auth check ─────────────────────────────────────────────────────────────

  useEffect(() => {
    isLoggedIn().then(v => setLoggedIn(v));
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────────

  const fetchApprovals = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await apiClient(`/approvals?status=${filter}`);
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        setError(json.error ?? `خطأ ${res.status}`);
        return;
      }
      const json = await res.json() as { approvals: Approval[] };
      setApprovals(json.approvals ?? []);
    } catch {
      setError('تعذّر الاتصال بالخادم');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    if (loggedIn === true) fetchApprovals();
    else if (loggedIn === false) setLoading(false);
  }, [loggedIn, filter]);

  // ── Actions ────────────────────────────────────────────────────────────────────

  async function handleApprove(approval: Approval) {
    Alert.alert(
      'تأكيد الموافقة',
      `هل تريد الموافقة على تقرير ${approval.inspection.facility.projectName}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'موافقة ✅',
          style: 'default',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await apiClient(`/approvals/${approval.id}/approve`, { method: 'POST' });
              if (res.ok) {
                setApprovals(prev => prev.filter(a => a.id !== approval.id));
              } else {
                const json = await res.json() as { error?: string };
                Alert.alert('خطأ', json.error ?? 'فشلت الموافقة');
              }
            } catch {
              Alert.alert('خطأ', 'تعذّر الاتصال بالخادم');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  }

  function openReturnModal(approval: Approval) {
    setReturnTarget(approval);
    setReturnComment('');
    setReturnModal(true);
  }

  async function handleReturn() {
    if (!returnTarget) return;
    if (!returnComment.trim()) {
      Alert.alert('يرجى إدخال سبب الإرجاع');
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiClient(`/approvals/${returnTarget.id}/return`, {
        method: 'POST',
        body:   JSON.stringify({ comment: returnComment.trim() }),
      });
      if (res.ok) {
        setApprovals(prev => prev.filter(a => a.id !== returnTarget.id));
        setReturnModal(false);
      } else {
        const json = await res.json() as { error?: string };
        Alert.alert('خطأ', json.error ?? 'فشل الإرجاع');
      }
    } catch {
      Alert.alert('خطأ', 'تعذّر الاتصال بالخادم');
    } finally {
      setActionLoading(false);
    }
  }

  // ── Render helpers ────────────────────────────────────────────────────────────

  function renderCard({ item }: { item: Approval }) {
    const isPending = item.status === 'PENDING';
    return (
      <View style={styles.card}>
        {/* Facility */}
        <Text style={styles.facilityName}>{item.inspection.facility.projectName}</Text>
        <Text style={styles.facilityMeta}>
          {item.inspection.facility.activity} — {item.inspection.facility.address}
        </Text>

        {/* Inspector + date */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>المفتش:</Text>
          <Text style={styles.infoValue}>
            {item.inspection.inspector.name} ({item.inspection.inspector.matricule})
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>تاريخ التفتيش:</Text>
          <Text style={styles.infoValue}>{formatDate(item.inspection.inspectionDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>تاريخ الإرسال:</Text>
          <Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Return comment if any */}
        {item.comment ? (
          <View style={styles.commentBox}>
            <Text style={styles.commentLabel}>سبب الإرجاع:</Text>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>
        ) : null}

        {/* Action buttons — only for PENDING */}
        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleApprove(item)}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>موافقة ✅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.returnBtn]}
              onPress={() => openReturnModal(item)}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>إرجاع 🔄</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status badge for non-pending */}
        {!isPending && (
          <View style={[
            styles.statusBadge,
            item.status === 'APPROVED' ? styles.badgeApproved : styles.badgeReturned,
          ]}>
            <Text style={styles.statusBadgeText}>
              {item.status === 'APPROVED' ? 'تمت الموافقة ✅' : 'مُرجَع 🔄'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────────

  if (loggedIn === false) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInIcon}>🔐</Text>
          <Text style={styles.notLoggedInTitle}>تسجيل الدخول مطلوب</Text>
          <Text style={styles.notLoggedInText}>
            يجب تسجيل الدخول بحساب المشرف للوصول إلى قائمة الموافقات.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/screens/server-login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الموافقات</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeCount}>
            {approvals.filter(a => a.status === 'PENDING').length}
          </Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {(['PENDING', 'APPROVED', 'RETURNED'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.tabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab === 'PENDING' ? 'قيد الانتظار' : tab === 'APPROVED' ? 'موافق عليها' : 'مُرجَعة'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️  {error}</Text>
          <TouchableOpacity onPress={() => fetchApprovals()} style={styles.retryBtn}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={approvals}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchApprovals(true); }}
              tintColor="#0EA5E9"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>لا توجد موافقات في هذا القسم</Text>
            </View>
          }
        />
      )}

      {/* Return-comment modal */}
      <Modal visible={returnModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>سبب الإرجاع</Text>
            <Text style={styles.modalSubtitle}>
              {returnTarget?.inspection.facility.projectName}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={returnComment}
              onChangeText={setReturnComment}
              placeholder="اكتب ملاحظاتك هنا..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              textAlign="right"
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setReturnModal(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleReturn}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalBtnText}>تأكيد الإرجاع</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#0F172A' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  backBtn:       { padding: 8 },
  backText:      { color: '#0EA5E9', fontSize: 16 },
  headerTitle:   { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
  badge:         { backgroundColor: '#EF4444', borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeCount:    { color: '#fff', fontSize: 12, fontWeight: '700' },
  tabs:          { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab:           { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1E293B', alignItems: 'center' },
  tabActive:     { backgroundColor: '#0EA5E9' },
  tabText:       { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list:          { paddingHorizontal: 16, paddingBottom: 32 },
  card:          { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  facilityName:  { color: '#F1F5F9', fontSize: 16, fontWeight: '700', textAlign: 'right', marginBottom: 4 },
  facilityMeta:  { color: '#94A3B8', fontSize: 13, textAlign: 'right', marginBottom: 12 },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  infoLabel:     { color: '#64748B', fontSize: 12 },
  infoValue:     { color: '#CBD5E1', fontSize: 12, flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  commentBox:    { backgroundColor: '#7F1D1D22', borderRadius: 8, padding: 10, marginTop: 10, borderWidth: 1, borderColor: '#EF444433' },
  commentLabel:  { color: '#FCA5A5', fontSize: 12, marginBottom: 4, textAlign: 'right' },
  commentText:   { color: '#FCD34D', fontSize: 13, textAlign: 'right' },
  actions:       { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn:     { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  approveBtn:    { backgroundColor: '#065F46' },
  returnBtn:     { backgroundColor: '#7C3AED22', borderWidth: 1, borderColor: '#7C3AED' },
  actionBtnText: { color: '#F1F5F9', fontWeight: '700', fontSize: 14 },
  statusBadge:   { marginTop: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  badgeApproved: { backgroundColor: '#065F4633', borderWidth: 1, borderColor: '#10B981' },
  badgeReturned: { backgroundColor: '#7C3AED22', borderWidth: 1, borderColor: '#7C3AED' },
  statusBadgeText: { color: '#A7F3D0', fontSize: 13, fontWeight: '600' },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText:     { color: '#FCA5A5', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn:      { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryText:     { color: '#0EA5E9', fontWeight: '600' },
  empty:         { alignItems: 'center', paddingTop: 64 },
  emptyIcon:     { fontSize: 48, marginBottom: 16 },
  emptyText:     { color: '#64748B', fontSize: 15, textAlign: 'center' },
  notLoggedIn:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  notLoggedInIcon:  { fontSize: 56, marginBottom: 20 },
  notLoggedInTitle: { color: '#F1F5F9', fontSize: 20, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  notLoggedInText:  { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  loginBtn:      { backgroundColor: '#0EA5E9', borderRadius: 12, paddingHorizontal: 36, paddingVertical: 14 },
  loginBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalOverlay:  { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalBox:      { backgroundColor: '#1E293B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:    { color: '#F1F5F9', fontSize: 18, fontWeight: '700', textAlign: 'right', marginBottom: 4 },
  modalSubtitle: { color: '#94A3B8', fontSize: 13, textAlign: 'right', marginBottom: 16 },
  modalInput:    { backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 1, borderColor: '#334155', color: '#F1F5F9', fontSize: 14, padding: 12, minHeight: 100, marginBottom: 16 },
  modalActions:  { flexDirection: 'row', gap: 10 },
  modalBtn:      { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  modalCancelBtn:  { backgroundColor: '#334155' },
  modalConfirmBtn: { backgroundColor: '#7C3AED' },
  modalBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
});
