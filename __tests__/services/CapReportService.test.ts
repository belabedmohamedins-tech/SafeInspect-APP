// __tests__/services/CapReportService.test.ts
import { Alert, Platform } from 'react-native';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  copyAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///tmp/cap.pdf' }),
  printAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getAll: jest.fn(),
  },
}));

jest.mock('../../src/repositories/SettingsRepository', () => ({
  SettingsRepository: {
    get: jest.fn().mockResolvedValue({ officeName: 'Test Office', inspectorName: 'Ahmed' }),
  },
}));

import { CapReportService } from '../../src/services/CapReportService';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

const makeItem = (overrides = {}): any => ({
  id: 'ca1',
  facilityName: 'Facility A',
  criteria: 'Fire exits clear',
  severity: 'high',
  status: 'open',
  deadline: '2026-08-01',
  assignedTo: 'Inspector B',
  notes: 'Check again',
  ...overrides,
});

const allItems = [
  makeItem({ id: 'ca1', status: 'open' }),
  makeItem({ id: 'ca2', status: 'in-progress' }),
  makeItem({ id: 'ca3', status: 'overdue' }),
  makeItem({ id: 'ca4', status: 'resolved' }),
];

beforeEach(() => {
  jest.clearAllMocks();
  (CorrectiveActionRepository.getAll as jest.Mock).mockResolvedValue(allItems);
});

describe('CapReportService.export', () => {
  describe('iOS', () => {
    beforeAll(() => { (Platform as any).OS = 'ios'; });
    afterAll(() => { (Platform as any).OS = 'android'; });

    it('prints to file and shares on iOS (default filter=open)', async () => {
      await CapReportService.export();
      expect(Print.printToFileAsync).toHaveBeenCalled();
      expect(FileSystem.copyAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('exports overdue filter only', async () => {
      await CapReportService.export('overdue');
      expect(Print.printToFileAsync).toHaveBeenCalled();
    });

    it('exports all filter', async () => {
      await CapReportService.export('all');
      expect(Print.printToFileAsync).toHaveBeenCalled();
    });

    it('shows alert when no items match filter', async () => {
      (CorrectiveActionRepository.getAll as jest.Mock).mockResolvedValue([
        makeItem({ status: 'resolved' }),
      ]);
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      await CapReportService.export('overdue');
      expect(alertSpy).toHaveBeenCalledWith('لا توجد بيانات', expect.any(String));
      alertSpy.mockRestore();
    });

    it('shows error alert on exception', async () => {
      (Print.printToFileAsync as jest.Mock).mockRejectedValueOnce(new Error('print fail'));
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      await CapReportService.export();
      expect(alertSpy).toHaveBeenCalledWith('خطأ', expect.any(String));
      alertSpy.mockRestore();
    });

    it('handles items with missing assignedTo and notes', async () => {
      (CorrectiveActionRepository.getAll as jest.Mock).mockResolvedValue([
        makeItem({ assignedTo: undefined, notes: undefined }),
      ]);
      await CapReportService.export();
      expect(Print.printToFileAsync).toHaveBeenCalled();
    });

    it('renders resolved items in all filter with 100% progress', async () => {
      (CorrectiveActionRepository.getAll as jest.Mock).mockResolvedValue([
        makeItem({ status: 'resolved' }),
        makeItem({ id: 'ca2', status: 'resolved' }),
      ]);
      await CapReportService.export('all');
      expect(Print.printToFileAsync).toHaveBeenCalled();
    });
  });

  describe('Android', () => {
    beforeAll(() => { (Platform as any).OS = 'android'; });

    it('calls printAsync on Android', async () => {
      await CapReportService.export();
      expect(Print.printAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });

    it('shows error alert on exception (android)', async () => {
      (Print.printAsync as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      await CapReportService.export();
      expect(alertSpy).toHaveBeenCalledWith('خطأ', expect.any(String));
      alertSpy.mockRestore();
    });
  });
});
