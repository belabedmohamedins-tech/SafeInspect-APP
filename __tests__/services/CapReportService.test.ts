// __tests__/services/CapReportService.test.ts
// L2 already mocks: expo-file-system/legacy, expo-print, expo-sharing
// We override behaviour per-test via the L2 mocks directly.

import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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
  // Restore L2 mock defaults after clearAllMocks
  (Print.printToFileAsync as jest.Mock).mockResolvedValue({ uri: 'file:///tmp/cap.pdf' });
  (Print.printAsync as jest.Mock).mockResolvedValue(undefined);
  (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);
  (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
  (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
});

describe('CapReportService.export — iOS', () => {
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

  it('renders all-resolved items (100% progress)', async () => {
    (CorrectiveActionRepository.getAll as jest.Mock).mockResolvedValue([
      makeItem({ status: 'resolved' }),
      makeItem({ id: 'ca2', status: 'resolved' }),
    ]);
    await CapReportService.export('all');
    expect(Print.printToFileAsync).toHaveBeenCalled();
  });
});

describe('CapReportService.export — Android', () => {
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
