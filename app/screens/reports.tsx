import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InspectionItem, SavedInspection } from '../../src/types';
import { formatDateForCard } from '../../src/utils/dateUtils';
import { generateFileName } from '../../src/utils/fileUtils';
import { getComplianceSummary, getStatusText } from '../../src/utils/statusUtils';

const fs = FileSystem as any;
const BLUE = '#1986df';

export default function ReportsScreen() {
  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'non-compliant'>('all');
  const router = useRouter();

  const loadInspections = async () => {
    try {
      const data = await AsyncStorage.getItem('inspections');
      if (data) {
        const all: SavedInspection[] = JSON.parse(data);
        const completed = all.filter(ins => ins.status === 'completed');
        setInspections(completed);
      } else {
        setInspections([]);
      }
    } catch (error) {
      console.error('Failed to load inspections', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInspections();
    }, [])
  );

  const deleteInspection = async (id: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا التفتيش؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const data = await AsyncStorage.getItem('inspections');
              if (data) {
                const inspections: SavedInspection[] = JSON.parse(data);
                const updated = inspections.filter(ins => ins.id !== id);
                await AsyncStorage.setItem('inspections', JSON.stringify(updated));
                loadInspections();
              }
            } catch (error) {
              console.error('Error deleting inspection', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
            }
          },
        },
      ]
    );
  };

  // دوال المساعدة للمسارات
  const getWritableDir = (): string | null => fs.cacheDirectory || null;

  // معاينة التقرير
  const handlePreview = (inspection: SavedInspection) => {
    router.push({
      pathname: '/preview',
      params: {
        items: JSON.stringify(inspection.items),
        title: inspection.facilityName,
      },
    });
  };

  // توليد PDF (مع تجميع حسب المحاور)
  const generatePDF = async (inspection: SavedInspection): Promise<string | null> => {
    const groups: { [key: string]: InspectionItem[] } = {};
    inspection.items.forEach(item => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });

    let groupsHTML = '';
    Object.entries(groups).forEach(([axis, items]) => {
      const itemsHTML = items
        .map(
          item => `
        <tr>
          <td>${item.criteria}</td>
          <td>${item.legalReference || '-'}</td>
          <td style="text-align:center;">${getStatusText(item.complianceStatus)}</td>
          <td>${item.comment || ''}</td>
        </tr>
      `
        )
        .join('');
      groupsHTML += `
        <tr style="background-color: #ecf0f1;"><th colspan="4" style="text-align:right; padding:8px;">${axis}</th></tr>
        ${itemsHTML}
      `;
    });

    const formatDate = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const html = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; margin: 20px; }
          h1 { text-align: center; color: #2c3e50; }
          .header-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #bdc3c7; color: #2c3e50; padding: 8px; border: 1px solid #7f8c8d; }
          td { border: 1px solid #bdc3c7; padding: 6px; vertical-align: top; }
        </style>
      </head>
      <body>
        <h1>تقرير تفتيش</h1>
        <div class="header-info">
          <p><strong>المنشأة:</strong> ${inspection.facilityName}</p>
          <p><strong>العنوان:</strong> ${inspection.facilityAddress || 'غير محدد'}</p>
          <p><strong>تاريخ التفتيش:</strong> ${formatDate(inspection.date)}</p>
          <p><strong>المفتش:</strong> ${inspection.inspectorName}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>المعيار</th>
              <th>المرجع القانوني</th>
              <th>النتيجة</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${groupsHTML}
          </tbody>
        </table>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء ملف PDF');
      return null;
    }
  };

  // تصدير PDF
  const exportPDF = async (inspection: SavedInspection) => {
    const uri = await generatePDF(inspection);
    if (!uri) return;

    const writableDir = getWritableDir();
    if (!writableDir) {
      // مشاركة مباشرة من الملف الأصلي
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'مشاركة تقرير PDF'
      });
      return;
    }

    try {
      const fileName = generateFileName(inspection.facilityName, 'pdf');
      const newUri = writableDir + fileName;
      await FileSystem.copyAsync({ from: uri, to: newUri });

      // التأكد من وجود الملف
      const fileInfo = await FileSystem.getInfoAsync(newUri);
      if (!fileInfo.exists) {
        Alert.alert('خطأ', 'فشل نسخ الملف');
        return;
      }

      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'مشاركة تقرير PDF'
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // محاولة المشاركة من الملف الأصلي
      try {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'مشاركة تقرير PDF'
        });
      } catch (fallbackError) {
        Alert.alert('خطأ', 'حدث خطأ أثناء تصدير PDF');
      }
    }
  };

  // تصدير Excel
  const exportExcel = async (inspection: SavedInspection) => {
    // تجميع البيانات وإنشاء csvContent
    const headers = ['المعيار', 'المرجع القانوني', 'النتيجة', 'ملاحظات'];
    const rows = inspection.items.map(item => [
      item.criteria,
      item.legalReference || '-',
      getStatusText(item.complianceStatus),
      item.comment || ''
    ]);
    const csvContent =
      [headers, ...rows]
        .map(row =>
          row
            .map(field =>
              `"${String(field).replace(/"/g, '""')}"`
            )
            .join(',')
        )
        .join('\n');

    const writableDir = getWritableDir();
    if (!writableDir) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى مسار التخزين المؤقت لإنشاء ملف Excel');
      return;
    }

    try {
      const fileName = generateFileName(inspection.facilityName, 'csv');
      const fileUri = writableDir + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: fs.EncodingType.UTF8 });

      // التأكد من وجود الملف قبل المشاركة
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert('خطأ', 'فشل إنشاء الملف');
        return;
      }

      // محاولة المشاركة مع MIME types متعددة
      try {
        // أولاً: المحاولة باستخدام text/csv (الأكثر شيوعاً)
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'مشاركة تقرير Excel'
        });
      } catch (error) {
        console.log('Sharing with text/csv failed, trying application/vnd.ms-excel', error);
        // ثانياً: المحاولة باستخدام application/vnd.ms-excel
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.ms-excel',
          dialogTitle: 'مشاركة تقرير Excel'
        });
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تصدير Excel');
    }
  };

  // تطبيق الفلترة والبحث
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch = inspection.facilityName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;
      const summary = getComplianceSummary(inspection.items);
      if (filterStatus === 'compliant') return summary.nonCompliant === 0;
      if (filterStatus === 'non-compliant') return summary.nonCompliant > 0;
      return true;
    });
  }, [inspections, searchQuery, filterStatus]);

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteInspection(id)}
    >
      <FontAwesome name="trash" size={24} color="#fff" />
      <Text style={styles.deleteText}>حذف</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: SavedInspection }) => {
    const summary = getComplianceSummary(item.items);
    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/reports/${item.id}`)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.facilityName}>{item.facilityName}</Text>
            <Text style={styles.date}>{formatDateForCard(item.date)}</Text>
          </View>
          <Text style={styles.address}>{item.facilityAddress || 'بدون عنوان'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{summary.total}</Text>
              <Text style={styles.statLabel}>إجمالي</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#27ae60' }]}>{summary.compliant}</Text>
              <Text style={styles.statLabel}>مطابق</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#e74c3c' }]}>{summary.nonCompliant}</Text>
              <Text style={styles.statLabel}>غير مطابق</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#f39c12' }]}>{summary.notEvaluated}</Text>
              <Text style={styles.statLabel}>لم يقيم</Text>
            </View>
          </View>

          {/* أزرار التصدير والعرض */}
          <View style={styles.exportRow}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handlePreview(item)}
            >
              <FontAwesome name="eye" size={18} color={BLUE} />
              <Text style={styles.exportButtonText}>عرض</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => exportPDF(item)}
            >
              <FontAwesome name="file-pdf-o" size={18} color="#e74c3c" />
              <Text style={styles.exportButtonText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => exportExcel(item)}
            >
              <FontAwesome name="file-excel-o" size={18} color="#27ae60" />
              <Text style={styles.exportButtonText}>Excel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        {/* شريط البحث */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث باسم المنشأة..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#95a5a6"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times-circle" size={18} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>

        {/* أزرار التصفية */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>الكل</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'compliant' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('compliant')}
          >
            <Text style={[styles.filterText, filterStatus === 'compliant' && styles.filterTextActive]}>مطابق</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'non-compliant' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('non-compliant')}
          >
            <Text style={[styles.filterText, filterStatus === 'non-compliant' && styles.filterTextActive]}>غير مطابق</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredInspections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome name="file-text" size={50} color="#bdc3c7" />
              <Text style={styles.emptyText}>
                {searchQuery || filterStatus !== 'all'
                  ? 'لا توجد تفتيشات تطابق البحث'
                  : 'لا توجد تفتيشات محفوظة'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // تم التغيير من '#f5f5f5' إلى 'transparent' لتتناسب مع الخلفية العامة
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    textAlign: 'right',
    color: '#2c3e50',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: BLUE, // تم التغيير من '#3E729B' إلى BLUE
  },
  filterText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  address: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
  },
  statLabel: {
    fontSize: 11,
    color: '#95a5a6',
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  exportButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2c3e50',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '90%',
    marginVertical: 5,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});