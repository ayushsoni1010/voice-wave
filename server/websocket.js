import Transcriber from "./transcriber.js";

/**
 * Events to subscribe to:
 * - connection: Triggered when a client connects to the server.
 * - configure-stream: Requires an object with a 'sampleRate' property.
 * - incoming-audio: Requires audio data as the parameter.
 * - stop-stream: Triggered when the client requests to stop the transcription stream.
 * - disconnect: Triggered when a client disconnects from the server.
 *
 *
 * Events to emit:
 * - transcriber-ready: Emitted when the transcriber is ready.
 * - final: Emits the final transcription result (string).
 * - partial: Emits the partial transcription result (string).
 * - error: Emitted when an error occurs.
 */

const initializeWebSocket = (io) => {
  const transcriber = new Transcriber();

  io.on("connection", (socket) => {
    console.log(`connection made (${socket.id})`);

    socket.on("configure-stream", ({ sampleRate }) => {
      console.log(`configure-stream: ${sampleRate}`);

      transcriber.startTranscriptionStream(sampleRate);
    });

    socket.on("incoming-audio", (audioData) => {
      console.log(`incoming audio: ${audioData}`);

      transcriber.send(audioData);
    });

    socket.on("stop-stream", (stream) => {
      console.log(`stop streamming: ${stream}`);
      transcriber.endTranscriptionStream();
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id} `);
    });

    // Firstly emitting transcriber ready event
    socket.emit("transcriber-ready", () => {
      console.log("Transcriber ready");
    });

    socket.emit("sample", () => {
      console.log("Sample");
    });

    //
    socket.emit("final", () => {
      console.log("Transcriber final");
    });

    //
    socket.emit("partial", () => {
      console.log("Transcriber partial");
    });

    //
    socket.emit("error", (err) => {
      console.log(`error: ${err}`);
    });
  });

  io.on("connection_error", (err) => {
    console.log(`Connection error: ${err}`);
  });

  return io;
};

export default initializeWebSocket;
