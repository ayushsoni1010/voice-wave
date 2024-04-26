import EventEmitter from "events";

class Transcriber extends EventEmitter {
  constructor() {
    super();
  }

  // sampleRate: number
  startTranscriptionStream(sampleRate) {
    // example deepgram configuration
    /*
    {
      model: "nova-2",
      punctuate: true,
      language: "en",
      interim_results: true,
      diarize: false,
      smart_format: true,
      endpointing: 0,
      encoding: "linear16",
      sample_rate: sampleRate,
    }
      */
  }

  endTranscriptionStream() {
    // close deepgram connection here
  }

  // NOTE: deepgram must be ready before sending audio payload or it will close the connection
  send(payload) {}

  // ... feel free to add more functions
}

export default Transcriber;
