import { useEffect, useState } from "react";
import useAudioRecorder from "./hooks/useAudioRecorder";
import useSocket from "./hooks/useSocket";

// IMPORTANT: To ensure proper functionality and microphone access, please follow these steps:
// 1. Access the site using 'localhost' instead of the local IP address.
// 2. When prompted, grant microphone permissions to the site to enable audio recording.
// Failure to do so may result in issues with audio capture and transcription.

function App() {
  const {
    socket,
    initialize,
    handleStartTransription,
    disconnect,
    initializeStream,
    sendStreamedAudio,
  } = useSocket();

  const [transcription, setTrancription] = useState("");
  const [isTranscibing, setIsTranscibing] = useState(false);
  const [data, setData] = useState();

  useEffect(() => {
    // Note: must connect to server on page load
    if (socket === null) {
      initialize();
    }

    return () => {
      disconnect();
    };
  }, [initialize, disconnect, socket]);

  useEffect(() => {
    if (data) {
      sendStreamedAudio(data);
    }
  }, [data, sendStreamedAudio]);

  const { startRecording, stopRecording, isRecording, togglePauseResume } =
    useAudioRecorder({
      dataCb: (data) => {
        setData(data);
      },
    });

  const onStartRecordingPress = async () => {
    try {
      const sampleRate = await startRecording();
      initializeStream(sampleRate);
      // handleStartTransription();
      setIsTranscibing(true);
    } catch (error) {
      console.log("Recording failed");
    }
    // start recorder and transcriber
  };

  const onStopRecordingPress = async () => {
    stopRecording();
    setTimeout(() => {
      setIsTranscibing(false);
    }, 3000);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(transcription);
  };

  const handleClearText = () => {
    setTrancription("");
  };

  // ... add more functions
  return (
    <div>
      <h1>Speechify Voice Notes</h1>
      <p>Record or type something in the textbox.</p>
      <textarea
        id="transcription-display"
        rows={10}
        cols={50}
        onChange={(e) => setTrancription(e.target.value)}
      ></textarea>
      {!isRecording ? (
        <button id="record-button" onClick={onStartRecordingPress}>
          {!isTranscibing ? "Start Recording" : "Loading..."}
        </button>
      ) : (
        <button id="record-button" onClick={onStopRecordingPress}>
          {!isTranscibing ? "Stop Recording" : "Loading..."}
        </button>
      )}
      <button onClick={togglePauseResume}>Pause</button>
      <button id="copy-button" onClick={handleCopyClick}>
        Copy
      </button>
      <button id="reset-button" onClick={handleClearText}>
        Clear
      </button>
    </div>
  );
}

export default App;
