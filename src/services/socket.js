import { io } from "socket.io-client";

useEffect(() => {
  const socket = io("http://192.168.1.9:7000", {
    transports: ["websocket"],
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("✅ SOCKET CONNECTED", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ CONNECT ERROR:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ DISCONNECTED:", reason);
  });

  socket.onAny((event, ...args) => {
    console.log("🔥 EVENT:", event, args);
  });

  return () => {
    socket.disconnect();
  };
}, []);