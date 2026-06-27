// src/services/CapReportService.ts
//
// Generates and shares a PDF report of all open/overdue Corrective Action
// Plan (CAP) items. Uses the same expo-print + expo-sharing pipeline as
// pdfService.ts so no new dependencies are needed.
//
// Usage:
//   await CapReportService.export();          // export ALL open items
//   await CapReportService.export('overdue'); // export overdue items only

import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { CorrectiveAction } from '../types';

type ExportFilter = 'open' | 'overdue' | 'all';

// ─── Helpers ──────────────────────────────────────────────────────────────

const STATUS_AR: Record<CorrectiveAction['status'], string> = {
  open:          'مفتوح',
  'in-progress': 'جارٍ',
  resolved:      'مغلق',
  overdue:       'متأخر',
};

const SEVERITY_AR: Record<CorrectiveAction['severity'], string> = {
  low:      'منخفض',
  medium:   'متوسط',
  high:     'عالٍ',
  critical: 'حرج',
};

const STATUS_COLOR: Record<CorrectiveAction['status'], string> = {
  open:          '#f39c12',
  'in-progress': '#2980b9',
  resolved:      '#27ae60',
  overdue:       '#e74c3c',
};

const SEVERITY_COLOR: Record<CorrectiveAction['severity'], string> = {
  low:      '#27ae60',
  medium:   '#f39c12',
  high:     '#e74c3c',
  critical: '#8e44ad',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ar-DZ', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ─── HTML builder ─────────────────────────────────────────────────────────

function buildCapHTML(
  items: CorrectiveAction[],
  officeName: string,
  inspectorName: string,
): string {
  const now       = new Date();
  const dateLabel = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });

  const openCount     = items.filter(i => i.status === 'open').length;
  const inProgCount   = items.filter(i => i.status === 'in-progress').length;
  const overdueCount  = items.filter(i => i.status === 'overdue').length;
  const resolvedCount = items.filter(i => i.status === 'resolved').length;
  const total         = items.length;
  const resolutionPct = total > 0 ? ((resolvedCount / total) * 100).toFixed(0) : '0';

  // Summary pills
  const summaryHTML = `
    <div class="summary-row">
      <div class="pill" style="background:#fff3cd;color:#856404">مفتوح: <strong>${openCount}</strong></div>
      <div class="pill" style="background:#cce5ff;color:#004085">جارٍ: <strong>${inProgCount}</strong></div>
      <div class="pill" style="background:#f8d7da;color:#721c24">متأخر: <strong>${overdueCount}</strong></div>
      <div class="pill" style="background:#d4edda;color:#155724">مغلق: <strong>${resolvedCount}</strong></div>
    </div>
    <div class="progress-wrap">
      <div class="progress-bar" style="width:${resolutionPct}%"></div>
    </div>
    <p class="progress-label">${resolutionPct}% تم إغلاقه</p>`;

  // Table rows
  const rowsHTML = items
    .map((item, idx) => {
      const rowBg    = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      const statusC  = STATUS_COLOR[item.status];
      const severityC = SEVERITY_COLOR[item.severity];
      return `
      <tr style="background:${rowBg}">
        <td class="num">${idx + 1}</td>
        <td class="facility">${item.facilityName}</td>
        <td class="criteria">${item.criteria}</td>
        <td><span class="badge" style="background:${severityC}15;color:${severityC};border:1px solid ${severityC}40">${SEVERITY_AR[item.severity]}</span></td>
        <td><span class="badge" style="background:${statusC}15;color:${statusC};border:1px solid ${statusC}40">${STATUS_AR[item.status]}</span></td>
        <td class="deadline ${item.status === 'overdue' ? 'overdue-text' : ''}">${formatDate(item.deadline)}</td>
        <td class="assigned">${item.assignedTo || '—'}</td>
        <td class="notes">${item.notes || ''}</td>
      </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', Arial, sans-serif;
      font-size: 12px;
      color: #2c3e50;
      background: #fff;
      padding: 24px 28px;
      direction: rtl;
    }

    /* ── Letterhead ── */
    .letterhead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #c0392b;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .lh-title  { font-size: 20px; font-weight: 900; color: #c0392b; }
    .lh-sub    { font-size: 12px; color: #7f8c8d; margin-top: 2px; }
    .report-badge {
      background: #c0392b; color: #fff;
      font-size: 12px; font-weight: 700;
      padding: 5px 14px; border-radius: 20px;
    }

    /* ── Meta ── */
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 20px;
      background: #fdf3f2;
      border: 1px solid #f5c6c3;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 14px;
      font-size: 12px;
    }
    .meta strong { color: #c0392b; }

    /* ── Summary pills ── */
    .summary-row {
      display: flex; gap: 8px; flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .pill {
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 12px;
    }
    .progress-wrap {
      background: #ecf0f1; border-radius: 6px;
      height: 10px; overflow: hidden;
      margin-bottom: 4px;
    }
    .progress-bar {
      height: 100%; background: #27ae60; border-radius: 6px;
    }
    .progress-label {
      font-size: 11px; color: #7f8c8d; text-align: center;
      margin-bottom: 14px;
    }

    /* ── Section title ── */
    .section-title {
      font-size: 14px; font-weight: 700; color: #c0392b;
      border-right: 4px solid #c0392b;
      padding-right: 10px;
      margin-bottom: 8px; margin-top: 4px;
    }

    /* ── Main table ── */
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    thead tr th {
      background: #c0392b; color: #fff;
      padding: 7px 6px; text-align: right;
      font-size: 12px; font-weight: 700;
    }
    td { border: 1px solid #e8d0ce; padding: 6px; vertical-align: top; text-align: right; }
    .num      { text-align: center; color: #7f8c8d; width: 28px; }
    .facility { font-weight: 600; min-width: 90px; }
    .criteria { min-width: 140px; }
    .deadline { min-width: 80px; white-space: nowrap; }
    .overdue-text { color: #e74c3c; font-weight: 700; }
    .assigned { color: #7f8c8d; font-size: 10px; }
    .notes    { color: #555; font-size: 10px; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 18px;
      border-top: 1px solid #e8d0ce;
      padding-top: 8px;
      font-size: 10px;
      color: #95a5a6;
      text-align: center;
    }
  </style>
</head>
<body>

  <div class="letterhead">
    <div>
      <div class="lh-title">${officeName || 'تقرير الإجراءات التصحيحية'}</div>
      <div class="lh-sub">SafeInspect — خطة الإجراءات التصحيحية</div>
    </div>
    <div class="report-badge">تقرير رسمي</div>
  </div>

  <div class="meta">
    <p><strong>تاريخ التصدير:</strong> ${dateLabel}</p>
    <p><strong>عدد الإجراءات:</strong> ${total}</p>
    ${inspectorName ? `<p><strong>أعده:</strong> ${inspectorName}</p>` : ''}
  </div>

  ${summaryHTML}

  <div class="section-title">تفاصيل الإجراءات</div>
  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        <th>المنشأة</th>
        <th>المعيار / المخالفة</th>
        <th>الخطورة</th>
        <th>الحالة</th>
        <th>الموعد النهائي</th>
        <th>المسؤول</th>
        <th>ملاحظات</th>
      </tr>
    </thead>
    <tbody>${rowsHTML}</tbody>
  </table>

  <div class="footer">
    تم إنشاء هذا التقرير تلقائياً بواسطة تطبيق SafeInspect — ${dateLabel}
  </div>

</body>
</html>`;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export const CapReportService = {
  /**
   * Generate and share a CAP PDF report.
   * @param filter  'open' = open+in-progress+overdue (default)
   *                'overdue' = overdue only
   *                'all'    = every CAP item regardless of status
   */
  async export(filter: ExportFilter = 'open'): Promise<void> {
    try {
      const [settings, all] = await Promise.all([
        SettingsRepository.get(),
        CorrectiveActionRepository.getAll(),
      ]);

      const items =
        filter === 'all'
          ? all
          : filter === 'overdue'
          ? all.filter(i => i.status === 'overdue')
          : all.filter(i => i.status === 'open' || i.status === 'in-progress' || i.status === 'overdue');

      if (items.length === 0) {
        Alert.alert('لا توجد بيانات', 'لا توجد إجراءات تصحيحية لتصديرها.');
        return;
      }

      const html = buildCapHTML(
        items,
        settings.officeName,
        settings.inspectorName,
      );

      if (Platform.OS === 'ios') {
        const { uri } = await Print.printToFileAsync({ html });
        const dest =
          (FileSystem.documentDirectory ?? '') +
          `cap-report-${new Date().toISOString().slice(0, 10)}.pdf`;
        await FileSystem.copyAsync({ from: uri, to: dest });
        await FileSystem.deleteAsync(uri, { idempotent: true });
        await Sharing.shareAsync(dest, {
          mimeType: 'application/pdf',
          dialogTitle: 'مشاركة تقرير CAP',
          UTI: 'com.adobe.pdf',
        });
      } else {
        // Android: system print dialog → “Save as PDF”
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.error('[CapReportService] export error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تصدير PDF');
    }
  },
};
