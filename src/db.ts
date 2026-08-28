import type { Take } from './types';

export const REAL_DB_NAME = 'line-take-match';
export const DEMO_DB_NAME = 'demo:line-take-match';
const STORE = 'takes';

function openDatabase(databaseName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
  });
}

async function transaction<T>(databaseName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase(databaseName);
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Local storage action failed.'));
    });
  } finally {
    db.close();
  }
}

export function createTakeStore(demo = false) {
  const databaseName = demo ? DEMO_DB_NAME : REAL_DB_NAME;
  return {
    databaseName,
    all: () => transaction<Take[]>(databaseName, 'readonly', (store) => store.getAll()),
    put: (take: Take) => transaction<IDBValidKey>(databaseName, 'readwrite', (store) => store.put(take)),
    remove: (id: string) => transaction<undefined>(databaseName, 'readwrite', (store) => store.delete(id) as IDBRequest<undefined>),
    clear: () => transaction<undefined>(databaseName, 'readwrite', (store) => store.clear() as IDBRequest<undefined>),
  };
}

export const takeStore = createTakeStore();
