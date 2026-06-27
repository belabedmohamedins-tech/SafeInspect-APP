// app/screens/backup.tsx
//
// Backup & Restore screen.
// Reachable from Plus menu → 'النسخ الاحتياطي'.

import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, Spacing } from '../../constants';
import {
  exportBackup,
  getLastBackupDate,
  importBackup,
} from '../../src/services/BackupService';
import {
  flush as syncFlush,
  getSyncStatus,
  SyncStatus,
} from '../../src/services/SyncService';

type AlertState = { type: 'success' | 'error'; message: string } | null;

function InlineAlert({ alert }: { alert: AlertState }) {
  if (!alert) return null;
  const isSuccess = alert.type === 'success';
  return (
    <View
      style={[
        styles.alert,
        isSuccess ? styles.alertSuccess : styles.alertError,
      ]}
    >
      <FontAwesome
        name={isSuccess ? 'check-circle' : 'exclamation-circle'}
        size={16}
        color={isSuccess ? Colors.success : Colors.danger}
      />
      <Text
        style={[
          styles.alertText,
          { color: isSuccess ? Colors.success : Colors.danger },
        ]}
      >
        {alert.message}
      </Text>
    </View>
  );
}

function formatDate(d: Date | null): string {
  if (!d) return 'لا يوجد';
  return d.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BackupScreen() {
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadStatus = useCallback(async () => {
    const [backup, sync] = await Promise.all([
      getLastBackupDate(),
      getSyncStatus(),
    ]);
    setLastBackup(backup);
    setSyncStatus(sync);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setLoadingExport(true);
    setAlert(null);
    try {
      const payload = await exportBackup();
      showAlert(
        'success',
        `تم تصدير ${payload.inspections.length} تفتيش و${payload.agenda.length} موعد بنجاح`,
      );
      void loadStatus();
    } catch (e: any) {
      showAlert('error', e?.message ?? 'فشل التصدير');
    } finally {
      setLoadingExport(false);
    }
  };

  // ── Import ──────────────────────────────────────────────────────────────
  const handleImport = () => {
    Alert.alert(
      'استعادة النسخة الاحتياطية',
      'سيتم استبدال جميع البيانات الحالية بمحتوى ملف النسخة الاحتياطية. هل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استعادة',
          style: 'destructive',
          onPress: async () => {
            setLoadingImport(true);
            setAlert(null);
            try {
              const result = await importBackup();
              if (result === null) {
                // user cancelled picker
              } else {
                showAlert(
                  'success',
                  `تمت الاستعادة: ${result.inspections} تفتيش، ${result.agenda} موعد، ${result.userFacilities} منشأة`,
                );
                void loadStatus();
              }
            } catch (e: any) {
              showAlert('error', e?.message ?? 'فشل الاستعادة');
            } finally {
              setLoadingImport(false);
            }
          },
        },
      ],
    );
  };

  // ── Sync ─────────────────────────────────────────────────────────────────
  const handleSync = async () => {
    setLoadingSync(true);
    setAlert(null);
    try {
      const synced = await syncFlush();
      if (synced > 0) {
        showAlert('success', `تمت مزامنة ${synced} تفتيش`);
      } else if (!syncStatus?.isOnline) {
        showAlert('error', 'لا يوجد اتصال بالإنترنت');
      } else if ((syncStatus?.pendingCount ?? 0) === 0) {
        showAlert('success', 'جميع البيانات محدّثة');
      } else {
        showAlert('error', 'فشل الاتصال بالخادم — سيتم المحاولة تلقائياً');
      }
      void loadStatus();
    } catch (e: any) {
      showAlert('error', e?.message ?? 'فشل المزامنة');
    } finally {
      setLoadingSync(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>النسخ الاحتياطي والمزامنة</Text>
        <Text style={styles.sub}>
          احتفظ بنسخة احتياطية من بياناتك أو استعدها، وزامن التفتيشات مع
          الخادم المركزي.
        </Text>

        <InlineAlert alert={alert} />

        {/* ── Local Backup card ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="database" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>النسخة الاحتياطية المحلية</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>آخر نسخة احتياطية</Text>
            <Text style={styles.infoValue}>{formatDate(lastBackup)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleExport}
            disabled={loadingExport}
            activeOpacity={0.8}
          >
            {loadingExport ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="cloud-upload" size={16} color="#fff" />
                <Text style={styles.btnText}>تصدير النسخة الاحتياطية</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={handleImport}
            disabled={loadingImport}
            activeOpacity={0.8}
          >
            {loadingImport ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <>
                <FontAwesome name="cloud-download" size={16} color={Colors.primary} />
                <Text style={[styles.btnText, { color: Colors.primary }]}>
                  استعادة من ملف
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Cloud Sync card ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="refresh" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>المزامنة مع الخادم</Text>
          </View>

          {/* Online / offline pill */}
          {syncStatus && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>حالة الاتصال</Text>
              <View
                style={[
                  styles.pill,
                  syncStatus.isOnline ? styles.pillOnline : styles.pillOffline,
                ]}
              >
                <Text style={styles.pillText}>
                  {syncStatus.isOnline ? 'متصل' : 'غير متصل'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>في انتظار المزامنة</Text>
            <Text style={styles.infoValue}>
              {syncStatus?.pendingCount ?? '—'} تفتيش
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>آخر مزامنة</Text>
            <Text style={styles.infoValue}>
              {formatDate(syncStatus?.lastSyncAt ?? null)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnPrimary,
              !syncStatus?.isOnline && styles.btnDisabled,
            ]}
            onPress={handleSync}
            disabled={loadingSync}
            activeOpacity={0.8}
          >
            {loadingSync ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="refresh" size={16} color="#fff" />
                <Text style={styles.btnText}>مزامنة الآن</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            تتم المزامنة التلقائية كل 15 دقيقة عند توفر الاتصال. لا تحتاج إلى
            ضبط أي إعدادات إضافية في وضع العمل بدون اتصال.
          </Text>
        </View>

        {/* ── Info card ─────────────────────────────────────────────────── */}
        <View style={[styles.card, styles.infoCard]}>
          <FontAwesome name="info-circle" size={18} color={Colors.textSecondary} />
          <Text style={styles.infoCardText}>
            ملاحظة: لا تتضمن النسخة الاحتياطية الصور المرفقة بالتفتيشات. يُنصح
            بإجراء نسخة احتياطية أسبوعية على الأقل.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },

  // Alert
  alert: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  alertSuccess: { backgroundColor: '#edfaf0' },
  alertError:   { backgroundColor: '#fef2f2' },
  alertText: { flex: 1, fontSize: 13, textAlign: 'right' },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: 13, color: Colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  // Buttons
  btn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  btnPrimary:   { backgroundColor: Colors.primary },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  // Online / offline pill
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  pillOnline:  { backgroundColor: '#d1fae5' },
  pillOffline: { backgroundColor: '#fee2e2' },
  pillText: { fontSize: 12, fontWeight: '600' },

  // Hint
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: 18,
  },

  // Info note card
  infoCard: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceOffset,
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  infoCardText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: 18,
  },
});
