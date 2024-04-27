import { useEffect } from "react";
import io from "socket.io-client";

const serverURL = "http://localhost:8080";

const subscriptions = ["final", "partial", "transcriber-ready", "error"];

// feel free to pass in any props
const useSocket = () => {
  let socket;
  // ... free to add any state or variables
  const initialize = () => {
    socket = io(serverURL);

    socket.on("connect", () => {
      console.log("Connected");
    });
  };

  const onError = () => {
    socket.emit("error", (error) => {
      console.log("Error: " + error);
    });
  };

  const handleStartTransription = () => {
    subscriptions.forEach((subscription) => {
      socket.on(subscription, (data) => {
        console.log(`Received: ${subscription} ---> ${data}`);
      });
    });
  };

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  // ... free to add more functions
  return { initialize, onError, handleStartTransription };
};

export default useSocket;
