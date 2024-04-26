import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll } from "vitest";
import App from "../src/App";
import { AudioContext } from "standardized-audio-context-mock";

describe("App", () => {
  beforeAll(() => {
    global.AudioContext = AudioContext;
  });

  it("required elements are present", () => {
    render(<App />);
    const recordButton = screen.getByTestId("record-button");
    expect(recordButton).toBeInTheDocument();
    const inputTextArea = screen.getByTestId("transcription-display");
    expect(inputTextArea).toBeInTheDocument();
    const copyButton = screen.getByTestId("copy-button");
    expect(copyButton).toBeInTheDocument();
    const resetButton = screen.getByTestId("reset-button");
    expect(resetButton).toBeInTheDocument();
  });
});
