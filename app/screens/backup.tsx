// app/screens/backup.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { Colors, FontSize, Radius, Spacing } from '../../constants';
import {
  BackupPayload,
  ImportResult,
  exportBackup,
  getLastBackupDate,
  importBackup,
} from '../../src/services/BackupService';

export default function BackupScreen() {
  const router = useRouter();

  const [lastBackup, setLastBackup]     = useState<Date | null>(null);
  const [exporting, setExporting]       = useState(false);
  const [importing, setImporting]       = useState(false);
  const [lastExport, setLastExport]     = useState<BackupPayload | null>(null);

  useEffect(() => {
    getLastBackupDate().then(setLastBackup);
  }, []);

  // ─── Export ────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const payload = await exportBackup();
      setLastExport(payload);
      setLastBackup(new Date(payload.exportedAt));
      Alert.alert(
        'تم التصدير ✔',
        [
          `الفحوصات: ${payload.inspections.length}`,
          `مهام الجدول: ${payload.agenda.length}`,
          `منشآت مضافة: ${payload.userFacilities.length}`,
        ].join('\n')
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'خطأ غير متوقع';
      Alert.alert('خطأ', msg);
    } finally {
      setExporting(false);
    }
  };

  // ─── Import ────────────────────────────────────────────────────
  const handleImport = () => {
    Alert.alert(
      'استيراد نسخة احتياطية',
      'سيتم استبدال جميع البيانات الحالية ببيانات الملف المختار. هذا الإجراء لا يمكن التراجع عنه.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'متابعة',
          style: 'destructive',
          onPress: doImport,
        },
      ]
    );
  };

  const doImport = async () => {
    setImporting(true);
    try {
      const result: ImportResult | null = await importBackup();
      if (!result) return; // user cancelled picker
      Alert.alert(
        'تم الاستيراد ✔',
        [
          `الفحوصات: ${result.inspections}`,
          `مهام الجدول: ${result.agenda}`,
          `منشآت مضافة: ${result.userFacilities}`,
        ].join('\n'),
        [{ text: 'حسناً', onPress: () => router.replace('/') }]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'خطأ غير متوقع';
      Alert.alert('خطأ في الاستيراد', msg);
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('ar-DZ') + ' — ' + d.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <FontAwesome name="arrow-right" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>النسخ الاحتياطي</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Last backup timestamp */}
        <View style={styles.statusCard}>
          <FontAwesome name="clock-o" size={20} color={lastBackup ? Colors.success : Colors.textTertiary} />
          <View style={styles.statusText}>
            <Text style={styles.statusLabel}>آخر نسخة احتياطية</Text>
            <Text style={[styles.statusValue, { color: lastBackup ? Colors.textPrimary : Colors.textTertiary }]}>
              {lastBackup ? formatDate(lastBackup) : 'لم يتم إجراء نسخ احتياطية بعد'}
            </Text>
          </View>
        </View>

        {/* Export section */}
        <Text style={styles.sectionTitle}>تصدير البيانات</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            ينشئ ملف JSON يحتوي على جميع الفحوصات، مهام الجدول، المنشآت المضافة، وإعدادات المفتش. يمكن مشاركته عبر البريد الإلكتروني أو حفظه في السحابة.
          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting
              ? <ActivityIndicator color={Colors.textInverse} />
              : <FontAwesome name="upload" size={16} color={Colors.textInverse} />}
            <Text style={styles.actionBtnText}>
              {exporting ? 'جاري التصدير...' : 'تصدير ومشاركة'}
            </Text>
          </TouchableOpacity>

          {/* Last export summary */}
          {lastExport && (
            <View style={styles.summary}>
              <SummaryRow icon="search" label="الفحوصات" value={lastExport.inspections.length} />
              <SummaryRow icon="calendar" label="مهام الجدول" value={lastExport.agenda.length} />
              <SummaryRow icon="building" label="منشآت مضافة" value={lastExport.userFacilities.length} />
            </View>
          )}
        </View>

        {/* Import section */}
        <Text style={styles.sectionTitle}>استيراد نسخة احتياطية</Text>
        <View style={[styles.card, styles.dangerCard]}>
          {/* Warning banner */}
          <View style={styles.warningBanner}>
            <FontAwesome name="exclamation-triangle" size={15} color={Colors.warning} />
            <Text style={styles.warningText}>
              سيؤدي الاستيراد إلى استبدال جميع البيانات الحالية. لا يمكن التراجع عن هذا الإجراء.
            </Text>
          </View>
          <Text style={[styles.cardDesc, { marginTop: Spacing.sm }]}>
            اختر ملف safeinspect-backup-*.json من جهازك لاستعادة جميع بياناتك.
          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.danger }]}
            onPress={handleImport}
            disabled={importing}
          >
            {importing
              ? <ActivityIndicator color={Colors.textInverse} />
              : <FontAwesome name="download" size={16} color={Colors.textInverse} />}
            <Text style={styles.actionBtnText}>
              {importing ? 'جاري الاستيراد...' : 'اختيار ملف واستيراد'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footnote}>
          ملاحظة: الصور المرفقة بالفحوص غير مضمّنة في ملف النسخ الاحتياطي.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <FontAwesome name={icon as any} size={14} color={Colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: Spacing.lg, paddingBottom: 48 },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  statusText:  { flex: 1, alignItems: 'flex-end' },
  statusLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statusValue: { fontSize: FontSize.base, fontWeight: '600', marginTop: 2, textAlign: 'right' },

  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  dangerCard: { borderColor: Colors.danger + '40' },
  cardDesc: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'right', lineHeight: 22 },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  actionBtnText: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: '700' },

  summary: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '18',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  warningText: { flex: 1, fontSize: FontSize.sm, color: Colors.warning, textAlign: 'right', lineHeight: 20 },

  footnote: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
