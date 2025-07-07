const dbName = 'myAppDB';
const storeName = 'savedData';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

export async function saveData(data) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).put(data);
  return tx.complete;
}

export async function getAllData() {
  const db = await openDB();
  return new Promise((resolve) => {
    const store = db.transaction(storeName).objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteData(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}