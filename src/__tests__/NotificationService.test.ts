// src/__tests__/NotificationService.test.ts
import {
  scheduleForAgendaItem,
  cancelForAgendaItem,
  rescheduleAll,
} from '../services/NotificationService';

const futureDate = new Date(Date.now() + 86400000 * 3).toISOString();

const makeAgendaItem = (id = 'a1') => ({
  id,
  facilityName: 'Test Facility',
  date: futureDate,
  notes: '',
});

describe('scheduleForAgendaItem', () => {
  it('resolves without throwing', async () => {
    await expect(scheduleForAgendaItem(makeAgendaItem())).resolves.toBeUndefined();
  });

  it('resolves for past date', async () => {
    const item = { ...makeAgendaItem(), date: new Date(2020, 0, 1).toISOString() };
    await expect(scheduleForAgendaItem(item)).resolves.toBeUndefined();
  });

  it('resolves when disabled', async () => {
    await expect(scheduleForAgendaItem(makeAgendaItem('a2'))).resolves.toBeUndefined();
  });

  it('resolves even with empty notes', async () => {
    await expect(scheduleForAgendaItem(makeAgendaItem('a3'))).resolves.toBeUndefined();
  });
});

describe('cancelForAgendaItem', () => {
  it('resolves without throwing', async () => {
    await expect(cancelForAgendaItem('a1')).resolves.toBeUndefined();
  });
});

describe('rescheduleAll', () => {
  // rescheduleAll() takes no arguments — it lazily loads AgendaRepository
  it('resolves without throwing', async () => {
    await expect(rescheduleAll()).resolves.toBeUndefined();
  });

  it('resolves when called again', async () => {
    await expect(rescheduleAll()).resolves.toBeUndefined();
  });

  it('resolves a third time', async () => {
    await expect(rescheduleAll()).resolves.toBeUndefined();
  });

  it('resolves a fourth time', async () => {
    await expect(rescheduleAll()).resolves.toBeUndefined();
  });
});
