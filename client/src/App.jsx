import { useEffect, useState } from "react";
import useAudioRecorder from "./useAudioRecorder";
import useSocket from "./useSocket";

// IMPORTANT: To ensure proper functionality and microphone access, please follow these steps:
// 1. Access the site using 'localhost' instead of the local IP address.
// 2. When prompted, grant microphone permissions to the site to enable audio recording.
// Failure to do so may result in issues with audio capture and transcription.
// NOTE: Don't use createPortal()

function App() {
  const { initialize, handleStartTransription } = useSocket();

  const [transcription, setTrancription] = useState("");
  const [isTranscibing, setIsTranscibing] = useState(false);

  useEffect(() => {
    // Note: must connect to server on page load
    initialize();
  }, [initialize]);

  const { startRecording, stopRecording, isRecording } = useAudioRecorder({
    dataCb: (data) => {},
  });

  const onStartRecordingPress = async () => {
    try {
      await startRecording();
      handleStartTransription();
      setIsTranscibing(true);
    } catch (error) {
      console.log("Recording failed");
    }
    // start recorder and transcriber
  };

  const onStopRecordingPress = async () => {
    stopRecording();
    setIsTranscibing(false);
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
      {!isTranscibing ? (
        <button
          id="record-button"
          onClick={onStartRecordingPress}
          disabled={isRecording}
        >
          Record
        </button>
      ) : (
        <button id="record-button" onClick={onStopRecordingPress}>
          Stop Recording
        </button>
      )}
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
