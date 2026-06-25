// src/services/pdfService.ts
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { InspectionItem, SavedInspection } from '../types';
import { formatDateLong } from '../utils/dateUtils';
import { generateFileName } from '../utils/fileUtils';
import { getStatusText } from '../utils/statusUtils';

function groupItemsByAxis(items: InspectionItem[]): Record<string, InspectionItem[]> {
  return items.reduce<Record<string, InspectionItem[]>>((acc, item) => {
    const axis = item.axis || 'أخرى';
    if (!acc[axis]) acc[axis] = [];
    acc[axis].push(item);
    return acc;
  }, {});
}

function buildReportHTML(inspection: SavedInspection): string {
  const groups = groupItemsByAxis(inspection.items);

  const groupsHTML = Object.entries(groups)
    .map(([axis, items]) => {
      const rows = items
        .map(
          item => `
          <tr>
            <td>${item.criteria}</td>
            <td>${item.legalReference || '-'}</td>
            <td style="text-align:center;">${getStatusText(item.complianceStatus)}</td>
            <td>${item.comment || ''}</td>
          </tr>`
        )
        .join('');
      return `
        <tr style="background-color:#ecf0f1;">
          <th colspan="4" style="text-align:right;padding:8px;">${axis}</th>
        </tr>
        ${rows}`;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
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
        <p><strong>تاريخ التفتيش:</strong> ${formatDateLong(inspection.date)}</p>
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
        <tbody>${groupsHTML}</tbody>
      </table>
    </body>
    </html>`;
}

export async function exportInspectionPDF(inspection: SavedInspection): Promise<void> {
  try {
    const { uri } = await Print.printToFileAsync({ html: buildReportHTML(inspection) });
    const dest = (FileSystem.cacheDirectory ?? '') + generateFileName(inspection.facilityName, 'pdf');
    await FileSystem.copyAsync({ from: uri, to: dest });
    await Sharing.shareAsync(dest, { mimeType: 'application/pdf', dialogTitle: 'مشاركة تقرير PDF' });
  } catch (error) {
    console.error('exportInspectionPDF error:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء تصدير PDF');
  }
}

export async function exportInspectionCSV(inspection: SavedInspection): Promise<void> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) {
    Alert.alert('خطأ', 'لا يمكن الوصول إلى مسار التخزين المؤقت');
    return;
  }
  try {
    const headers = ['المعيار', 'المرجع القانوني', 'النتيجة', 'ملاحظات'];
    const rows = inspection.items.map(item => [
      item.criteria,
      item.legalReference || '-',
      getStatusText(item.complianceStatus),
      item.comment || '',
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(f => `"${String(f).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const fileUri = dir + generateFileName(inspection.facilityName, 'csv');
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'مشاركة تقرير Excel' });
  } catch (error) {
    console.error('exportInspectionCSV error:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء تصدير Excel');
  }
}