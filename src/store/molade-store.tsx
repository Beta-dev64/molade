import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type {
  ActivityItem,
  AppNotification,
  MoladeUser,
  RankedTask,
  ReminderPrefs,
  Task,
} from "@/lib/molade/types";
import { rankAll } from "@/lib/molade/priority";
import { ApiError } from "@/lib/api/client";
import { fetchMe, logout as apiLogout } from "@/lib/api/auth";
import {
  activityApi,
  notificationsApi,
  prioritiesApi,
  tasksApi,
  usersApi,
} from "@/lib/api/resources";
import { getAccessToken } from "@/lib/api/token";
import {
  connectSocket,
  disconnectSocket,
  ensureBrowserNotifyPermission,
  maybeBrowserNotify,
} from "@/lib/socket";

export type { ReminderPrefs };

interface MoladeState {
  ready: boolean;
  socketConnected: boolean;
  tasks: Task[];
  ranked: RankedTask[];
  notifications: AppNotification[];
  activity: ActivityItem[];
  prefs: ReminderPrefs;
  recalcKey: number;
  recalculating: boolean;
  user: MoladeUser;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setPrefs: (p: Partial<ReminderPrefs>) => Promise<void>;
  setUser: (u: Partial<MoladeUser>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addTask: (t: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  recalculate: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  snoozeNotification: (id: string, hours: number) => Promise<void>;
  restoreNotification: (id: string) => Promise<void>;
  snoozeTask: (id: string, hours: number) => Promise<void>;
  unsnoozeTask: (id: string) => Promise<void>;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  tourSeen: boolean;
  setTourSeen: (v: boolean) => void;
}

const TOUR_KEY = "molade.tour.seen";
const MOTION_KEY = "molade.reducedMotion";

const DEFAULT_PREFS: ReminderPrefs = {
  email: true,
  push: false,
  lead: "24h",
  priorityChanges: true,
  weeklyDigest: true,
};

const Ctx = createContext<MoladeState | null>(null);

function errMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export function MoladeProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => Date.now());
  const [ready, setReady] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [recalcKey, setRecalcKey] = useState(0);
  const [recalculating, setRecalculating] = useState(false);
  const [prefs, setPrefsState] = useState<ReminderPrefs>(DEFAULT_PREFS);
  const [user, setUserState] = useState<MoladeUser>({
    name: "",
    email: "",
    programme: "",
  });
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [tourSeen, setTourSeenState] = useState(true);

  useEffect(() => {
    try {
      setTourSeenState(window.localStorage.getItem(TOUR_KEY) === "1");
      setReducedMotionState(
        window.localStorage.getItem(MOTION_KEY) === "1" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  const setReducedMotion = useCallback((v: boolean) => {
    setReducedMotionState(v);
    try {
      window.localStorage.setItem(MOTION_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const setTourSeen = useCallback((v: boolean) => {
    setTourSeenState(v);
    try {
      window.localStorage.setItem(TOUR_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setReady(true);
      return;
    }
    const [me, taskList, notifList, activityList] = await Promise.all([
      fetchMe(),
      tasksApi.list(),
      notificationsApi.list(),
      activityApi.list(),
    ]);
    setUserState({
      name: me.user.name,
      email: me.user.email,
      programme: me.user.programme,
    });
    setPrefsState(me.prefs);
    setTasks(taskList);
    setNotifications(notifList);
    setActivity(activityList);
    setNow(Date.now());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh().catch((err) => {
      console.error(err);
      setReady(true);
      toast.error("Couldn't load your workspace", {
        description: errMessage(err, "Check that the API is running."),
      });
    });
  }, [refresh]);

  // Live notifications via Socket.IO (JWT auth)
  useEffect(() => {
    if (!ready || !getAccessToken()) {
      disconnectSocket();
      setSocketConnected(false);
      return;
    }

    void ensureBrowserNotifyPermission(prefs.push);

    const sock = connectSocket({
      onStatus: setSocketConnected,
      onNew: (n) => {
        setNotifications((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
        toast.message(n.title, { description: n.body });
        maybeBrowserNotify(n, prefs.push);
      },
      onUpdated: (n) => {
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? n : x)));
      },
      onRemoved: (id) => {
        setNotifications((prev) => prev.filter((x) => x.id !== id));
      },
      onSync: () => {
        notificationsApi.list().then(setNotifications).catch(() => undefined);
      },
    });

    setSocketConnected(Boolean(sock?.connected));

    return () => {
      disconnectSocket();
      setSocketConnected(false);
    };
    // Reconnect when auth/ready changes; prefs.push only affects browser notify
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user.email]);

  const ranked = useMemo(
    () => rankAll(tasks, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, now, recalcKey],
  );

  const logout = useCallback(async () => {
    disconnectSocket();
    setSocketConnected(false);
    await apiLogout();
    setTasks([]);
    setNotifications([]);
    setActivity([]);
    setUserState({ name: "", email: "", programme: "" });
  }, []);

  const setPrefs = useCallback(async (p: Partial<ReminderPrefs>) => {
    const next = await usersApi.updatePrefs(p);
    setPrefsState(next);
    if (next.push) void ensureBrowserNotifyPermission(true);
    toast.success("Preferences updated");
  }, []);

  const setUser = useCallback(async (u: Partial<MoladeUser>) => {
    const updated = await usersApi.updateProfile(u);
    setUserState({
      name: updated.name,
      email: updated.email,
      programme: updated.programme,
    });
    toast.success("Profile updated");
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await usersApi.updatePassword(currentPassword, newPassword);
    toast.success("Password updated");
  }, []);

  const addTask = useCallback<MoladeState["addTask"]>(async (t) => {
    const task = await tasksApi.create({
      title: t.title,
      description: t.description,
      course: t.course,
      courseCode: t.courseCode,
      deadline: t.deadline,
      effort: t.effort,
      status: t.status,
      personalPreference: t.personalPreference,
    });
    setTasks((prev) => [task, ...prev]);
    setActivity((prev) => [
      {
        id: `a-${Date.now()}`,
        kind: "created",
        text: `Added ${task.title}`,
        at: new Date().toISOString(),
      },
      ...prev,
    ]);
    toast.success("Task created", {
      description: `${task.title} has been ranked automatically.`,
    });
  }, []);

  const updateTask = useCallback<MoladeState["updateTask"]>(async (id, patch) => {
    const task = await tasksApi.update(id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    toast.success("Task updated");
  }, []);

  const toggleComplete = useCallback<MoladeState["toggleComplete"]>(async (id) => {
    const before = tasks.find((t) => t.id === id);
    const task = await tasksApi.toggleComplete(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    const done = task.status === "completed";
    toast.success(done ? "Nice — one down." : "Task reopened", {
      description: done && before ? `${before.title} marked complete.` : undefined,
    });
    activityApi.list().then(setActivity).catch(() => undefined);
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.remove(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  }, []);

  const snoozeTask = useCallback(async (id: string, hours: number) => {
    const task = await tasksApi.snooze(id, hours);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    toast.success(`Snoozed for ${hours}h`, {
      description: `${task.title} drops down the ranking until then.`,
    });
  }, []);

  const unsnoozeTask = useCallback(async (id: string) => {
    const task = await tasksApi.unsnooze(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    toast.success("Back in the ranking");
  }, []);

  const recalculate = useCallback(async () => {
    setRecalculating(true);
    try {
      await prioritiesApi.recalculate();
      const next = await tasksApi.list();
      setTasks(next);
      setNow(Date.now());
      setRecalcKey((k) => k + 1);
      toast.success("Priorities recalculated", {
        description: "Ranking refreshed from deadlines, workload and status.",
      });
    } finally {
      setRecalculating(false);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    const n = await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((x) => (x.id === id ? n : x)));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback(async (id: string) => {
    const n = notifications.find((x) => x.id === id);
    await notificationsApi.dismiss(id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    toast.success("Reminder dismissed", { description: n?.title });
  }, [notifications]);

  const snoozeNotification = useCallback(
    async (id: string, hours: number) => {
      const n = await notificationsApi.snooze(id, hours);
      setNotifications((prev) => prev.map((x) => (x.id === id ? n : x)));
      const tasksNext = await tasksApi.list();
      setTasks(tasksNext);
      toast.success(`Snoozed for ${hours}h`);
    },
    [],
  );

  const restoreNotification = useCallback(async (id: string) => {
    const n = await notificationsApi.restore(id);
    setNotifications((prev) => prev.map((x) => (x.id === id ? n : x)));
    const tasksNext = await tasksApi.list();
    setTasks(tasksNext);
  }, []);

  const value: MoladeState = {
    ready,
    socketConnected,
    tasks,
    ranked,
    notifications,
    activity,
    prefs,
    recalcKey,
    recalculating,
    user,
    refresh,
    logout,
    setPrefs,
    setUser,
    changePassword,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    recalculate,
    markNotificationRead,
    markAllRead,
    dismissNotification,
    snoozeNotification,
    restoreNotification,
    snoozeTask,
    unsnoozeTask,
    reducedMotion,
    setReducedMotion,
    tourSeen,
    setTourSeen,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMolade() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMolade must be used inside MoladeProvider");
  return ctx;
}

/** Stable "now" for relative time rendering within the app shell. */
export function useNow() {
  const [now] = useState(() => Date.now());
  return now;
}
