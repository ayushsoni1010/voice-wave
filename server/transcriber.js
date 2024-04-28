import EventEmitter from "events";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import dotenv from "dotenv";
dotenv.config();

// Class based
class Transcriber extends EventEmitter {
  constructor() {
    super();
    this.connection = null;
    this.keepAlive = null;
  }

  initializeStream(data) {
    console.log("Stream initialized", 10);

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    this.connection = deepgram.listen.live({
      model: "nova-2",
      punctuate: true,
      language: "en",
      interim_results: true,
      diarize: false,
      smart_format: true,
      endpointing: 0,
      encoding: "linear16",
      sample_rate: data ? data.sampleRate : 48000,
    });

    console.log("Deepgram connection initialized", 11);
  }

  async startTranscriptionStream() {
    console.log("Stream started...");

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log("Connection closed.");
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        console.log(data.channel.alternatives[0].transcript);
      });

      this.connection.on(LiveTranscriptionEvents.Metadata, (data) => {
        console.log(data);
      });

      this.connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error(err);
      });
    });
  }

  async endTranscriptionStream() {
    this.connection.on(LiveTranscriptionEvents.Open, () => {
      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log("Connection close: Ended Transcription streaming");
      });
    });

    console.log("Transcription stream ended");
  }

  // NOTE: deepgram must be ready before sending audio payload or it will close the connection
  async send(payload) {
    console.log(payload, 10);
    this.initializeStream();
    console.log("Sending audio payload");

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      console.log("Sending...");
      this.startTranscriptionStream();
      this.connection.send(payload);
    });
  }
}

export default Transcriber;

// --------------------------------------------------------------------------------------------

// Function based (testing purpose)
export const live = async (data) => {
  // Initialize the Deepgram SDK
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  // Create a websocket connection to Deepgram
  const connection = deepgram.listen.live({
    model: "nova-2",
    punctuate: true,
    language: "en",
    interim_results: true,
    diarize: false,
    smart_format: true,
    endpointing: 0,
    encoding: "linear16",
    sample_rate: 48000,
  });

  // Listen for the connection to open.
  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log(data, 101010100);
    connection.send(data);

    // Listen for any transcripts received from Deepgram and write them to the console.
    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      console.dir(data, { depth: null });
    });

    // Listen for any metadata received from Deepgram and write it to the console.
    connection.on(LiveTranscriptionEvents.Metadata, (data) => {
      console.dir(data, { depth: null });
    });

    // Listen for the connection to close.
    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("Connection closed.");
    });
  });
};
