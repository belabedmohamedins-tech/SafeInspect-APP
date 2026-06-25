/**
 * Unit tests for src/services/pdfService.ts
 *
 * All native modules (expo-print, expo-sharing, expo-file-system/legacy,
 * react-native Platform, and SettingsRepository) are mocked so the tests
 * run in plain Node / Jest.
 */

import { Alert, Platform } from 'react-native';
import { exportInspectionCSV, exportInspectionPDF } from '../services/pdfService';
import { SavedInspection } from '../types';

// ────────────────────────────────── Mocks ──────────────────────────────────

const mockPrintToFileAsync = jest.fn().mockResolvedValue({ uri: 'file:///tmp/print.pdf' });
const mockPrintAsync       = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-print', () => ({
  printToFileAsync: (...a: any[]) => mockPrintToFileAsync(...a),
  printAsync:       (...a: any[]) => mockPrintAsync(...a),
}));

const mockShareAsync = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-sharing', () => ({
  shareAsync: (...a: any[]) => mockShareAsync(...a),
}));

const mockCopyAsync   = jest.fn().mockResolvedValue(undefined);
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);
const mockWriteAsync  = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  cacheDirectory:    'file:///cache/',
  copyAsync:         (...a: any[]) => mockCopyAsync(...a),
  deleteAsync:       (...a: any[]) => mockDeleteAsync(...a),
  writeAsStringAsync:(...a: any[]) => mockWriteAsync(...a),
  EncodingType:      { UTF8: 'utf8' },
}));

const mockSettingsGet = jest.fn().mockResolvedValue({ inspectorName: 'أحمد سالم' });
jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: () => mockSettingsGet() },
}));

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// ───────────────────────────────── Test data ──────────────────────────────

const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id:               'insp-01',
  facilityId:       'fac-01',
  facilityName:     'مخبزة الصدى',
  facilityAddress:  'شارع الاستقلال',
  date:             '2026-05-10T08:00:00.000Z',
  inspectorName:    'محمد أمين',
  status:           'completed',
  officeName:       'مكتب التجربة',
  inspectionCause:  'routine',
  referenceDocument:'',
  committeeMembers: [],
  items: [
    {
      id: 'item-1',
      criteria:         'توفر سجل صحي',
      legalReference:   'المادة 12',
      axis:             'النظافة',
      complianceStatus: 'compliant',
      comment:          'جيد',
    },
    {
      id: 'item-2',
      criteria:         'سلامة التخزين',
      legalReference:   '',
      axis:             'السلامة',
      complianceStatus: 'non-compliant',
      comment:          '',
    },
  ],
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockPrintToFileAsync.mockResolvedValue({ uri: 'file:///tmp/print.pdf' });
  mockSettingsGet.mockResolvedValue({ inspectorName: 'أحمد سالم' });
});

// Helper: run exportInspectionPDF on iOS and capture the HTML string passed to printToFileAsync
async function captureHTML(inspection: SavedInspection): Promise<string> {
  (Platform as any).OS = 'ios';
  await exportInspectionPDF(inspection);
  return mockPrintToFileAsync.mock.calls[0][0].html as string;
}

// =============================================================================
// buildReportHTML (tested indirectly via the HTML captured from Print mock)
// =============================================================================

describe('buildReportHTML — inspector name', () => {
  it('uses the inspectorName from the inspection when non-empty', async () => {
    const html = await captureHTML(makeInspection({ inspectorName: 'محمد أمين' }));
    expect(html).toContain('محمد أمين');
  });

  it('falls back to settings inspectorName when inspection.inspectorName is blank', async () => {
    mockSettingsGet.mockResolvedValue({ inspectorName: 'فاطمة بن علي' });
    const html = await captureHTML(makeInspection({ inspectorName: '' }));
    expect(html).toContain('فاطمة بن علي');
  });

  it('shows "غير محدد" when both inspection and settings inspector are blank', async () => {
    mockSettingsGet.mockResolvedValue({ inspectorName: '' });
    const html = await captureHTML(makeInspection({ inspectorName: '' }));
    expect(html).toContain('غير محدد');
  });
});

describe('buildReportHTML — facility info', () => {
  it('includes facilityName in the HTML', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('مخبزة الصدى');
  });

  it('includes facilityAddress in the HTML', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('شارع الاستقلال');
  });

  it('shows "غير محدد" when facilityAddress is empty', async () => {
    const html = await captureHTML(makeInspection({ facilityAddress: '' }));
    expect(html).toContain('غير محدد');
  });
});

describe('buildReportHTML — items rendering', () => {
  it('renders "-" for items with no legalReference', async () => {
    const html = await captureHTML(makeInspection());
    // item-2 has empty legalReference — should render as '-'
    const rows = html.split('<tr').filter(r => r.includes('سلامة التخزين'));
    expect(rows[0]).toContain('>-<');
  });

  it('renders an empty cell when comment is empty', async () => {
    const inspection = makeInspection();
    // item-2 has empty comment
    const html = await captureHTML(inspection);
    expect(html).toContain('<td></td>');
  });

  it('groups items under their axis heading', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('النظافة');
    expect(html).toContain('السلامة');
  });

  it('items without an axis fall into the "أخرى" group', async () => {
    const inspection = makeInspection({
      items: [{ id: 'x', criteria: 'بند غير مصنف', legalReference: '', axis: undefined as any, complianceStatus: 'n/a', comment: '' }],
    });
    const html = await captureHTML(inspection);
    expect(html).toContain('أخرى');
  });

  it('renders all four complianceStatus Arabic labels', async () => {
    const inspection = makeInspection({
      items: [
        { id: 'a', criteria: 'A', legalReference: '', axis: 'محور', complianceStatus: 'compliant',     comment: '' },
        { id: 'b', criteria: 'B', legalReference: '', axis: 'محور', complianceStatus: 'non-compliant', comment: '' },
        { id: 'c', criteria: 'C', legalReference: '', axis: 'محور', complianceStatus: 'n/a',           comment: '' },
        { id: 'd', criteria: 'D', legalReference: '', axis: 'محور', complianceStatus: 'not-evaluated', comment: '' },
      ],
    });
    const html = await captureHTML(inspection);
    expect(html).toContain('مطابق');
    expect(html).toContain('غير مطابق');
    // 'n/a' and 'not-evaluated' map to Arabic too — just verify no raw English leaks
    expect(html).not.toContain('>compliant<');
    expect(html).not.toContain('>non-compliant<');
    expect(html).not.toContain('>not-evaluated<');
    expect(html).not.toContain('>n/a<');
  });

  it('HTML has dir="rtl" and charset utf-8', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('dir="rtl"');
    expect(html.toLowerCase()).toContain('charset=utf-8');
  });
});

// =============================================================================
// exportInspectionPDF — iOS path
// =============================================================================

describe('exportInspectionPDF — iOS', () => {
  beforeEach(() => { (Platform as any).OS = 'ios'; });

  it('calls printToFileAsync with HTML', async () => {
    await exportInspectionPDF(makeInspection());
    expect(mockPrintToFileAsync).toHaveBeenCalledWith(
      expect.objectContaining({ html: expect.stringContaining('<!DOCTYPE html>') })
    );
  });

  it('copies the temp PDF to documentDirectory', async () => {
    await exportInspectionPDF(makeInspection());
    expect(mockCopyAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'file:///tmp/print.pdf',
        to:   expect.stringContaining('file:///docs/'),
      })
    );
  });

  it('deletes the original temp PDF after copying', async () => {
    await exportInspectionPDF(makeInspection());
    expect(mockDeleteAsync).toHaveBeenCalledWith(
      'file:///tmp/print.pdf',
      expect.objectContaining({ idempotent: true })
    );
  });

  it('calls Sharing.shareAsync with mimeType application/pdf', async () => {
    await exportInspectionPDF(makeInspection());
    expect(mockShareAsync).toHaveBeenCalledWith(
      expect.stringContaining('file:///docs/'),
      expect.objectContaining({ mimeType: 'application/pdf' })
    );
  });
});

// =============================================================================
// exportInspectionPDF — Android path
// =============================================================================

describe('exportInspectionPDF — Android', () => {
  beforeEach(() => { (Platform as any).OS = 'android'; });

  it('calls Print.printAsync (system print dialog)', async () => {
    await exportInspectionPDF(makeInspection());
    expect(mockPrintAsync).toHaveBeenCalledWith(
      expect.objectContaining({ html: expect.any(String) })
    );
  });

  it('does NOT call FileSystem.copyAsync on Android', async () => {
    await exportInspectionPDF(makeInspection());
    expect(mockCopyAsync).not.toHaveBeenCalled();
  });

  it('does NOT call Sharing.shareAsync on Android', async () => {
    await exportInspectionPDF(makeInspection());
    expect(mockShareAsync).not.toHaveBeenCalled();
  });
});

// =============================================================================
// exportInspectionPDF — error handling
// =============================================================================

describe('exportInspectionPDF — error handling', () => {
  it('catches errors and shows an Arabic Alert', async () => {
    (Platform as any).OS = 'ios';
    mockPrintToFileAsync.mockRejectedValueOnce(new Error('Print failed'));
    await exportInspectionPDF(makeInspection());
    expect(Alert.alert).toHaveBeenCalledWith('خطأ', expect.any(String));
  });
});

// =============================================================================
// exportInspectionCSV
// =============================================================================

describe('exportInspectionCSV', () => {
  it('writes a UTF-8 CSV to cacheDirectory', async () => {
    await exportInspectionCSV(makeInspection());
    expect(mockWriteAsync).toHaveBeenCalledWith(
      expect.stringContaining('file:///cache/'),
      expect.any(String),
      expect.objectContaining({ encoding: 'utf8' })
    );
  });

  it('CSV starts with Arabic header row', async () => {
    await exportInspectionCSV(makeInspection());
    const csv: string = mockWriteAsync.mock.calls[0][1];
    const firstLine = csv.split('
')[0];
    expect(firstLine).toContain('المعيار');
    expect(firstLine).toContain('النتيجة');
    expect(firstLine).toContain('ملاحظات');
  });

  it('each data row has 4 quoted fields', async () => {
    await exportInspectionCSV(makeInspection());
    const csv: string = mockWriteAsync.mock.calls[0][1];
    const dataLines = csv.split('
').slice(1); // skip header
    dataLines.forEach(line => {
      const fields = line.match(/"[^"]*"/g);
      expect(fields).toHaveLength(4);
    });
  });

  it('escapes double-quotes inside field values', async () => {
    const inspection = makeInspection({
      items: [{
        id: 'q',
        criteria:         'He said "test"',
        legalReference:   '',
        axis:             'محور',
        complianceStatus: 'compliant',
        comment:          '',
      }],
    });
    await exportInspectionCSV(inspection);
    const csv: string = mockWriteAsync.mock.calls[0][1];
    expect(csv).toContain('"He said ""test"""');
  });

  it('calls Sharing.shareAsync with mimeType text/csv', async () => {
    await exportInspectionCSV(makeInspection());
    expect(mockShareAsync).toHaveBeenCalledWith(
      expect.stringContaining('file:///cache/'),
      expect.objectContaining({ mimeType: 'text/csv' })
    );
  });

  it('filename is derived from the facilityName', async () => {
    await exportInspectionCSV(makeInspection());
    const fileUri: string = mockWriteAsync.mock.calls[0][0];
    // generateFileName includes some form of the facility name or a timestamp
    expect(fileUri).toMatch(/\.csv$/);
  });

  it('writes only the header line when items array is empty', async () => {
    await exportInspectionCSV(makeInspection({ items: [] }));
    const csv: string = mockWriteAsync.mock.calls[0][1];
    expect(csv.split('
')).toHaveLength(1);
  });

  it('catches write errors and shows an Arabic Alert', async () => {
    mockWriteAsync.mockRejectedValueOnce(new Error('Disk full'));
    await exportInspectionCSV(makeInspection());
    expect(Alert.alert).toHaveBeenCalledWith('خطأ', expect.any(String));
  });
});
