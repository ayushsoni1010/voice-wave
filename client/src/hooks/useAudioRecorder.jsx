import { useState, useCallback, useRef } from "react";

const useAudioRecorder = ({ dataCb }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState();
  const [timerInterval, setTimerInterval] = useState();
  const sourceNode = useRef();
  const scriptProcessor = useRef();
  const audioContext = useRef(new AudioContext());

  const _startTimer = useCallback(() => {
    const interval = setInterval(() => {
      setRecordingTime((time) => time + 1);
    }, 1000);
    setTimerInterval(interval);
  }, [setRecordingTime, setTimerInterval]);

  const _stopTimer = useCallback(() => {
    timerInterval != null && clearInterval(timerInterval);
    setTimerInterval(undefined);
  }, [timerInterval, setTimerInterval]);

  const float32To16BitPCM = (float32Arr) => {
    const pcm16bit = new Int16Array(float32Arr.length);
    for (let i = 0; i < float32Arr.length; ++i) {
      // force number in [-1,1]
      const s = Math.max(-1, Math.min(1, float32Arr[i]));

      /**
       * convert 32 bit float to 16 bit int pcm audio
       * 0x8000 = minimum int16 value, 0x7fff = maximum int16 value
       */
      pcm16bit[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm16bit;
  };

  const startRecording = async () => {
    if (timerInterval != null) throw new Error("timerInterval not null");
    const isTesting = !navigator.mediaDevices;
    if (isTesting) {
      setIsRecording(true);
      return 24000;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    audioContext.current.resume();
    sourceNode.current = audioContext.current.createMediaStreamSource(stream);

    const chunkSize = 4096;
    scriptProcessor.current = audioContext.current.createScriptProcessor(
      chunkSize,
      1,
      1
    );

    scriptProcessor.current.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const float32Audio = inputBuffer.getChannelData(0);
      const pcm16Audio = float32To16BitPCM(float32Audio);
      if (dataCb) {
        dataCb(pcm16Audio);
      }
    };

    sourceNode.current.connect(scriptProcessor.current);
    scriptProcessor.current.connect(audioContext.current.destination);

    setIsRecording(true);
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.start();
    _startTimer();
    return audioContext.current.sampleRate;
  };

  const stopRecording = () => {
    scriptProcessor.current?.disconnect();
    sourceNode.current?.disconnect();
    mediaRecorder?.stop();
    _stopTimer();
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  };

  const togglePauseResume = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      mediaRecorder?.resume();
      _startTimer();
    } else {
      setIsPaused(true);
      _stopTimer();
      mediaRecorder?.pause();
    }
  }, [mediaRecorder, setIsPaused, _startTimer, _stopTimer]);

  return {
    startRecording,
    stopRecording,
    togglePauseResume,
    isRecording,
  };
};

export default useAudioRecorder;
