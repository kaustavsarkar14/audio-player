import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [file, setFile] = useState();

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
      console.log("IndexedDB opened successfully");
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
            file: item.data,
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

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = () => {
      const base64Data = reader.result;
      addToIndexedDB(selectedFile.name, base64Data);
    };

    setPlaylist([...playlist, { name: selectedFile.name, file: selectedFile }]);
  };

  const addToIndexedDB = (fileName, data) => {
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

  return (
    <div>
      <input type="file" onChange={handleFileInput} />
      {file && (
        <audio key={file.name} controls>
          <source src={URL.createObjectURL(file)} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
      {playlist.map((audio, i) => {
        return (
          <div key={i} onClick={() => setFile(audio)}>
            {audio.name}
          </div>
        );
      })}
    </div>
  );
}

export default App;
