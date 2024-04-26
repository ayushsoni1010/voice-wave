import io from "socket.io-client";
import initializeWebSocket from "../websocket.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import Transcriber from "../transcriber.js";
import wav from "wav";
import fs from "fs";
import "dotenv/config";

const sleep = (timeMS) => new Promise((resolve) => setTimeout(resolve, timeMS));

describe("Server", () => {
  let clientSocket;
  let s;

  beforeAll((done) => {
    const httpServer = createServer();
    s = new Server(httpServer);
    initializeWebSocket(s);
    httpServer.listen(8080, done);
  });

  beforeEach((done) => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    clientSocket = io(`http://localhost:8080`);
    clientSocket.on("connect", done);
  });

  afterAll((done) => {
    clientSocket?.disconnect();
    s.close(() => {
      done();
    });
  });

  afterEach(() => {
    clientSocket?.disconnect();
  });

  it("establishes WebSocket connection", async () => {
    expect(clientSocket.connected).toBe(true);
  });

  it("transcriber can be invoked", (done) => {
    clientSocket.on("transcriber-ready", () => done());
    clientSocket.emit("configure-stream", { sampleRate: 24000 });
  });

  it("test final transcript is sent", (done) => {
    clientSocket.on("final", (data) => {
      expect(data).toBeDefined();
      done();
    });

    const wavFile = "./tests/sample.wav";
    const wavReader = new wav.Reader();
    clientSocket.on("transcriber-ready", () => {
      fs.createReadStream(wavFile).pipe(wavReader);
      wavReader.on("data", (data) => {
        clientSocket.emit("incoming-audio", data);
      });
    });

    clientSocket.emit("configure-stream", { sampleRate: 8000 });
  });

  it("data is passed through", (done) => {
    const sendMock = jest.spyOn(Transcriber.prototype, "send");
    clientSocket.on("transcriber-ready", async () => {
      const audioData = new Float32Array([0.1, 0.2, 0.3]);
      clientSocket.emit("incoming-audio", audioData);

      await sleep(200);
      expect(sendMock).toHaveBeenCalled();
      done();
    });
    clientSocket.emit("configure-stream", { sampleRate: 16000 });
  });

  it("test partial transcript is sent", (done) => {
    clientSocket.on("partial", (data) => {
      expect(data).toBeDefined();
      done();
    });

    const wavFile = "./tests/sample.wav";
    const wavReader = new wav.Reader();
    clientSocket.on("transcriber-ready", () => {
      fs.createReadStream(wavFile).pipe(wavReader);
      wavReader.on("data", (data) => {
        clientSocket.emit("incoming-audio", data);
      });
    });

    clientSocket.emit("configure-stream", { sampleRate: 8000 });
  });

  it("should end the transcription stream when 'stop-stream' event is received", async () => {
    const endTranscriptionStreamMock = jest.spyOn(
      Transcriber.prototype,
      "endTranscriptionStream"
    );
    clientSocket.emit("stop-stream");

    await sleep(200);
    expect(endTranscriptionStreamMock).toHaveBeenCalled();
  });

  it("should end the transcription stream when client disconnects", async () => {
    const endTranscriptionStreamMock = jest.spyOn(
      Transcriber.prototype,
      "endTranscriptionStream"
    );
    clientSocket.disconnect();
    await sleep(200);
    expect(endTranscriptionStreamMock).toHaveBeenCalled();
  });

  it("test transcriber not invoked from invalid input", async () => {
    const startMock = jest.spyOn(
      Transcriber.prototype,
      "startTranscriptionStream"
    );

    clientSocket.emit("configure-stream", "");
    await sleep(200);
    expect(startMock).not.toHaveBeenCalled();
  });

  it("test error sent from invalid input", (done) => {
    clientSocket.on("error", () => {
      done();
    });

    clientSocket.emit("configure-stream", "");
  });
});
