import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import App from "../src/App";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { AudioContext } from "standardized-audio-context-mock";
import userEvent from "@testing-library/user-event";

let io;
const writeText = vi.fn();

Object.assign(navigator, {
  clipboard: {
    writeText,
  },
});

const waitForEvent = (socket, event) => {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
};

describe("Socket testing", () => {
  beforeAll(() => {
    navigator.clipboard.writeText.mockResolvedValue(undefined);
    global.AudioContext = AudioContext;
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);

      httpServer.listen(8080, () => {
        resolve();
      });
    });
  });

  const register = async () => {
    const serverSocket = await new Promise((resolve) => {
      io.on("connection", (socket) => {
        resolve(socket);
      });
      render(<App />);
    });
    return serverSocket;
  };

  const mimicStartRecording = async (serverSocket) => {
    setTimeout(async () => {
      act(() => {
        const recordButton = screen.getByTestId("record-button");
        fireEvent.click(recordButton);
      });
    }, 200);

    await waitForEvent(serverSocket, "configure-stream");
    serverSocket.emit("transcriber-ready");
  };

  it("socket connects", async () => {
    const serverSocket = await register();
    expect(serverSocket).not.toBeNull();
  });

  it("should configure the stream when the record button is clicked", async () => {
    const serverSocket = await register();

    setTimeout(async () => {
      act(() => {
        const recordButton = screen.getByTestId("record-button");
        fireEvent.click(recordButton);
      });
    }, 200);

    const { sampleRate } = await waitForEvent(serverSocket, "configure-stream");
    expect(typeof sampleRate).toBe("number");
  });

  it("should configure the stream only once when the record button is clicked twice", async () => {
    const serverSocket = await register();
    let configureStreamCount = 0;

    serverSocket.on("configure-stream", () => {
      configureStreamCount++;
    });

    act(() => {
      const recordButton = screen.getByTestId("record-button");
      fireEvent.click(recordButton);
    });

    setTimeout(() => {
      act(() => {
        const recordButton = screen.getByTestId("record-button");
        fireEvent.click(recordButton);
      });
    }, 100);

    await waitFor(() => expect(configureStreamCount).toBe(1), {
      timeout: 500,
    });

    expect(configureStreamCount).toBe(1);
  });

  it("should display the emitted text in the transcription display", async () => {
    const serverSocket = await register();

    const emittedText = "Testing";
    serverSocket.emit("final", emittedText);
    const inputTextArea = screen.getByTestId("transcription-display");
    await waitFor(() => expect(inputTextArea).toHaveTextContent(emittedText), {
      timeout: 500,
    });
  });

  it("should update the transcription display when receiving partial results", async () => {
    const serverSocket = await register();
    const partialText = "Partial transcription";
    serverSocket.emit("partial", partialText);

    const inputTextArea = screen.getByTestId("transcription-display");
    await waitFor(() => expect(inputTextArea).toHaveTextContent(partialText), {
      timeout: 500,
    });
  });

  it("should update the transcription display with the latest partial result", async () => {
    const serverSocket = await register();
    const partialText1 = "First partial";
    const partialText2 = "Second partial";
    serverSocket.emit("partial", partialText1);
    serverSocket.emit("partial", partialText2);

    const inputTextArea = screen.getByTestId("transcription-display");
    await waitFor(() => expect(inputTextArea).toHaveTextContent(partialText2), {
      timeout: 500,
    });

    expect(inputTextArea).not.toHaveTextContent(partialText1);
  });

  it("transcriber closed when recording is stopped", async () => {
    const serverSocket = await register();

    mimicStartRecording(serverSocket);

    setTimeout(async () => {
      act(() => {
        const recordButton = screen.getByTestId("record-button");
        fireEvent.click(recordButton);
      });
    }, 200);

    await waitForEvent(serverSocket, "stop-stream");
  });

  it("check transcription is copied to clipboard", async () => {
    render(<App />);

    const inputTextArea = screen.getByTestId("transcription-display");
    const text = "Injecting text";
    userEvent.type(inputTextArea, text);
    await waitFor(() => expect(inputTextArea).toHaveTextContent(text), {
      timeout: 500,
    });
    const copyButton = screen.getByTestId("copy-button");
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
  });

  it("should clear the transcription when the clear button is clicked", async () => {
    const serverSocket = await register();
    const emittedText = "Testing";
    serverSocket.emit("final", emittedText);
    const inputTextArea = screen.getByTestId("transcription-display");
    await waitFor(() => expect(inputTextArea).toHaveTextContent(emittedText), {
      timeout: 500,
    });

    const clearButton = screen.getByTestId("reset-button");
    fireEvent.click(clearButton);

    expect(inputTextArea).toHaveTextContent("");
  });

  it("should display interim results and replace with final results", async () => {
    const serverSocket = await register();
    const interimText = "Interim result";
    const finalText = "Final result";

    serverSocket.emit("partial", interimText);
    const inputTextArea = screen.getByTestId("transcription-display");
    await waitFor(() => expect(inputTextArea).toHaveTextContent(interimText), {
      timeout: 500,
    });

    serverSocket.emit("final", finalText);
    await waitFor(() => expect(inputTextArea).toHaveTextContent(finalText), {
      timeout: 500,
    });
  });

  it("should update the transcription when manually edited", async () => {
    const serverSocket = await register();
    const emittedText = "Testing";
    serverSocket.emit("final", emittedText);
    const inputTextArea = screen.getByTestId("transcription-display");
    await waitFor(() => expect(inputTextArea).toHaveTextContent(emittedText), {
      timeout: 500,
    });

    const editedText = "Edited transcription";
    userEvent.clear(inputTextArea);
    userEvent.type(inputTextArea, editedText);
    await waitFor(() => expect(inputTextArea).toHaveTextContent(editedText), {
      timeout: 500,
    });
  });

  it("should show copied state when copy button is clicked", async () => {
    render(<App />);
    const inputTextArea = screen.getByTestId("transcription-display");
    const text = "Injecting text";
    userEvent.type(inputTextArea, text);
    const copyButton = screen.getByTestId("copy-button");
    fireEvent.click(copyButton);

    expect(copyButton).toHaveTextContent("Copied");
  });

  it("should reset copied state when clear button is clicked", async () => {
    render(<App />);
    const inputTextArea = screen.getByTestId("transcription-display");
    const text = "Injecting text";
    userEvent.type(inputTextArea, text);
    const copyButton = screen.getByTestId("copy-button");
    fireEvent.click(copyButton);

    expect(copyButton).toHaveTextContent("Copied");

    const clearButton = screen.getByTestId("reset-button");
    fireEvent.click(clearButton);

    expect(copyButton).toHaveTextContent("Copy");
  });

  it("should not start recording when socket is not connected", async () => {
    render(<App />);
    const recordButton = screen.getByTestId("record-button");
    fireEvent.click(recordButton);

    expect(recordButton).not.toHaveTextContent("Stop");
  });
});
