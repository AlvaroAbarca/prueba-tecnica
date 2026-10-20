import { nowISO, nowISOInTimezone, nowInTimezone, nowUTC, todayDateString, toISO } from '@modules/shared/infrastructure/utils/date.helper';

describe('date helper', () => {
  it('returns UTC and ISO values', () => {
    expect(nowUTC().utc().isValid()).toBe(true);
    expect(nowISO()).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(toISO('2026-06-02')).toMatch(/^2026-06-02T00:00:00\.000Z$/);
    expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns timezone-aware values', () => {
    const timezoneValue = nowInTimezone('America/Santiago');
    const isoInTimezone = nowISOInTimezone('America/Santiago');

    expect(timezoneValue.isValid()).toBe(true);
    expect(isoInTimezone).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/);
  });
});
