import EventEmitter from "events";
import { createClient } from "@deepgram/sdk";
import { LiveTranscriptionEvents } from "@deepgram/sdk";

class Transcriber extends EventEmitter {
  constructor() {
    super();

    this.deepgram = createClient(
      process.env.DEEPGRAM_API_KEY || "88fe9897da5f499b9dcc0531f5ce2d2f0e556a95"
    );
    console.log(this.deepgram);
    this.transcibing = false;
    this.transcriptionStream = false;

    this.live = this.deepgram.listen.live({
      model: "nova-2",
      punctuate: true,
      language: "en",
      interim_results: true,
      diarize: false,
      smart_format: true,
      endpointing: 0,
      encoding: "linear16",
      // sample_rate: sampleRate,
    });
  }

  // sampleRate: number
  startTranscriptionStream(sampleRate) {
    this.live.on(LiveTranscriptionEvents.Open, () => {
      this.live.on(LiveTranscriptionEvents.Transcript, (data) => {
        console.log(data);
      });
    });

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
    this.live.finish();
    // close deepgram connection here
  }

  // NOTE: deepgram must be ready before sending audio payload or it will close the connection
  send(payload) {
    this.live.send(payload);
  }

  // ... feel free to add more functions
}

export default Transcriber;
