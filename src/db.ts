import type { Take } from './types';

const DB_NAME = 'line-take-match';
const STORE = 'takes';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
  });
}

async function transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
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

export const takeStore = {
  all: () => transaction<Take[]>('readonly', (store) => store.getAll()),
  put: (take: Take) => transaction<IDBValidKey>('readwrite', (store) => store.put(take)),
  remove: (id: string) => transaction<undefined>('readwrite', (store) => store.delete(id) as IDBRequest<undefined>),
  clear: () => transaction<undefined>('readwrite', (store) => store.clear() as IDBRequest<undefined>),
};
