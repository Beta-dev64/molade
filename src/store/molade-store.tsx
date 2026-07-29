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
import type { ActivityItem, AppNotification, RankedTask, Task } from "@/lib/molade/types";
import { rankAll } from "@/lib/molade/priority";
import { seedActivity, seedNotifications, seedTasks } from "@/lib/molade/mock-data";

export interface ReminderPrefs {
  email: boolean;
  push: boolean;
  lead: "24h" | "12h" | "3h";
  priorityChanges: boolean;
  weeklyDigest: boolean;
}

interface MoladeState {
  tasks: Task[];
  ranked: RankedTask[];
  notifications: AppNotification[];
  activity: ActivityItem[];
  prefs: ReminderPrefs;
  recalcKey: number;
  recalculating: boolean;
  user: { name: string; email: string; programme: string };
  setPrefs: (p: Partial<ReminderPrefs>) => void;
  setUser: (u: Partial<MoladeState["user"]>) => void;
  addTask: (t: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  recalculate: () => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
  snoozeNotification: (id: string, hours: number) => void;
  restoreNotification: (id: string) => void;
  snoozeTask: (id: string, hours: number) => void;
  unsnoozeTask: (id: string) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  tourSeen: boolean;
  setTourSeen: (v: boolean) => void;
}

const TOUR_KEY = "molade.tour.seen";
const MOTION_KEY = "molade.reducedMotion";

const Ctx = createContext<MoladeState | null>(null);

export function MoladeProvider({ children }: { children: ReactNode }) {
  const [now] = useState(() => Date.now());
  const [tasks, setTasks] = useState<Task[]>(() => seedTasks(now));
  const [notifications, setNotifications] = useState(() => seedNotifications(now));
  const [activity, setActivity] = useState(() => seedActivity(now));
  const [recalcKey, setRecalcKey] = useState(0);
  const [recalculating, setRecalculating] = useState(false);
  const [prefs, setPrefsState] = useState<ReminderPrefs>({
    email: true,
    push: false,
    lead: "24h",
    priorityChanges: true,
    weeklyDigest: true,
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

  const [user, setUserState] = useState({
    name: "Adeola Molade",
    email: "a.molade@ulster.ac.uk",
    programme: "MSc Computing & Information Systems",
  });

  const ranked = useMemo(
    () => rankAll(tasks, now),
    // recalcKey intentionally re-triggers the visible reorder animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, now, recalcKey],
  );

  const logActivity = useCallback((kind: ActivityItem["kind"], text: string) => {
    setActivity((prev) => [
      { id: `a-${Math.random().toString(36).slice(2, 9)}`, kind, text, at: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const addTask = useCallback<MoladeState["addTask"]>(
    (t) => {
      const task: Task = { ...t, id: `t-${Math.random().toString(36).slice(2, 9)}`, createdAt: new Date().toISOString() };
      setTasks((prev) => [task, ...prev]);
      logActivity("created", `Added ${task.title}`);
      toast.success("Task created", { description: `${task.title} has been ranked automatically.` });
    },
    [logActivity],
  );

  const updateTask = useCallback<MoladeState["updateTask"]>(
    (id, patch) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      logActivity("updated", `Updated task details`);
      toast.success("Task updated");
    },
    [logActivity],
  );

  const toggleComplete = useCallback<MoladeState["toggleComplete"]>(
    (id) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const done = t.status !== "completed";
          return {
            ...t,
            status: done ? "completed" : "in_progress",
            completedAt: done ? new Date().toISOString() : undefined,
            completedOnTime: done ? new Date(t.deadline).getTime() > Date.now() : undefined,
          };
        }),
      );
      const t = tasks.find((x) => x.id === id);
      if (t) {
        const done = t.status !== "completed";
        logActivity(done ? "completed" : "updated", `${done ? "Completed" : "Reopened"} ${t.title}`);
        toast.success(done ? "Nice — one down." : "Task reopened", {
          description: done ? `${t.title} marked complete.` : undefined,
        });
      }
    },
    [tasks, logActivity],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  }, []);

  const snoozeTask = useCallback(
    (id: string, hours: number) => {
      const until = new Date(Date.now() + hours * 36e5).toISOString();
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, snoozedUntil: until } : t)));
      const t = tasks.find((x) => x.id === id);
      logActivity("reminder", `Snoozed ${t?.title ?? "task"} for ${hours}h`);
      toast.success(`Snoozed for ${hours}h`, {
        description: t ? `${t.title} drops down the ranking until then.` : undefined,
      });
    },
    [tasks, logActivity],
  );

  const unsnoozeTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, snoozedUntil: undefined } : t)));
    toast.success("Back in the ranking");
  }, []);

  const recalculate = useCallback(() => {
    setRecalculating(true);
    window.setTimeout(() => {
      setRecalcKey((k) => k + 1);
      setRecalculating(false);
      toast.success("Priorities recalculated", {
        description: "Ranking refreshed from deadlines, workload and status.",
      });
    }, 650);
  }, []);

  const value: MoladeState = {
    tasks,
    ranked,
    notifications,
    activity,
    prefs,
    recalcKey,
    recalculating,
    user,
    setPrefs: (p) => setPrefsState((prev) => ({ ...prev, ...p })),
    setUser: (u) => setUserState((prev) => ({ ...prev, ...u })),
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    recalculate,
    markNotificationRead: (id) =>
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    dismissNotification: (id) => {
      const n = notifications.find((x) => x.id === id);
      setNotifications((prev) => prev.filter((x) => x.id !== id));
      toast.success("Reminder dismissed", { description: n?.title });
    },
    snoozeNotification: (id, hours) => {
      const until = new Date(Date.now() + hours * 36e5).toISOString();
      const n = notifications.find((x) => x.id === id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === id ? { ...x, snoozedUntil: until, read: true } : x)),
      );
      if (n?.taskId) snoozeTask(n.taskId, hours);
      else
        toast.success(`Snoozed for ${hours}h`, {
          description: "It will come back when it is worth your attention.",
        });
    },
    restoreNotification: (id) => {
      const n = notifications.find((x) => x.id === id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === id ? { ...x, snoozedUntil: undefined, read: false } : x)),
      );
      if (n?.taskId) unsnoozeTask(n.taskId);
    },
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
