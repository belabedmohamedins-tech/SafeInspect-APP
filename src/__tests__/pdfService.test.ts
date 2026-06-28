// src/__tests__/pdfService.test.ts

// ─── Suppress expected console noise ─────────────────────────────────────────
const _consoleError = console.error.bind(console);
const _consoleWarn  = console.warn.bind(console);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = String(args[0] ?? '');
    const suppressed = [
      'exportInspectionPDF error',
      'exportInspectionCSV error',
      'Warning:',
    ];
    if (suppressed.some(s => msg.includes(s))) return;
    _consoleError(...args);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const msg = String(args[0] ?? '');
    if (msg.includes('Warning:')) return;
    _consoleWarn(...args);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Stub constants/theme before anything imports it so Platform.select
// in theme.ts never executes during module loading in the test environment.
// jest.setup.ts already provides a global react-native mock with Platform.select;
// we do NOT re-mock react-native here to avoid overriding that global mock.
jest.mock('../../constants/theme', () => ({
  Colors:  { primary: '#000', background: '#fff', text: '#000', tint: '#000',
             tabIconDefault: '#ccc', tabIconSelected: '#000', error: '#f00',
             success: '#0f0', warning: '#ff0', info: '#00f', muted: '#999',
             border: '#ccc', card: '#fff', notification: '#f00',
             light: { background: '#fff', text: '#000' },
             dark:  { background: '#000', text: '#fff' } },
  Fonts:   { sans: 'normal', mono: 'monospace' },
  Spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  Radius:  { sm: 4, md: 8, lg: 16, full: 9999 },
  Shadow:  {},
}), { virtual: false });

jest.mock('../../constants', () => ({
  Colors:  { primary: '#000', background: '#fff', text: '#000' },
  Fonts:   { sans: 'normal', mono: 'monospace' },
  Spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  Radius:  { sm: 4, md: 8, lg: 16, full: 9999 },
}), { virtual: false });

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn().mockResolvedValue(null),
  setItem:    jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet:   jest.fn().mockResolvedValue([]),
  multiSet:   jest.fn().mockResolvedValue(undefined),
  clear:      jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  cacheDirectory:    'file:///cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync:          jest.fn().mockResolvedValue(undefined),
  deleteAsync:        jest.fn().mockResolvedValue(undefined),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
  printAsync:       jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync:       jest.fn().mockResolvedValue(undefined),
}));

const mockSettingsGet = jest.fn();
jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: mockSettingsGet },
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import * as FileSystem from 'expo-file-system/legacy';
import * as Print      from 'expo-print';
import * as Sharing    from 'expo-sharing';
import { Alert }       from 'react-native';
import {
  exportInspectionCSV,
  exportInspectionPDF,
} from '../services/pdfService';
import { InspectionItem, SavedInspection } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<InspectionItem> = {}): InspectionItem {
  return {
    id:               'item-1',
    criteria:         'توفر سجل صحي',
    legalReference:   'المادة 12',
    axis:             'النظافة',
    complianceStatus: 'compliant',
    comment:          'جيد',
    severity:         'medium',
    ...overrides,
  };
}

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id:             'insp-1',
    facilityName:   'مخبزة الصدى',
    facilityAddress:'شارع الاستقلال',
    date:           '2026-05-10T09:00:00.000Z',
    inspectorName:  'محمد أمين',
    officeName:     'مكتب التجربة',
    inspectionCause:'routine',
    score:          45.5,
    grade:          'D',
    items: [
      makeItem({ id: 'i1', axis: 'النظافة', complianceStatus: 'compliant',     comment: 'جيد' }),
      makeItem({ id: 'i2', axis: 'السلامة', complianceStatus: 'non-compliant', comment: '',    criteria: 'سلامة التخزين', legalReference: '' }),
    ],
    ...overrides,
  };
}

/** Helper: capture the HTML string passed to buildReportHTML via exportInspectionPDF */
async function captureHTML(inspection: SavedInspection): Promise<string> {
  let captured = '';
  (Print.printAsync as jest.Mock).mockImplementationOnce(({ html }: { html: string }) => {
    captured = html;
    return Promise.resolve();
  });
  await exportInspectionPDF(inspection);
  return captured;
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: settings returns an empty inspector name
  mockSettingsGet.mockResolvedValue({ inspectorName: '', officeName: '' });
});

// ─── buildReportHTML — inspector name ────────────────────────────────────────

describe('buildReportHTML — inspector name', () => {
  it('uses inspection.inspectorName when provided', async () => {
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

// ─── buildReportHTML — items rendering ───────────────────────────────────────

describe('buildReportHTML — items rendering', () => {
  it('HTML has dir="rtl" and charset utf-8', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('charset="utf-8"');
  });

  it('renders facility name', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('مخبزة الصدى');
  });

  it('renders compliant item in green', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('#d4edda');
    expect(html).toContain('مطابق');
  });

  it('renders non-compliant item in red', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('#f8d7da');
    expect(html).toContain('غير مطابق');
  });

  it('renders score and grade', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('45.5%');
    expect(html).toContain('>D<');
  });

  it('renders axis group headers', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('النظافة');
    expect(html).toContain('السلامة');
  });

  it('renders legal reference', async () => {
    const html = await captureHTML(makeInspection());
    expect(html).toContain('المادة 12');
  });

  it('renders office name in letterhead', async () => {
    const html = await captureHTML(makeInspection({ officeName: 'مكتب التجربة' }));
    expect(html).toContain('مكتب التجربة');
  });

  it('falls back to "تقرير تفتيش" when officeName is blank', async () => {
    const html = await captureHTML(makeInspection({ officeName: '' }));
    expect(html).toContain('تقرير تفتيش');
  });

  it('renders signature image when present', async () => {
    const html = await captureHTML(makeInspection({ signature: 'data:image/png;base64,abc' }));
    expect(html).toContain('data:image/png;base64,abc');
  });

  it('omits signature section when absent', async () => {
    const html = await captureHTML(makeInspection({ signature: undefined }));
    expect(html).not.toContain('sig-section');
  });

  it('renders na status cell', async () => {
    const html = await captureHTML(
      makeInspection({
        items: [makeItem({ complianceStatus: 'na' })],
      }),
    );
    expect(html).toContain('#e2e3e5');
  });

  it('renders committee members when present', async () => {
    const html = await captureHTML(
      makeInspection({ committeeMembers: ['عمر', 'أيمن'] }),
    );
    expect(html).toContain('عمر');
    expect(html).toContain('أيمن');
  });

  it('renders coordinates when present', async () => {
    const html = await captureHTML(
      makeInspection({ coordinates: { latitude: 36.7372, longitude: 3.0865 } }),
    );
    expect(html).toContain('36.737200');
    expect(html).toContain('3.086500');
  });

  it('renders cause label for routine', async () => {
    const html = await captureHTML(makeInspection({ inspectionCause: 'routine' }));
    expect(html).toContain('تفتيش روتيني');
  });

  it('renders referenceDocument when present', async () => {
    const html = await captureHTML(makeInspection({ referenceDocument: 'REF-2026-001' }));
    expect(html).toContain('REF-2026-001');
  });
});

// ─── exportInspectionPDF ──────────────────────────────────────────────────────

describe('exportInspectionPDF', () => {
  it('calls Print.printAsync on Android', async () => {
    await exportInspectionPDF(makeInspection());
    expect(Print.printAsync).toHaveBeenCalledWith(
      expect.objectContaining({ html: expect.any(String) }),
    );
  });

  it('returns undefined (fire-and-forget)', async () => {
    const result = await exportInspectionPDF(makeInspection());
    expect(result).toBeUndefined();
  });

  it('calls Alert.alert on print error', async () => {
    (Print.printAsync as jest.Mock).mockRejectedValueOnce(new Error('Print failed'));
    await exportInspectionPDF(makeInspection());
    expect(Alert.alert).toHaveBeenCalledWith('خطأ', 'حدث خطأ أثناء تصدير PDF');
  });
});

// ─── exportInspectionCSV ──────────────────────────────────────────────────────

describe('exportInspectionCSV', () => {
  it('writes a UTF-8 CSV file', async () => {
    await exportInspectionCSV(makeInspection());
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(Object),
    );
  });

  it('CSV content starts with UTF-8 BOM', async () => {
    let csvContent = '';
    (FileSystem.writeAsStringAsync as jest.Mock).mockImplementationOnce(
      (_path: string, content: string) => { csvContent = content; return Promise.resolve(); },
    );
    await exportInspectionCSV(makeInspection());
    expect(csvContent.charCodeAt(0)).toBe(0xFEFF);
  });

  it('CSV contains Arabic headers', async () => {
    let csvContent = '';
    (FileSystem.writeAsStringAsync as jest.Mock).mockImplementationOnce(
      (_path: string, content: string) => { csvContent = content; return Promise.resolve(); },
    );
    await exportInspectionCSV(makeInspection());
    expect(csvContent).toContain('المعيار');
    expect(csvContent).toContain('النتيجة');
  });

  it('CSV rows contain item data', async () => {
    let csvContent = '';
    (FileSystem.writeAsStringAsync as jest.Mock).mockImplementationOnce(
      (_path: string, content: string) => { csvContent = content; return Promise.resolve(); },
    );
    await exportInspectionCSV(makeInspection());
    expect(csvContent).toContain('توفر سجل صحي');
    expect(csvContent).toContain('مطابق');
  });

  it('calls Sharing.shareAsync after writing', async () => {
    await exportInspectionCSV(makeInspection());
    expect(Sharing.shareAsync).toHaveBeenCalled();
  });

  it('calls Alert.alert on write error', async () => {
    (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));
    await exportInspectionCSV(makeInspection());
    expect(Alert.alert).toHaveBeenCalledWith('خطأ', 'حدث خطأ أثناء تصدير Excel');
  });

  it('each CSV field is double-quote wrapped', async () => {
    const dataLines: string[] = [];
    (FileSystem.writeAsStringAsync as jest.Mock).mockImplementationOnce(
      (_path: string, content: string) => {
        dataLines.push(...content.split('\n').slice(1));
        return Promise.resolve();
      },
    );
    await exportInspectionCSV(makeInspection());
    expect(dataLines.length).toBeGreaterThan(0);
    dataLines.forEach(line => {
      if (line.trim()) {
        expect(line).toMatch(/^".*"$/);
      }
    });
  });
});
