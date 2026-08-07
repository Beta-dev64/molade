import type {
  ActivityItem,
  AppNotification,
  RankedTask,
  ReminderPrefs,
  Task,
} from "@/lib/molade/types";
import { api } from "./client";

export const tasksApi = {
  list: () => api<Task[]>("/api/tasks"),
  get: (id: string) => api<Task>(`/api/tasks/${id}`),
  create: (body: Omit<Task, "id" | "createdAt" | "completedAt" | "completedOnTime" | "snoozedUntil">) =>
    api<Task>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Task>) =>
    api<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  toggleComplete: (id: string) =>
    api<Task>(`/api/tasks/${id}/toggle-complete`, { method: "POST" }),
  remove: (id: string) =>
    api<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" }),
  snooze: (id: string, hours: number) =>
    api<Task>(`/api/tasks/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify({ hours }),
    }),
  unsnooze: (id: string) =>
    api<Task>(`/api/tasks/${id}/unsnooze`, { method: "POST" }),
};

export const notificationsApi = {
  list: () => api<AppNotification[]>("/api/notifications"),
  /** Creates a system notification and pushes it over Socket.IO. */
  ping: () =>
    api<AppNotification>("/api/notifications/ping", { method: "POST" }),
  markRead: (id: string) =>
    api<AppNotification>(`/api/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () =>
    api<{ ok: true }>("/api/notifications/read-all", { method: "POST" }),
  dismiss: (id: string) =>
    api<{ ok: true }>(`/api/notifications/${id}`, { method: "DELETE" }),
  snooze: (id: string, hours: number) =>
    api<AppNotification>(`/api/notifications/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify({ hours }),
    }),
  restore: (id: string) =>
    api<AppNotification>(`/api/notifications/${id}/restore`, { method: "POST" }),
};

export const activityApi = {
  list: () => api<ActivityItem[]>("/api/activity"),
};

export const prioritiesApi = {
  list: () => api<RankedTask[]>("/api/priorities"),
  recalculate: () =>
    api<RankedTask[]>("/api/priorities/recalculate", { method: "POST" }),
};

export const usersApi = {
  updateProfile: (body: { name?: string; email?: string; programme?: string }) =>
    api<{ id: string; name: string; email: string; programme: string }>(
      "/api/users/me",
      { method: "PATCH", body: JSON.stringify(body) },
    ),
  updatePassword: (currentPassword: string, newPassword: string) =>
    api<{ ok: true }>("/api/users/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  updatePrefs: (body: Partial<ReminderPrefs>) =>
    api<ReminderPrefs>("/api/users/me/prefs", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  exportData: () => api<unknown>("/api/users/me/export"),
  deleteAccount: () =>
    api<{ ok: true }>("/api/users/me", { method: "DELETE" }),
};

export interface AnalyticsSummary {
  totals: { open: number; completed: number; overdue: number };
  onTimeSplit: { name: string; value: number }[];
  completionTrend: { label: string; completed: number }[];
  workloadByModule: { name: string; value: number }[];
  completionRate: number;
}

export const analyticsApi = {
  summary: () => api<AnalyticsSummary>("/api/analytics/summary"),
};
