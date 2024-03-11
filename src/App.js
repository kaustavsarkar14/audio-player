import { useState, useEffect } from "react";
import "./App.css";
import { addToIndexedDB } from "./utils/functions";
import useIndexDB from "./hooks/useIndexDB";

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [file, setFile] = useState();
  useIndexDB({ setPlaylist });

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    setFile({
      name: selectedFile.name,
      data: URL.createObjectURL(selectedFile),
    });
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = () => {
      const base64Data = reader.result;
      addToIndexedDB(selectedFile.name, base64Data);
    };

    setPlaylist([
      ...playlist,
      {
        name: selectedFile.name,
        data: URL.createObjectURL(selectedFile),
      },
    ]);
  };

  return (
    <div>
      <div>
        {file && (
          <audio key={file.name} controls>
            <source src={file.data} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
      <input type="file" onChange={handleFileInput} />
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
