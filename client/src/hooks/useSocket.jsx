import { useState } from "react";
import io from "socket.io-client";

const serverURL = "http://localhost:8080";

const subscriptions = ["final", "partial", "transcriber-ready", "error"];

const useSocket = () => {
  const [socket, setSocket] = useState(null);

  const initialize = () => {
    const _socket = io(serverURL);
    setSocket(_socket);

    _socket.on("connect", () => {
      console.log("Connected");
    });

    _socket.on("welcome", (data) => {
      console.log(data);
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    } else {
      console.log("Socket is not connected yet.");
    }
  };

  const onError = () => {
    if (socket) {
      socket.on("error", (error) => {
        console.log(`Error: ${error}`);
      });
      setSocket(null);
    } else {
      console.log("Socket is not initialized yet.");
    }
  };

  const initializeStream = ({ sampleRate }) => {
    if (socket) {
      socket.emit("configure-stream", { sampleRate });
    } else {
      console.log("Deep configure-stream is not initialized");
    }
  };

  const sendStreamedAudio = (data) => {
    if (socket) {
      socket.emit("incoming-audio", data);
    }
  };

  // const handleStartTransription = () => {
  //   subscriptions.forEach((subscription) => {
  //     socket.on(subscription, (data) => {
  //       console.log(`Received: ${subscription} ---> ${data}`);
  //     });
  //   });
  // };

  return {
    socket,
    initialize,
    disconnect,
    onError,
    initializeStream,
    sendStreamedAudio,
  };
};

export default useSocket;
