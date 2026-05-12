import { io } from "socket.io-client";

const socket = io("http://192.168.1.6:7000", {
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
  timeout: 20000,
});

socket.on("connect", () => {
  console.log("🟢 [Global Socket] Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 [Global Socket] Error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.warn("🟠 [Global Socket] Disconnected:", reason);
});

export default socket;
