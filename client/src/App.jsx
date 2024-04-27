import { useEffect, useState } from "react";
import useAudioRecorder from "./useAudioRecorder";
import useSocket from "./useSocket";

// IMPORTANT: To ensure proper functionality and microphone access, please follow these steps:
// 1. Access the site using 'localhost' instead of the local IP address.
// 2. When prompted, grant microphone permissions to the site to enable audio recording.
// Failure to do so may result in issues with audio capture and transcription.
// NOTE: Don't use createPortal()

function App() {
  const { initialize } = useSocket();

  const [transcription, setTrancription] = useState("");

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
    } catch (error) {
      console.log("Recording failed");
    }
    // start recorder and transcriber
  };

  const onStopRecordingPress = async () => {
    stopRecording();
  };

  const handleCopyClick = () => {
    navigator.clipboard
      .readText()
      .then(
        (clipText) => (document.querySelector(".cliptext").innerText = clipText)
      );
  };

  const handleClearText = () => {
    setTrancription("");
    stopRecording();
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
      <button
        id="record-button"
        onClick={onStartRecordingPress}
        disabled={isRecording}
      >
        Record
      </button>
      <button id="copy-button" onClick={handleCopyClick}>
        Copy
      </button>
      <button id="reset-button">Clear</button>
    </div>
  );
}

export default App;

/**
 * To facilitate testing of the web app, please make sure to add the following IDs to the corresponding UI components:

Record Button: Add the ID record-button to the button element that starts and stops the audio recording. Example: <button id="record-button">Record</button>

Transcription Display: Add the ID transcription-display to the element that displays the real-time transcription. Example: <textarea id="transcription-display"></textarea>

Copy Button: Add the ID copy-button to the button element that copies the transcription to the clipboard. Example: <button id="copy-button">Copy</button>

Clear Button: Add the ID reset-button to the button element that clears the transcription. Example: <button id="reset-button">Clear</button>

By adding these IDs to the respective UI components, the provided test suite will be able to locate and interact with the elements correctly.
 * 
 */
