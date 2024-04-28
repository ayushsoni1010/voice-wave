import Transcriber, { live } from "./transcriber.js";

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
    socket.emit("welcome", "Welcome to the server!");
    // console.log(`connection made (${socket.id})`);

    socket.on("configure-stream", (data) => {
      console.log(`configure-stream: ${JSON.stringify(data, null, 2)}`);

      transcriber.initializeStream(data);
    });

    socket.on("incoming-audio", async (audioData) => {
      console.log(`incoming audio`);
      // live(audioData);
      console.log(audioData);

      await transcriber.startTranscriptionStream();
      await transcriber.send(audioData);
    });

    socket.on("stop-stream", async (stream) => {
      console.log(`stop streamming: ${stream}`);
      await transcriber.endTranscriptionStream();
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id} `);
    });

    // socket.emit("transcriber-ready", "sample");
    socket.emit("final", "sample");
    socket.emit("partial", "sample");
    socket.emit("error", "Connection error!");
  });

  io.on("connect_error", (err) => {
    console.log(`Connection error: ${err}`);
  });

  return io;
};

export default initializeWebSocket;
