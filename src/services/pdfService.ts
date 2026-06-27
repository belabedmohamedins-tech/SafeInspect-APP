// src/services/pdfService.ts
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { InspectionItem, SavedInspection } from '../types';
import { formatDateLong } from '../utils/dateUtils';
import { generateFileName } from '../utils/fileUtils';
import { groupByAxisRaw } from '../utils/inspectionUtils';
import { computeScoreAndGrade } from '../utils/scoringUtils';
import { getStatusText } from '../utils/statusUtils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a CSS background color matching the compliance status. */
function statusBg(status: InspectionItem['complianceStatus']): string {
  switch (status) {
    case 'compliant':     return '#d4edda';
    case 'non-compliant': return '#f8d7da';
    case 'na':            return '#e2e3e5';
    default:              return '#fff3cd';
  }
}

/** Returns a CSS text color for the compliance status cell. */
function statusColor(status: InspectionItem['complianceStatus']): string {
  switch (status) {
    case 'compliant':     return '#155724';
    case 'non-compliant': return '#721c24';
    case 'na':            return '#383d41';
    default:              return '#856404';
  }
}

/** Returns a CSS color for the grade badge. */
function gradeBadgeColor(grade?: string): string {
  switch (grade) {
    case 'A': return '#27ae60';
    case 'B': return '#2980b9';
    case 'C': return '#f39c12';
    case 'D': return '#e74c3c';
    default:  return '#7f8c8d';
  }
}

function indicatorLabel(key: string): string {
  const labels: Record<string, string> = {
    doc:    'الهوية التنظيمية',
    clean:  'النظافة والتهيئة',
    waste:  'البيئة والنفايات',
    health: 'الصحة والسلامة',
  };
  return labels[key] ?? key;
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

function buildReportHTML(
  inspection: SavedInspection,
  fallbackInspector: string,
): string {
  const groups     = groupByAxisRaw(inspection.items);
  const inspector  = inspection.inspectorName?.trim() || fallbackInspector || 'غير محدد';
  const office     = inspection.officeName?.trim() || '';

  const scoring    = computeScoreAndGrade(inspection.items);
  const score      = inspection.score ?? scoring.score;
  const grade      = inspection.grade ?? scoring.grade;
  const indicators = scoring.indicators;

  const committeeHTML = (inspection.committeeMembers ?? []).length > 0
    ? `<p><strong>أعضاء اللجنة:</strong>
         ${inspection.committeeMembers!.map(m => `<span class="member">${m}</span>`).join('')}
       </p>`
    : '';

  const coordsHTML = inspection.coordinates
    ? `<p><strong>الموقع الجغرافي:</strong>
         ${inspection.coordinates.latitude.toFixed(6)}° ش،
         ${inspection.coordinates.longitude.toFixed(6)}° ط
       </p>`
    : '';

  const scoreHTML = score !== undefined
    ? `<div class="score-row">
         <div class="score-label">النتيجة الإجمالية</div>
         <div class="score-value">${score}%</div>
         <div class="grade-badge" style="background:${gradeBadgeColor(grade)}">${grade ?? '-'}</div>
       </div>`
    : '';

  const indicatorRows = Object.entries(indicators)
    .map(([key, val]) => {
      const pct   = val !== null ? `${val.toFixed(1)}%` : 'N/A';
      const barW  = val !== null ? `${Math.round(val)}%` : '0%';
      const color = val === null ? '#bdc3c7'
                  : val >= 85   ? '#27ae60'
                  : val >= 70   ? '#2980b9'
                  : val >= 50   ? '#f39c12'
                  :               '#e74c3c';
      return `
        <tr>
          <td class="ind-label">${indicatorLabel(key)}</td>
          <td class="ind-bar-cell">
            <div class="ind-bar-bg">
              <div class="ind-bar-fill" style="width:${barW};background:${color};"></div>
            </div>
          </td>
          <td class="ind-pct" style="color:${color}">${pct}</td>
        </tr>`;
    })
    .join('');

  const indicatorsTableHTML = `
    <div class="section-title">مؤشرات الأداء</div>
    <table class="ind-table">
      <tbody>${indicatorRows}</tbody>
    </table>`;

  let rowIndex = 0;
  const groupsHTML = groups
    .map(([axis, items]) => {
      const rows = items
        .map(item => {
          const bg    = statusBg(item.complianceStatus);
          const color = statusColor(item.complianceStatus);
          const even  = rowIndex++ % 2 === 0;
          const rowBg = even ? '#ffffff' : '#f9fafb';
          return `
            <tr style="background:${rowBg}">
              <td>${item.criteria}</td>
              <td class="ref-col">${item.legalReference || '-'}</td>
              <td class="status-cell" style="background:${bg};color:${color}">
                ${getStatusText(item.complianceStatus)}
              </td>
              <td>${item.comment || ''}</td>
            </tr>`;
        })
        .join('');
      return `
        <tr class="axis-header-row">
          <th colspan="4">${axis}</th>
        </tr>
        ${rows}`;
    })
    .join('');

  const signatureHTML = inspection.signature
    ? `<div class="sig-section">
         <p class="sig-label">توقيع المفتش</p>
         <img class="sig-img" src="${inspection.signature}" alt="توقيع" />
       </div>`
    : '';

  const causeMap: Record<string, string> = {
    routine:        'تفتيش روتيني',
    complaint:      'بعد شكوى',
    followup:       'متابعة بعد إنذار',
    extraordinary:  'تفتيش استثنائي',
  };
  const causeLabel = causeMap[inspection.inspectionCause ?? ''] ?? inspection.inspectionCause ?? 'غير محدد';

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', Arial, sans-serif; font-size: 13px; color: #2c3e50; background: #fff; padding: 24px 32px; direction: rtl; }
    .letterhead { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #1a6b5a; padding-bottom: 14px; margin-bottom: 18px; }
    .letterhead-title { font-size: 22px; font-weight: 900; color: #1a6b5a; letter-spacing: 0.5px; }
    .letterhead-subtitle { font-size: 13px; color: #7f8c8d; margin-top: 3px; }
    .report-badge { background: #1a6b5a; color: #fff; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; background: #f4f7f6; border: 1px solid #dce8e5; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; }
    .meta-grid p { font-size: 13px; line-height: 1.7; }
    .meta-grid strong { color: #1a6b5a; }
    .member { display: inline-block; background: #e8f4f1; color: #1a6b5a; border-radius: 12px; padding: 1px 10px; margin: 2px 3px; font-size: 12px; }
    .score-row { display: flex; align-items: center; gap: 14px; background: #1a6b5a; color: #fff; border-radius: 8px; padding: 12px 20px; margin-bottom: 16px; }
    .score-label { font-size: 14px; flex: 1; }
    .score-value { font-size: 28px; font-weight: 900; }
    .grade-badge { font-size: 22px; font-weight: 900; color: #fff; width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.5); }
    .section-title { font-size: 15px; font-weight: 700; color: #1a6b5a; border-right: 4px solid #1a6b5a; padding-right: 10px; margin-bottom: 10px; margin-top: 6px; }
    .ind-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .ind-label { font-size: 13px; width: 38%; padding: 5px 4px; }
    .ind-bar-cell { padding: 5px 8px; }
    .ind-bar-bg { background: #ecf0f1; border-radius: 6px; height: 12px; overflow: hidden; }
    .ind-bar-fill { height: 100%; border-radius: 6px; }
    .ind-pct { font-size: 13px; font-weight: 700; width: 14%; text-align: center; }
    .checklist-title { font-size: 15px; font-weight: 700; color: #1a6b5a; border-right: 4px solid #1a6b5a; padding-right: 10px; margin-bottom: 10px; }
    table.main-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    table.main-table th, table.main-table td { border: 1px solid #d5e0dd; padding: 6px 8px; vertical-align: top; text-align: right; }
    table.main-table thead tr th { background: #1a6b5a; color: #fff; font-size: 13px; font-weight: 700; }
    tr.axis-header-row th { background: #d4ebe5; color: #1a6b5a; font-size: 13px; font-weight: 700; text-align: right; padding: 7px 10px; }
    .ref-col { font-size: 11px; color: #7f8c8d; min-width: 90px; }
    .status-cell { text-align: center; font-weight: 700; font-size: 12px; white-space: nowrap; }
    .sig-section { margin-top: 24px; border-top: 1px solid #d5e0dd; padding-top: 14px; text-align: center; }
    .sig-label { font-size: 13px; font-weight: 600; color: #1a6b5a; margin-bottom: 8px; }
    .sig-img { max-width: 240px; max-height: 110px; border: 1px solid #bdc3c7; border-radius: 6px; background: #f9fafb; }
    .footer { margin-top: 20px; border-top: 1px solid #d5e0dd; padding-top: 10px; font-size: 11px; color: #95a5a6; text-align: center; }
  </style>
</head>
<body>
  <div class="letterhead">
    <div>
      <div class="letterhead-title">${office || 'تقرير تفتيش'}</div>
      <div class="letterhead-subtitle">SafeInspect — نظام التفتيش الميداني</div>
    </div>
    <div class="report-badge">تقرير رسمي</div>
  </div>
  <div class="meta-grid">
    <p><strong>المنشأة:</strong> ${inspection.facilityName}</p>
    <p><strong>العنوان:</strong> ${inspection.facilityAddress || 'غير محدد'}</p>
    <p><strong>تاريخ التفتيش:</strong> ${formatDateLong(inspection.date)}</p>
    <p><strong>المحرر / المفتش:</strong> ${inspector}</p>
    <p><strong>سبب التفتيش:</strong> ${causeLabel}</p>
    ${inspection.referenceDocument
      ? `<p><strong>مرجع المستند:</strong> ${inspection.referenceDocument}</p>`
      : '<p></p>'}
    ${committeeHTML}
    ${coordsHTML}
  </div>
  ${scoreHTML}
  ${score !== undefined ? indicatorsTableHTML : ''}
  <div class="checklist-title">بنود التفتيش</div>
  <table class="main-table">
    <thead>
      <tr>
        <th>المعيار</th>
        <th class="ref-col">المرجع القانوني</th>
        <th style="width:100px">النتيجة</th>
        <th>ملاحظات</th>
      </tr>
    </thead>
    <tbody>${groupsHTML}</tbody>
  </table>
  ${signatureHTML}
  <div class="footer">
    تم إنشاء هذا التقرير تلقائياً بواسطة تطبيق SafeInspect
    — ${new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</body>
</html>`;
}

// ─── PDF export ───────────────────────────────────────────────────────────────

export async function exportInspectionPDF(inspection: SavedInspection): Promise<void> {
  const settingsInspector = await SettingsRepository.get<string>('inspectorName', '') ?? '';
  const html = buildReportHTML(inspection, settingsInspector);

  try {
    if (Platform.OS === 'ios') {
      const { uri } = await Print.printToFileAsync({ html });
      const dest =
        (FileSystem.documentDirectory ?? '') +
        generateFileName(inspection.facilityName, 'pdf');
      await FileSystem.copyAsync({ from: uri, to: dest });
      await FileSystem.deleteAsync(uri, { idempotent: true });
      await Sharing.shareAsync(dest, {
        mimeType: 'application/pdf',
        dialogTitle: 'مشاركة تقرير PDF',
        UTI: 'com.adobe.pdf',
      });
    } else {
      await Print.printAsync({ html });
    }
  } catch (error) {
    console.error('exportInspectionPDF error:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء تصدير PDF');
  }
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export async function exportInspectionCSV(inspection: SavedInspection): Promise<void> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) {
    Alert.alert('خطأ', 'لا يمكن الوصول إلى مسار التخزين المؤقت');
    return;
  }
  try {
    const headers = ['المحور', 'الفئة', 'المعيار', 'المرجع القانوني', 'النتيجة', 'ملاحظات'];
    const rows = inspection.items.map(item => [
      item.axis || '',
      item.category || '',
      item.criteria,
      item.legalReference || '-',
      getStatusText(item.complianceStatus),
      item.comment || '',
    ]);

    // \uFEFF = UTF-8 BOM — required for Excel to recognise Arabic (UTF-8) text.
    // Without it Excel defaults to Windows-1252 and Arabic shows as mojibake.
    const BOM = '\uFEFF';
    const csv = BOM + [headers, ...rows]
      .map(row => row.map(f => `"${String(f).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const fileUri = dir + generateFileName(inspection.facilityName, 'csv');
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'مشاركة تقرير Excel',
    });
  } catch (error) {
    console.error('exportInspectionCSV error:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء تصدير Excel');
  }
}
