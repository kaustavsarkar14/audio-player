import { useEffect } from "react";

const useIndexDB = ({setPlaylist})=>{
    useEffect(() => {
        openDatabase();
        fetchDataFromIndexedDB();
      }, []);
    
      const openDatabase = () => {
        const request = window.indexedDB.open("audioDatabase", 1);
    
        request.onerror = (event) => {
          console.error("Error opening IndexedDB:", event.target.error);
        };
    
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore("audioStore", {
            keyPath: "id",
            autoIncrement: true,
          });
        };
    
        request.onsuccess = (event) => {
        };
      };
    
      const fetchDataFromIndexedDB = () => {
        const request = window.indexedDB.open("audioDatabase", 1);
        request.onerror = (event) => {
          console.error("Error opening IndexedDB:", event.target.error);
        };
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(["audioStore"], "readonly");
          const objectStore = transaction.objectStore("audioStore");
          const getAllRequest = objectStore.getAll();
          getAllRequest.onsuccess = (event) => {
            setPlaylist(
              event.target.result.map((item) => ({
                name: item.fileName,
                data: item.data,
              }))
            );
          };
          
          getAllRequest.onerror = (error) => {
            console.error(
              "Error retrieving data from IndexedDB:",
              error.target.error
            );
          };
        };
      };
}

export default useIndexDB