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
import { InspectionRepository } from '../repositories/InspectionRepository';
import { buildDifferentialViewSync, DifferentialView } from './differentialView';
import { suggestDecision } from './decisionSupport';

// ─── Helpers ─────────────────────────────────────────────────────────────────────────────

/** Returns a CSS background color matching the compliance status. */
function statusBg(status: InspectionItem['complianceStatus']): string {
  switch (status) {
    case 'compliant':          return '#d4edda';
    case 'non-compliant':      return '#f8d7da';
    case 'na':                 return '#e2e3e5';
    case 'observation-only':   return '#d1ecf1';
    case 'unable-to-verify':   return '#fff3cd';
    default:                   return '#fff3cd';
  }
}

/** Returns a CSS text color for the compliance status cell. */
function statusColor(status: InspectionItem['complianceStatus']): string {
  switch (status) {
    case 'compliant':          return '#155724';
    case 'non-compliant':      return '#721c24';
    case 'na':                 return '#383d41';
    case 'observation-only':   return '#0c5460';
    case 'unable-to-verify':   return '#856404';
    default:                   return '#856404';
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

// ─── Phase-3: Differential verification section HTML ─────────────────────────────

/**
 * Builds the HTML block for the "تقرير التحقق من الإجراءات التصحيحية"
 * section inserted into follow-up inspection reports.
 */
function buildDifferentialSectionHTML(diff: DifferentialView): string {
  if (!diff.priorInspection) return '';

  const priorDate = formatDateLong(diff.priorInspection.date);

  const resolvedRows = diff.resolved
    .map(
      e => `
      <tr>
        <td style="background:#d4edda;color:#155724;text-align:center;font-weight:700">
          ✓ تم التصحيح
        </td>
        <td>${e.item.criteria}</td>
        <td style="text-align:center;font-size:11px;color:#7f8c8d">${severityLabel(e.item.severity)}</td>
      </tr>`,
    )
    .join('');

  const failingRows = diff.stillFailing
    .map(
      e => `
      <tr>
        <td style="background:#f8d7da;color:#721c24;text-align:center;font-weight:700">
          ⚠ لا يزال غير مطابق
        </td>
        <td>${e.item.criteria}</td>
        <td style="text-align:center;font-size:11px;color:#7f8c8d">${severityLabel(e.item.severity)}</td>
      </tr>`,
    )
    .join('');

  const newRows = diff.newViolations
    .map(
      e => `
      <tr>
        <td style="background:#fff3cd;color:#856404;text-align:center;font-weight:700">
          🆕 مخالفة جديدة
        </td>
        <td>${e.item.criteria}</td>
        <td style="text-align:center;font-size:11px;color:#7f8c8d">${severityLabel(e.item.severity)}</td>
      </tr>`,
    )
    .join('');

  const escalationHTML = diff.hasUnresolvedPriorViolations
    ? `<div style="margin-top:12px;background:#fff3cd;border-right:4px solid #f39c12;
         border-radius:6px;padding:10px 14px;font-size:12px;color:#856404;font-weight:600">
         💡 يُقترح اتخاذ إجراء تصعيدي بسبب وجود مخالفات لم تُعالج منذ الزيارة السابقة (${priorDate}).
       </div>`
    : '';

  return `
    <div class="section-title" style="margin-top:20px">
      تقرير التحقق من الإجراءات التصحيحية
    </div>
    <p style="font-size:12px;color:#7f8c8d;margin-bottom:10px">
      مقارنة مع الزيارة السابقة: ${priorDate}
    </p>
    <table class="main-table">
      <thead>
        <tr>
          <th style="width:140px">حالة التصحيح</th>
          <th>المعيار</th>
          <th style="width:70px">الخطورة</th>
        </tr>
      </thead>
      <tbody>
        ${resolvedRows}
        ${failingRows}
        ${newRows}
      </tbody>
    </table>
    ${escalationHTML}`;
}

// ─── Phase-6: Decision support section HTML ──────────────────────────────────

function buildDecisionSectionHTML(
  inspection: SavedInspection,
  diffView?: DifferentialView | null,
): string {
  const scoring = computeScoreAndGrade(inspection.items);
  const suggestion = suggestDecision(scoring, diffView);

  const urgencyColors: Record<string, { bg: string; border: string; text: string }> = {
    low:      { bg: '#f0faf4', border: '#a5d6a7', text: '#1b5e20' },
    medium:   { bg: '#fffde7', border: '#ffe082', text: '#e65100' },
    high:     { bg: '#fff3e0', border: '#ffcc80', text: '#e65100' },
    critical: { bg: '#fce4ec', border: '#ef9a9a', text: '#b71c1c' },
  };
  const uc = urgencyColors[suggestion.urgency] ?? urgencyColors.medium;

  const reasonsHTML = suggestion.reasons
    .map(r => `<li style="margin-bottom:3px">${r}</li>`)
    .join('');

  const additionalRefsHTML = suggestion.additionalRefs.length > 0
    ? suggestion.additionalRefs.map(r => `<span style="font-size:11px;color:#78909c"> — ${r}</span>`).join('')
    : '';

  const overrideHTML = inspection.escalationOverrideReason
    ? `<div style="margin-top:10px;background:#fff9c4;border-right:3px solid #f9a825;
           border-radius:6px;padding:8px 12px;font-size:12px;color:#f57f17">
           <strong>سبب التجاوز:</strong> ${inspection.escalationOverrideReason}
         </div>`
    : '';

  return `
    <div class="section-title" style="margin-top:20px">القرار الإداري المقترح</div>
    <div style="background:${uc.bg};border:1.5px solid ${uc.border};border-radius:10px;
                padding:14px 18px;font-size:13px;color:${uc.text}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <strong style="font-size:14px">${suggestion.actionLabel}</strong>
        <span style="background:${uc.border};color:${uc.text};font-size:11px;font-weight:700;
              padding:3px 10px;border-radius:12px">أولوية: ${urgencyLabelAr(suggestion.urgency)}</span>
      </div>
      <p style="margin-bottom:8px">${suggestion.rationale}</p>
      <ul style="padding-right:18px;margin-bottom:8px">${reasonsHTML}</ul>
      <p style="font-size:12px"><strong>الأساس القانوني:</strong> ${suggestion.legalBasis}${additionalRefsHTML}</p>
      <p style="font-size:12px;margin-top:4px">📅 الزيارة القادمة المقترحة: خلال ${suggestion.nextVisitDays} يوم</p>
      ${overrideHTML}
      <p style="font-size:10px;color:#90a4ae;margin-top:10px;font-style:italic">
        هذا الاقتراح أداة مساعدة فقط. القرار القانوني النهائي يعود للمفتش المختص
        وفق أحكام القانون 03-10 والمرسوم التنفيذي 06-198.
      </p>
    </div>`;
}

function urgencyLabelAr(u: string): string {
  switch (u) {
    case 'low':      return 'منخفضة';
    case 'medium':   return 'متوسطة';
    case 'high':     return 'عالية';
    case 'critical': return 'حرجة — تدخل فوري';
    default:         return u;
  }
}

// ─── HTML builder (full inspection report) ────────────────────────────────────────────────────

function buildReportHTML(
  inspection: SavedInspection,
  fallbackInspector: string,
  diffView?: DifferentialView | null,
): string {
  const groups     = groupByAxisRaw(inspection.items);
  const inspector  = inspection.inspectorName?.trim() || fallbackInspector || 'غير محدد';
  const office     = inspection.officeName?.trim() || '';

  const scoring    = computeScoreAndGrade(inspection.items);
  const score      = inspection.score ?? scoring.score;
  const grade      = inspection.grade ?? scoring.grade;

  const { violations } = scoring;
  const nonCompliant = inspection.items.filter(i => i.complianceStatus === 'non-compliant');
  const compliant    = inspection.items.filter(i => i.complianceStatus === 'compliant');

  function severityPct(sev: 'high' | 'medium' | 'low'): number | null {
    const total = inspection.items.filter(
      i => i.severity === sev && i.complianceStatus !== 'na'
    );
    const comp  = total.filter(i => i.complianceStatus === 'compliant');
    return total.length > 0 ? (comp.length / total.length) * 100 : null;
  }

  const indicatorDefs: [string, number | null][] = [
    ['الامتثال العالي الخطورة',    severityPct('high')],
    ['الامتثال المتوسط الخطورة',   severityPct('medium')],
    ['الامتثال المنخفض الخطورة',   severityPct('low')],
  ];

  const indicatorRows = indicatorDefs
    .map(([label, val]) => {
      const pct   = val !== null ? `${val.toFixed(1)}%` : 'N/A';
      const barW  = val !== null ? `${Math.round(val)}%` : '0%';
      const color = val === null ? '#bdc3c7'
                  : val >= 85   ? '#27ae60'
                  : val >= 70   ? '#2980b9'
                  : val >= 50   ? '#f39c12'
                  :               '#e74c3c';
      return `
        <tr>
          <td class="ind-label">${label}</td>
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

  const inspTypeMap: Record<string, string> = {
    routine:   'تفتيش روتيني',
    'follow-up': 'متابعة',
    complaint: 'بعد شكوى',
  };
  const inspTypeLabel = inspTypeMap[inspection.inspectionType ?? 'routine'] ?? 'تفتيش روتيني';
  const inspTypeBadgeColor = inspection.inspectionType === 'follow-up' ? '#2980b9'
    : inspection.inspectionType === 'complaint' ? '#e74c3c'
    : '#1a6b5a';

  // ── Phase-6: decision support section ────────────────────────────────────
  const decisionSectionHTML = buildDecisionSectionHTML(inspection, diffView);

  // ── Phase-3: differential section ────────────────────────────────────────
  const differentialSectionHTML =
    inspection.inspectionType === 'follow-up' && diffView
      ? buildDifferentialSectionHTML(diffView)
      : '';

  // ── Main checklist table — now with optional numericValue column ──────────
  // Determine if ANY item in this inspection has a numericValue so we only
  // add the extra column when there is data to show.
  const hasNumericItems = inspection.items.some(
    i => i.numericValue !== undefined && i.numericValue !== null,
  );

  let rowIndex = 0;
  const groupsHTML = groups
    .map(([axis, items]) => {
      const rows = items
        .map(item => {
          const bg    = statusBg(item.complianceStatus);
          const color = statusColor(item.complianceStatus);
          const even  = rowIndex++ % 2 === 0;
          const rowBg = even ? '#ffffff' : '#f9fafb';

          const diffEntry = diffView?.all.find(e => e.item.id === item.id);
          let diffHTML = '';
          if (diffEntry && diffEntry.diffStatus !== 'unchanged' && diffEntry.diffStatus !== 'not-in-prior') {
            const diffCfg: Record<string, { bg: string; color: string; label: string }> = {
              'resolved':      { bg: '#d4edda', color: '#155724', label: '✓ تم التصحيح' },
              'still-failing': { bg: '#f8d7da', color: '#721c24', label: '⚠ لا يزال' },
              'new-violation': { bg: '#fff3cd', color: '#856404', label: '🆕 جديد' },
            };
            const cfg = diffCfg[diffEntry.diffStatus];
            if (cfg) {
              diffHTML = `<span style="display:inline-block;font-size:10px;font-weight:700;
                padding:1px 6px;border-radius:4px;background:${cfg.bg};color:${cfg.color};
                margin-right:4px">${cfg.label}</span>`;
            }
          }

          // Phase-6: numeric value cell
          const numericCell = hasNumericItems
            ? `<td style="text-align:center;font-size:12px;color:#37474f;font-weight:600">${
                item.numericValue !== undefined && item.numericValue !== null
                  ? `${item.numericValue}${
                      item.numericField?.unit ? ' ' + item.numericField.unit : ''
                    }`
                  : '—'
              }</td>`
            : '';

          return `
            <tr style="background:${rowBg}">
              <td>${item.criteria}${diffHTML}</td>
              <td class="ref-col">${item.legalReference || '-'}</td>
              <td class="status-cell" style="background:${bg};color:${color}">
                ${getStatusText(item.complianceStatus)}
              </td>
              ${numericCell}
              <td>${item.comment || ''}</td>
            </tr>`;
        })
        .join('');

      const colspan = hasNumericItems ? 5 : 4;
      return `
        <tr class="axis-header-row">
          <th colspan="${colspan}">${axis}</th>
        </tr>
        ${rows}`;
    })
    .join('');

  const numericColHeader = hasNumericItems
    ? '<th style="width:80px;text-align:center">القيمة المقاسة</th>'
    : '';

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
    .report-badge { color: #fff; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; }
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
    <div class="report-badge" style="background:${inspTypeBadgeColor}">${inspTypeLabel}</div>
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
  ${differentialSectionHTML}
  ${decisionSectionHTML}
  <div class="checklist-title">بنود التفتيش</div>
  <table class="main-table">
    <thead>
      <tr>
        <th>المعيار</th>
        <th class="ref-col">المرجع القانوني</th>
        <th style="width:100px">النتيجة</th>
        ${numericColHeader}
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

// ─── HTML builder (blank printable checklist) ────────────────────────────────────────────────────

function buildBlankChecklistHTML(
  activityName: string,
  items: InspectionItem[],
  officeName: string,
): string {
  const groups = groupByAxisRaw(items);
  let rowIndex = 0;

  const groupsHTML = groups
    .map(([axis, axisItems]) => {
      const rows = axisItems
        .map(item => {
          const even  = rowIndex++ % 2 === 0;
          const rowBg = even ? '#ffffff' : '#f9fafb';
          return `
            <tr style="background:${rowBg}">
              <td class="num-col">${rowIndex}</td>
              <td>${item.criteria}</td>
              <td class="ref-col">${item.legalReference || '-'}</td>
              <td class="sev-col">${severityLabel(item.severity)}</td>
              <td class="tick-col">☐</td>
              <td class="tick-col">☐</td>
              <td class="tick-col">☐</td>
              <td class="notes-col"></td>
            </tr>`;
        })
        .join('');
      return `
        <tr class="axis-header-row">
          <th colspan="8">${axis}</th>
        </tr>
        ${rows}`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    @media print { body { padding: 10px 16px; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', Arial, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; padding: 20px 28px; direction: rtl; }
    .letterhead { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #1a6b5a; padding-bottom: 12px; margin-bottom: 14px; }
    .letterhead-title { font-size: 20px; font-weight: 900; color: #1a6b5a; }
    .letterhead-subtitle { font-size: 12px; color: #7f8c8d; margin-top: 2px; }
    .blank-badge { background: #fff; color: #1a6b5a; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 20px; border: 2px solid #1a6b5a; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; background: #f4f7f6; border: 1px solid #dce8e5; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; }
    .meta-grid .field { display: flex; align-items: center; gap: 6px; font-size: 12px; }
    .meta-grid .field-label { color: #1a6b5a; font-weight: 700; white-space: nowrap; }
    .meta-grid .field-line { flex: 1; border-bottom: 1px solid #aaa; min-width: 60px; height: 18px; }
    .summary-row { display: flex; gap: 12px; margin-bottom: 14px; }
    .summary-box { flex: 1; border: 1px solid #d5e0dd; border-radius: 6px; padding: 8px 12px; text-align: center; }
    .summary-box .sb-label { font-size: 11px; color: #7f8c8d; margin-bottom: 4px; }
    .summary-box .sb-val { font-size: 18px; font-weight: 900; color: #1a6b5a; }
    .checklist-title { font-size: 14px; font-weight: 700; color: #1a6b5a; border-right: 4px solid #1a6b5a; padding-right: 10px; margin-bottom: 10px; }
    table.main-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    table.main-table th, table.main-table td { border: 1px solid #c8d8d4; padding: 5px 6px; vertical-align: middle; text-align: right; }
    table.main-table thead tr th { background: #1a6b5a; color: #fff; font-size: 12px; font-weight: 700; text-align: center; }
    tr.axis-header-row th { background: #d4ebe5; color: #1a6b5a; font-size: 12px; font-weight: 700; text-align: right; padding: 6px 10px; }
    .num-col  { text-align: center; width: 28px; color: #7f8c8d; font-size: 10px; }
    .ref-col  { font-size: 10px; color: #7f8c8d; width: 90px; }
    .sev-col  { text-align: center; width: 60px; font-size: 10px; }
    .tick-col { text-align: center; width: 38px; font-size: 16px; line-height: 1; }
    .notes-col { width: 120px; }
    .sig-section { margin-top: 22px; display: flex; justify-content: space-between; gap: 20px; }
    .sig-box { flex: 1; border-top: 1px solid #aaa; padding-top: 6px; text-align: center; font-size: 11px; color: #555; }
    .footer { margin-top: 16px; border-top: 1px solid #d5e0dd; padding-top: 8px; font-size: 10px; color: #95a5a6; text-align: center; }
  </style>
</head>
<body>
  <div class="letterhead">
    <div>
      <div class="letterhead-title">${officeName || 'SafeInspect'}</div>
      <div class="letterhead-subtitle">قائمة تفتيش — ${activityName}</div>
    </div>
    <div class="blank-badge">نموذج ورقي للطباعة</div>
  </div>
  <div class="meta-grid">
    <div class="field"><span class="field-label">اسم المنشأة:</span><span class="field-line"></span></div>
    <div class="field"><span class="field-label">العنوان:</span><span class="field-line"></span></div>
    <div class="field"><span class="field-label">تاريخ التفتيش:</span><span class="field-line"></span></div>
    <div class="field"><span class="field-label">اسم المفتش:</span><span class="field-line"></span></div>
    <div class="field"><span class="field-label">سبب التفتيش:</span><span class="field-line"></span></div>
    <div class="field"><span class="field-label">رقم المحضر:</span><span class="field-line"></span></div>
  </div>
  <div class="summary-row">
    <div class="summary-box"><div class="sb-label">إجمالي البنود</div><div class="sb-val">${items.length}</div></div>
    <div class="summary-box"><div class="sb-label">مطابق ✔</div><div class="sb-val sb-empty">___</div></div>
    <div class="summary-box"><div class="sb-label">غير مطابق ✘</div><div class="sb-val sb-empty">___</div></div>
    <div class="summary-box"><div class="sb-label">لا ينطبق —</div><div class="sb-val sb-empty">___</div></div>
    <div class="summary-box"><div class="sb-label">التقييم النهائي</div><div class="sb-val sb-empty">___</div></div>
  </div>
  <div class="checklist-title">بنود التفتيش</div>
  <table class="main-table">
    <thead>
      <tr>
        <th class="num-col">#</th>
        <th>المعيار / البند</th>
        <th class="ref-col">المرجع القانوني</th>
        <th class="sev-col">الخطورة</th>
        <th class="tick-col">✔ مطابق</th>
        <th class="tick-col">✘ غير مطابق</th>
        <th class="tick-col">— لا ينطبق</th>
        <th class="notes-col">ملاحظات</th>
      </tr>
    </thead>
    <tbody>${groupsHTML}</tbody>
  </table>
  <div class="sig-section">
    <div class="sig-box">توقيع المفتش</div>
    <div class="sig-box">توقيع مدير المنشأة</div>
    <div class="sig-box">ختم المنشأة</div>
  </div>
  <div class="footer">
    SafeInspect — نظام التفتيش الميداني &nbsp;|&nbsp;
    ${new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</body>
</html>`;
}

function severityLabel(sev?: string): string {
  switch (sev) {
    case 'high':   return 'عالية';
    case 'medium': return 'متوسطة';
    case 'low':    return 'منخفضة';
    default:       return '-';
  }
}

// ─── PDF export (full report) ─────────────────────────────────────────────────────────────────────────────

export async function exportInspectionPDF(inspection: SavedInspection): Promise<void> {
  const settings = await SettingsRepository.get();
  const settingsInspector = settings.inspectorName ?? '';

  let diffView: DifferentialView | null = null;
  if (inspection.inspectionType === 'follow-up') {
    try {
      let prior: SavedInspection | null = null;
      if (inspection.priorInspectionId) {
        prior = await InspectionRepository.getById(inspection.priorInspectionId);
      }
      if (!prior) {
        const all = await InspectionRepository.getAll();
        const candidates = all
          .filter(i => i.facilityId === inspection.facilityId && i.status === 'completed' && i.id !== inspection.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        prior = candidates[0] ?? null;
      }
      diffView = buildDifferentialViewSync(inspection, prior);
    } catch { /* non-fatal */ }
  }

  const html = buildReportHTML(inspection, settingsInspector, diffView);

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

// ─── PDF export (blank printable checklist) ────────────────────────────────────────────────────

export async function exportBlankChecklistPDF(
  activityName: string,
  items: InspectionItem[],
): Promise<void> {
  try {
    const settings  = await SettingsRepository.get();
    const officeName = settings.officeName ?? '';
    const html = buildBlankChecklistHTML(activityName, items, officeName);

    if (Platform.OS === 'ios') {
      const { uri } = await Print.printToFileAsync({ html });
      const dest =
        (FileSystem.documentDirectory ?? '') +
        generateFileName(activityName + '_blank', 'pdf');
      await FileSystem.copyAsync({ from: uri, to: dest });
      await FileSystem.deleteAsync(uri, { idempotent: true });
      await Sharing.shareAsync(dest, {
        mimeType: 'application/pdf',
        dialogTitle: 'مشاركة قائمة التفتيش',
        UTI: 'com.adobe.pdf',
      });
    } else {
      await Print.printAsync({ html });
    }
  } catch (error) {
    console.error('exportBlankChecklistPDF error:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء تصدير قائمة التفتيش');
  }
}

// ─── CSV export ───────────────────────────────────────────────────────────────────────────────────

export async function exportInspectionCSV(inspection: SavedInspection): Promise<void> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) {
    Alert.alert('خطأ', 'لا يمكن الوصول إلى مسار التخزين المؤقت');
    return;
  }
  try {
    const headers = ['المحور', 'الفئة', 'المعيار', 'المرجع القانوني', 'النتيجة', 'القيمة المقاسة', 'ملاحظات'];
    const rows = inspection.items.map(item => [
      item.axis || '',
      item.category || '',
      item.criteria,
      item.legalReference || '-',
      getStatusText(item.complianceStatus),
      item.numericValue !== undefined && item.numericValue !== null
        ? `${item.numericValue}${item.numericField?.unit ? ' ' + item.numericField.unit : ''}`
        : '',
      item.comment || '',
    ]);

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
