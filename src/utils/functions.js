export const addToIndexedDB = (fileName, data) => {
  const request = window.indexedDB.open("audioDatabase", 1);
  request.onerror = (event) => {
    console.error("Error opening IndexedDB:", event.target.error);
  };
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(["audioStore"], "readwrite");
    const objectStore = transaction.objectStore("audioStore");
    const addRequest = objectStore.add({ fileName, data });
    addRequest.onsuccess = () => {
      console.log("File added to IndexedDB");
    };
    addRequest.onerror = (error) => {
      console.error("Error adding file to IndexedDB:", error.target.error);
    };
  };
};
