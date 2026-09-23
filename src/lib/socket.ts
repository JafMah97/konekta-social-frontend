import { io, type Socket } from "socket.io-client";

// Connects through this origin's /api proxy so the session cookie is sent
// like on any other request. Long-polling only: serverless proxies can't
// upgrade to WebSocket, and a few requests a minute is plenty for
// notifications.
export function connectSocket(): Socket {
  return io({
    path: "/api/socket.io",
    transports: ["polling"],
    withCredentials: true,
    reconnectionDelayMax: 30_000,
  });
}
