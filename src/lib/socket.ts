import { io, type Socket } from "socket.io-client";
import type { AppNotification } from "@/lib/molade/types";
import { getAccessToken } from "@/lib/api/token";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:4000";

export const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_UPDATED: "notification:updated",
  NOTIFICATION_REMOVED: "notification:removed",
  NOTIFICATIONS_SYNC: "notifications:sync",
} as const;

export type SocketHandlers = {
  onNew?: (n: AppNotification) => void;
  onUpdated?: (n: AppNotification) => void;
  onRemoved?: (id: string) => void;
  onSync?: () => void;
  onStatus?: (connected: boolean) => void;
};

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(handlers: SocketHandlers = {}): Socket | null {
  const token = getAccessToken();
  if (!token || typeof window === "undefined") return null;

  if (socket?.connected) {
    bindHandlers(socket, handlers);
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(API_URL, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: { token },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });

  bindHandlers(socket, handlers);
  return socket;
}

function bindHandlers(s: Socket, handlers: SocketHandlers) {
  s.off(SOCKET_EVENTS.NOTIFICATION_NEW);
  s.off(SOCKET_EVENTS.NOTIFICATION_UPDATED);
  s.off(SOCKET_EVENTS.NOTIFICATION_REMOVED);
  s.off(SOCKET_EVENTS.NOTIFICATIONS_SYNC);
  s.off("connect");
  s.off("disconnect");

  s.on("connect", () => handlers.onStatus?.(true));
  s.on("disconnect", () => handlers.onStatus?.(false));

  s.on(SOCKET_EVENTS.NOTIFICATION_NEW, (n: AppNotification) => handlers.onNew?.(n));
  s.on(SOCKET_EVENTS.NOTIFICATION_UPDATED, (n: AppNotification) => handlers.onUpdated?.(n));
  s.on(SOCKET_EVENTS.NOTIFICATION_REMOVED, (payload: { id: string }) =>
    handlers.onRemoved?.(payload.id),
  );
  s.on(SOCKET_EVENTS.NOTIFICATIONS_SYNC, () => handlers.onSync?.());
}

export function disconnectSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

/** Optional OS / browser notification when prefs.push is enabled. */
export function maybeBrowserNotify(n: AppNotification, pushEnabled: boolean) {
  if (!pushEnabled || typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(n.title, { body: n.body, tag: n.id });
  } catch {
    /* ignore */
  }
}

export async function ensureBrowserNotifyPermission(pushEnabled: boolean) {
  if (!pushEnabled || typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      /* ignore */
    }
  }
}
