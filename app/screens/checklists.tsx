import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { criteriaByActivity } from '../../src/criteriaData';
import { generateFileName } from '../../src/utils/fileUtils';

const fs = FileSystem as any;
const BLUE = '#1986df';

export default function ChecklistsScreen() {
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activities = Object.keys(criteriaByActivity).filter(key => key !== 'default');
  const filteredActivities = activities.filter(activity =>
    activity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // الحصول على مسار قابل للكتابة (cacheDirectory فقط)
  const getWritableDir = (): string | null => {
    return fs.cacheDirectory || null;
  };

  // إنشاء ملف PDF
  const generatePDF = async () => {
    if (!selectedActivity) {
      Alert.alert('تنبيه', 'الرجاء اختيار نوع المنشأة');
      return null;
    }
    const criteria = criteriaByActivity[selectedActivity] || [];
    
    const groups: { [key: string]: any[] } = {};
    criteria.forEach((item: any) => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });

    const today = new Date().toLocaleDateString('ar-DZ');
    let groupsHTML = '';
    Object.entries(groups).forEach(([axis, items]) => {
      const itemsHTML = items
        .map(
          item => `
        <tr>
          <td>${item.criteria}</td>
          <td>${item.legalReference}</td>
          <td style="text-align:center;">□</td>
          <td style="text-align:center;">□</td>
          <td style="text-align:center;">□</td>
          <td style="text-align:center;">__________</td>
        </tr>
      `
        )
        .join('');
      groupsHTML += `
        <tr style="background-color: #ecf0f1;"><th colspan="6" style="text-align:right; padding:8px;">${axis}</th></tr>
        ${itemsHTML}
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; margin: 20px; }
          h1 { text-align: center; color: #2c3e50; }
          .header-info { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #bdc3c7; color: #2c3e50; padding: 8px; border: 1px solid #7f8c8d; }
          td { border: 1px solid #bdc3c7; padding: 6px; vertical-align: top; }
        </style>
      </head>
      <body>
        <h1>قائمة تفتيش - ${selectedActivity}</h1>
        <div class="header-info">
          <p>تاريخ الطباعة: ${today}</p>
          <p>اسم المفتش: ___________________</p>
          <p>اسم المنشأة: ___________________</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>المعيار</th>
              <th>المرجع القانوني</th>
              <th>مطابق</th>
              <th>غير مطابق</th>
              <th>غير معني</th>
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

  // إنشاء ملف CSV (Excel)
  const generateCSV = async (): Promise<{ uri: string; content: string } | null> => {
    if (!selectedActivity) {
      Alert.alert('تنبيه', 'الرجاء اختيار نوع المنشأة');
      return null;
    }
    const criteria = criteriaByActivity[selectedActivity] || [];
    
    const groups: { [key: string]: any[] } = {};
    criteria.forEach((item: any) => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });

    const headers = ['المعيار', 'المرجع القانوني', 'مطابق', 'غير مطابق', 'غير معني', 'ملاحظات'];
    let csvContent = headers.join(',') + '\n';
    
    Object.entries(groups).forEach(([axis, items]) => {
      csvContent += `# ${axis}\n`;
      items.forEach(item => {
        const row = [
          item.criteria,
          item.legalReference,
          '', '', '', ''
        ];
        const escapedRow = row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
        csvContent += escapedRow + '\n';
      });
    });

    const writableDir = getWritableDir();
    if (!writableDir) {
      Alert.alert('خطأ', 'لا يمكن الوصول إلى مسار التخزين المؤقت. يرجى استخدام خيار "عرض" بدلاً من التصدير.');
      return null;
    }

    try {
      const fileName = generateFileName(selectedActivity, 'csv');
      const fileUri = writableDir + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: fs.EncodingType.UTF8 });
      return { uri: fileUri, content: csvContent };
    } catch (error) {
      console.error('Error saving CSV:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء ملف Excel');
      return null;
    }
  };

  // معاينة القائمة
  const handlePreview = () => {
    if (!selectedActivity) {
      Alert.alert('تنبيه', 'الرجاء اختيار نوع المنشأة');
      return;
    }
    const criteria = criteriaByActivity[selectedActivity] || [];
    router.push({
      pathname: '/preview',
      params: {
        items: JSON.stringify(criteria),
        title: selectedActivity,
      },
    });
  };

  // معالج PDF
  const handlePDF = async () => {
    const uri = await generatePDF();
    if (!uri) return;

    const writableDir = getWritableDir();
    if (!writableDir) {
      Alert.alert(
        'تصدير PDF',
        'اختر الإجراء',
        [
          { text: 'مشاركة', onPress: () => Sharing.shareAsync(uri, { mimeType: 'application/pdf' }) },
          { text: 'عرض', onPress: handlePreview },
          { text: 'إلغاء', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      const fileName = generateFileName(selectedActivity || 'checklist', 'pdf');
      const newUri = writableDir + fileName;
      await FileSystem.copyAsync({ from: uri, to: newUri });

      Alert.alert(
        'تصدير PDF',
        'اختر الإجراء',
        [
          { text: 'مشاركة', onPress: () => Sharing.shareAsync(newUri, { mimeType: 'application/pdf' }) },
          { text: 'حفظ في الجهاز', onPress: () => Sharing.shareAsync(newUri, { mimeType: 'application/pdf' }) },
          { text: 'عرض', onPress: handlePreview },
          { text: 'إلغاء', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error copying PDF:', error);
      Alert.alert(
        'تصدير PDF',
        'اختر الإجراء',
        [
          { text: 'مشاركة', onPress: () => Sharing.shareAsync(uri, { mimeType: 'application/pdf' }) },
          { text: 'حفظ في الجهاز', onPress: () => Sharing.shareAsync(uri, { mimeType: 'application/pdf' }) },
          { text: 'عرض', onPress: handlePreview },
          { text: 'إلغاء', style: 'cancel' }
        ]
      );
    }
  };

  // معالج Excel
  const handleExcel = async () => {
    const result = await generateCSV();
    if (!result) return;

    Alert.alert(
      'تصدير Excel',
      'اختر الإجراء',
      [
        { text: 'مشاركة', onPress: () => Sharing.shareAsync(result.uri, { mimeType: 'text/csv' }) },
        { text: 'حفظ في الجهاز', onPress: () => Sharing.shareAsync(result.uri, { mimeType: 'text/csv' }) },
        { text: 'عرض', onPress: handlePreview },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  const selectActivity = (activity: string) => {
    setSelectedActivity(activity);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.label}>اختر نوع المنشأة:</Text>

        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
          <Text style={selectedActivity ? styles.pickerButtonText : styles.placeholderText}>
            {selectedActivity || 'انقر لاختيار نوع المنشأة...'}
          </Text>
          <FontAwesome name="chevron-down" size={16} color="#7f8c8d" />
        </TouchableOpacity>

        {selectedActivity && (
          <TouchableOpacity style={[styles.previewButton, { backgroundColor: BLUE }]} onPress={handlePreview}>
            <FontAwesome name="eye" size={20} color="#fff" />
            <Text style={styles.previewButtonText}>معاينة القائمة</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.pdfButton]} onPress={handlePDF}>
            <FontAwesome name="file-pdf-o" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.excelButton]} onPress={handleExcel}>
            <FontAwesome name="file-excel-o" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Excel</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          يمكنك معاينة القائمة أولاً، ثم تصديرها بصيغة PDF أو Excel، ومشاركتها أو حفظها.
        </Text>
      </View>

      {/* مودال اختيار النشاط */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر نوع المنشأة</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <FontAwesome name="search" size={16} color="#7f8c8d" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="بحث..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#95a5a6"
              />
            </View>

            <FlatList
              data={filteredActivities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => selectActivity(item)}>
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>لا توجد نتائج</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#34495e', marginBottom: 8 },
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerButtonText: { fontSize: 14, color: '#2c3e50' },
  placeholderText: { fontSize: 14, color: '#95a5a6' },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  previewButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  pdfButton: { backgroundColor: '#e74c3c' },
  excelButton: { backgroundColor: '#27ae60' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  note: { fontSize: 12, color: '#7f8c8d', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  modalSearchIcon: { marginRight: 6 },
  modalSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#2c3e50',
  },
  modalList: { paddingBottom: 16 },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalItemText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalEmpty: {
    alignItems: 'center',
    padding: 20,
  },
  modalEmptyText: {
    color: '#95a5a6',
    fontSize: 14,
  },
});