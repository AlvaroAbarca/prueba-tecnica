import { asyncLocalStorage } from '../log/idWinstonLogs';
import { nanoid } from 'nanoid';

export async function runWithContext<T>(callback: () => Promise<T>, prefix: string = 'cron'): Promise<T> {
  const requestId = `${prefix}-${nanoid(9)}`;
  const store = new Map<string, any>();
  store.set('requestId', requestId);

  return asyncLocalStorage.run(store, callback);
}
