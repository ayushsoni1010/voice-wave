import { useState, useEffect } from "react";
import io from "socket.io-client";

const serverURL = "http://localhost:8080";

const subscriptions = ["final", "partial", "transcriber-ready", "error"];

// feel free to pass in any props
const useSocket = () => {
  const [socket, setSocket] = useState(null);
  // ... free to add any state or variables
  const initialize = () => {
    const _socket = io(serverURL);
    setSocket(_socket);

    _socket.on("connect", () => {
      console.log("Connected");
    });

    subscriptions.forEach((subscription) => {
      _socket.on(subscription, (data) => {
        console.log(`Received: ${subscription} ---> ${data}`);
      });
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.emit("disconnect");
    }
  };

  const onError = () => {
    socket.emit("error", (error) => {
      console.log("Error: " + error);
    });
  };

  // Unmount the socket connection
  useEffect(() => {
    return () => {
      disconnect();
    };
  });

  // ... free to add more functions
  return { initialize, disconnect, onError };
};

export default useSocket;
