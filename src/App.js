import { useState, useEffect, useRef } from "react";
import "./App.css";
import { addToIndexedDB } from "./utils/functions";
import useIndexDB from "./hooks/useIndexDB";

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [file, setFile] = useState();
  const [playingAudioIndex, setPlayingAudioIndex] = useState(0);
  const [playingAudioDuration, setPlayingAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const audioRef = useRef(null);
  useIndexDB({ setPlaylist });

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    setFile({
      name: selectedFile.name,
      data: URL.createObjectURL(selectedFile),
    });
    setPlayingAudioIndex(playlist.length);
    localStorage.setItem("lastPlayingAudioIndex", playlist.length);
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

  const handleClickOnAudio = (audio, i) => {
    setIsFirstLoad(false);
    setPlayingAudioIndex(i);
    setPlayingAudioDuration(0);
    setFile(audio);
    localStorage.setItem("lastPlayingAudioIndex", i);
  };

  useEffect(() => {
    if (playlist.length == 0) return;
    setFile(playlist[playingAudioIndex]);
  }, [playlist]);

  useEffect(() => {
    if (!file) return;
    audioRef.current.currentTime = playingAudioDuration;
    if(!isFirstLoad){
      audioRef.current.currentTime = 0;
      setPlayingAudioDuration(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [file]);

  useEffect(() => {
    const lastPlayingAudioIndex = localStorage.getItem("lastPlayingAudioIndex");
    if (lastPlayingAudioIndex)
      setPlayingAudioIndex(parseInt(lastPlayingAudioIndex));

    const lastPlayingAudioDuration = parseFloat(
      localStorage.getItem("playingAudioDuration")
    );
    setPlayingAudioDuration(lastPlayingAudioDuration);
  }, []);

  useEffect(() => {
    localStorage.setItem("playingAudioDuration", playingAudioDuration);
    if(!audioRef.current) return;
    if (playingAudioDuration == audioRef.current.duration){
      setFile(playingAudioIndex == playlist.length - 1 ? playlist[0] : playlist[playingAudioIndex + 1]);
      setPlayingAudioIndex(playingAudioIndex == playlist.length - 1 ? 0 : playingAudioIndex + 1);
    }
  }, [playingAudioDuration]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  return (
    <div className="md:w-[70%] w-full min-h-screen  mx-auto rounded-md p-4 flex flex-col shadow-md">
      <h1 className="text-xl font-semibold">Now playing</h1>
      {file && (
        <div>
          <h1>{file.name}</h1>
          <audio
            className="w-full my-4"
            ref={audioRef}
            key={file.name}
            onTimeUpdate={(e) => setPlayingAudioDuration(e.target.currentTime)}
            controls
          >
            <source src={file.data} type="audio/mpeg" />
          </audio>
        </div>
      )}
      <input type="file" onChange={handleFileInput} />
      <button
        onClick={handlePlayPause}
        className="bg-black p-2 px-4 text-white rounded-md my-2 max-w-24"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <div className="flex flex-col gap-2">
        {playlist.map((audio, i) => {
          return (
            <div
              className={
                "flex p-2 gap-3 rounded-md border cursor-pointer " +
                (playingAudioIndex == i && "bg-gray-200")
              }
              key={i}
              onClick={() => handleClickOnAudio(audio, i)}
            >
              <p>{audio.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
