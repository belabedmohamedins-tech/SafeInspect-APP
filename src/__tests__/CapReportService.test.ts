// src/__tests__/CapReportService.test.ts

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///app/',
  copyAsync:         jest.fn(),
  deleteAsync:       jest.fn(),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
  printAsync:       jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert:    { alert: jest.fn() },
  Platform: { OS: 'ios' },
}));

jest.mock('../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { getAll: jest.fn() },
}));

jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: jest.fn() },
}));

import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { CapReportService } from '../services/CapReportService';
import { CorrectiveAction, Settings } from '../types';

// ─── Typed stubs ─────────────────────────────────────────────────────────────
const mockGetAll      = jest.mocked(CorrectiveActionRepository.getAll);
const mockGetSettings = jest.mocked(SettingsRepository.get);
const mockPrintFile   = jest.mocked(Print.printToFileAsync);
const mockPrintAsync  = jest.mocked(Print.printAsync);
const mockShareAsync  = jest.mocked(Sharing.shareAsync);
const mockCopyAsync   = jest.mocked(FileSystem.copyAsync);
const mockDeleteAsync = jest.mocked(FileSystem.deleteAsync);
const mockAlert       = jest.mocked(Alert.alert);

function makeCAP(overrides: Partial<CorrectiveAction> = {}): CorrectiveAction {
  return {
    id: 'cap-1',
    inspectionId: 'insp-1',
    facilityName: 'Test Facility',
    criteria: 'Safety rule',
    severity: 'high',
    status: 'open',
    deadline: '2027-01-15T00:00:00.000Z',
    assignedTo: 'Inspector A',
    notes: 'Fix required',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  };
}

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    officeName: 'Central Office',
    inspectorName: 'Ahmed',
    notificationsEnabled: true,
    language: 'ar',
    theme: 'light',
    ...overrides,
  } as Settings;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSettings.mockResolvedValue(makeSettings());
  mockPrintFile.mockResolvedValue({ uri: 'file:///tmp/cap.pdf' } as any);
  mockPrintAsync.mockResolvedValue(undefined);
  mockShareAsync.mockResolvedValue(undefined);
  mockCopyAsync.mockResolvedValue(undefined);
  mockDeleteAsync.mockResolvedValue(undefined);
});

describe('CapReportService', () => {
  describe('export — no data', () => {
    it('shows an alert when there are no items to export', async () => {
      mockGetAll.mockResolvedValueOnce([]);
      await CapReportService.export();
      expect(mockAlert).toHaveBeenCalledWith('لا توجد بيانات', expect.any(String));
      expect(mockPrintFile).not.toHaveBeenCalled();
    });

    it('shows alert for overdue filter when no overdue items exist', async () => {
      mockGetAll.mockResolvedValueOnce([makeCAP({ status: 'open' })]);
      await CapReportService.export('overdue');
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  describe('export — iOS path', () => {
    beforeEach(() => { (Platform as any).OS = 'ios'; });

    it('generates PDF and shares it on iOS', async () => {
      mockGetAll.mockResolvedValueOnce([makeCAP()]);
      await CapReportService.export();
      expect(mockPrintFile).toHaveBeenCalledWith(expect.objectContaining({ html: expect.any(String) }));
      expect(mockCopyAsync).toHaveBeenCalled();
      expect(mockDeleteAsync).toHaveBeenCalled();
      expect(mockShareAsync).toHaveBeenCalledWith(
        expect.stringContaining('cap-report-'),
        expect.objectContaining({ mimeType: 'application/pdf' }),
      );
    });

    it('exports all items when filter is "all"', async () => {
      mockGetAll.mockResolvedValueOnce([
        makeCAP({ status: 'resolved' }),
        makeCAP({ id: 'cap-2', status: 'open' }),
      ]);
      await CapReportService.export('all');
      const html: string = (mockPrintFile.mock.calls[0][0] as any).html;
      expect(html).toContain('مغلق');
      expect(html).toContain('مفتوح');
    });

    it('exports only overdue items when filter is "overdue"', async () => {
      mockGetAll.mockResolvedValueOnce([
        makeCAP({ status: 'open' }),
        makeCAP({ id: 'cap-2', status: 'overdue' }),
      ]);
      await CapReportService.export('overdue');
      const html: string = (mockPrintFile.mock.calls[0][0] as any).html;
      expect(html).toContain('متأخر');
    });

    it('includes office and inspector name in the HTML', async () => {
      mockGetAll.mockResolvedValueOnce([makeCAP()]);
      await CapReportService.export();
      const html: string = (mockPrintFile.mock.calls[0][0] as any).html;
      expect(html).toContain('Central Office');
      expect(html).toContain('Ahmed');
    });

    it('shows alert on export error', async () => {
      mockGetAll.mockResolvedValueOnce([makeCAP()]);
      mockPrintFile.mockRejectedValueOnce(new Error('print failed'));
      await CapReportService.export();
      expect(mockAlert).toHaveBeenCalledWith('خطأ', expect.any(String));
    });
  });

  describe('export — Android path', () => {
    beforeEach(() => { (Platform as any).OS = 'android'; });
    afterEach(() => { (Platform as any).OS = 'ios'; });

    it('uses printAsync on Android instead of printToFileAsync', async () => {
      mockGetAll.mockResolvedValueOnce([makeCAP()]);
      await CapReportService.export();
      expect(mockPrintAsync).toHaveBeenCalledWith(expect.objectContaining({ html: expect.any(String) }));
      expect(mockPrintFile).not.toHaveBeenCalled();
    });
  });

  describe('HTML content', () => {
    it('renders all severity levels in the HTML', async () => {
      mockGetAll.mockResolvedValueOnce([
        makeCAP({ severity: 'low' }),
        makeCAP({ id: 'c2', severity: 'medium' }),
        makeCAP({ id: 'c3', severity: 'critical' }),
      ]);
      await CapReportService.export('all');
      const html: string = (mockPrintFile.mock.calls[0][0] as any).html;
      expect(html).toContain('منخفض');
      expect(html).toContain('متوسط');
      expect(html).toContain('حرج');
    });

    it('renders in-progress status correctly', async () => {
      mockGetAll.mockResolvedValueOnce([makeCAP({ status: 'in-progress' })]);
      await CapReportService.export();
      const html: string = (mockPrintFile.mock.calls[0][0] as any).html;
      expect(html).toContain('جارٍ');
    });

    it('shows em-dash when assignedTo is empty', async () => {
      mockGetAll.mockResolvedValueOnce([makeCAP({ assignedTo: '' })]);
      await CapReportService.export();
      const html: string = (mockPrintFile.mock.calls[0][0] as any).html;
      expect(html).toContain('—');
    });
  });
});
