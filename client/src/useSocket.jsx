import io from "socket.io-client";

const serverURL = "http://localhost:8080";

const subscriptions = ["final", "partial", "transcriber-ready", "error"];

// feel free to pass in any props
const useSocket = () => {
  // ... free to add any state or variables
  const initialize = () => {};

  const disconnect = () => {};

  // ... free to add more functions
  return { initialize, disconnect };
};

export default useSocket;
