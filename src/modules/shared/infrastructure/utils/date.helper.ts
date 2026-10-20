import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export { dayjs };

/** ISO 8601 en UTC: 2026-05-20T14:30:00.000Z */
export const nowISO = (): string => dayjs.utc().toISOString();

/** Convierte un Date/string a ISO 8601 en UTC */
export const toISO = (date: Date | string): string => dayjs.utc(date).toISOString();

/** Fecha actual como objeto dayjs en UTC */
export const nowUTC = (): dayjs.Dayjs => dayjs.utc();

/** Fecha actual en una zona horaria específica como objeto dayjs */
export const nowInTimezone = (tz: string): dayjs.Dayjs => dayjs().tz(tz);

/** ISO 8601 con offset de zona horaria: 2026-05-20T10:30:00.000-04:00 */
export const nowISOInTimezone = (tz: string): string => dayjs().tz(tz).format('YYYY-MM-DDTHH:mm:ss.SSSZ');

/** Nombre de archivo de log diario: YYYY-MM-DD */
export const todayDateString = (): string => dayjs.utc().format('YYYY-MM-DD');
