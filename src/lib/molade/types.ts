export type TaskStatus = "not_started" | "in_progress" | "blocked" | "completed";
export type Effort = "S" | "M" | "L";
export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  description: string;
  course: string;
  courseCode: string;
  /** ISO string */
  deadline: string;
  effort: Effort;
  status: TaskStatus;
  personalPreference: "none" | "low" | "normal" | "high";
  createdAt: string;
  completedAt?: string;
  completedOnTime?: boolean;
  /** ISO string — while in the future the task is de-prioritised. */
  snoozedUntil?: string;
}


export interface PriorityReason {
  label: string;
  detail: string;
  weight: number;
  kind: "deadline" | "effort" | "status" | "risk" | "preference";
}

export interface RankedTask {
  task: Task;
  score: number;
  level: PriorityLevel;
  reasons: PriorityReason[];
  hoursLeft: number;
  summary: string;
}

export interface AppNotification {
  id: string;
  type: "deadline" | "priority" | "overdue" | "system";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Task this reminder refers to, when applicable. */
  taskId?: string;
  /** ISO string — reminder is hidden from the active list until then. */
  snoozedUntil?: string;
}


export interface ActivityItem {
  id: string;
  text: string;
  at: string;
  kind: "completed" | "created" | "updated" | "reminder";
}
