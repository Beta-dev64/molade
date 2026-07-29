import type { ActivityItem, AppNotification, Task } from "./types";

const H = 36e5;

interface Seed {
  title: string;
  description: string;
  course: string;
  courseCode: string;
  /** hours from now */
  due: number;
  effort: Task["effort"];
  status: Task["status"];
  pref?: Task["personalPreference"];
  createdDaysAgo: number;
  onTime?: boolean;
}

const SEEDS: Seed[] = [
  {
    title: "Dissertation Draft — Chapter 3",
    description:
      "Complete the methodology chapter: research design, sampling strategy, and ethics justification. Supervisor wants the evaluation framework fully argued.",
    course: "MSc Dissertation",
    courseCode: "COM814",
    due: 17,
    effort: "L",
    status: "in_progress",
    pref: "high",
    createdDaysAgo: 21,
  },
  {
    title: "HCI Usability Report",
    description:
      "Write up the heuristic evaluation and think-aloud sessions. Include severity ratings and annotated screenshots of the redesign.",
    course: "Human–Computer Interaction",
    courseCode: "COM723",
    due: 40,
    effort: "M",
    status: "not_started",
    createdDaysAgo: 9,
  },
  {
    title: "Database Coursework Submission",
    description:
      "Normalise the schema to 3NF, submit the ERD, and include the indexed query performance comparison.",
    course: "Advanced Databases",
    courseCode: "COM701",
    due: -9,
    effort: "M",
    status: "in_progress",
    createdDaysAgo: 14,
  },
  {
    title: "Exam Revision: Algorithms",
    description:
      "Two passes over graph algorithms and dynamic programming. Redo the 2023 past paper under timed conditions.",
    course: "Algorithms & Complexity",
    courseCode: "COM668",
    due: 96,
    effort: "L",
    status: "not_started",
    createdDaysAgo: 6,
  },
  {
    title: "Group Project Meeting Notes",
    description:
      "Circulate the sprint notes, action owners, and the updated risk register to the team channel.",
    course: "Software Engineering Practice",
    courseCode: "COM735",
    due: 6,
    effort: "S",
    status: "not_started",
    createdDaysAgo: 1,
  },
  {
    title: "Visa Document Upload",
    description:
      "Upload the updated CAS letter and bank statement to the student portal before the compliance check.",
    course: "Personal",
    courseCode: "LIFE",
    due: 52,
    effort: "S",
    status: "blocked",
    pref: "high",
    createdDaysAgo: 4,
  },
  {
    title: "Research Ethics Form",
    description: "Submit the low-risk ethics application with participant information sheet.",
    course: "MSc Dissertation",
    courseCode: "COM814",
    due: 190,
    effort: "S",
    status: "not_started",
    createdDaysAgo: 3,
  },
  {
    title: "Machine Learning Lab 4",
    description: "Implement and evaluate the gradient boosting baseline against the SVM benchmark.",
    course: "Machine Learning",
    courseCode: "COM748",
    due: 130,
    effort: "M",
    status: "in_progress",
    createdDaysAgo: 8,
  },
  {
    title: "Literature Review Summary Table",
    description: "Consolidate 24 sources into the comparison matrix with methodology columns.",
    course: "MSc Dissertation",
    courseCode: "COM814",
    due: -60,
    effort: "M",
    status: "completed",
    createdDaysAgo: 18,
    onTime: true,
  },
  {
    title: "HCI Prototype Walkthrough",
    description: "Record the five-minute Figma walkthrough for the seminar submission.",
    course: "Human–Computer Interaction",
    courseCode: "COM723",
    due: -110,
    effort: "S",
    status: "completed",
    createdDaysAgo: 16,
    onTime: false,
  },
  {
    title: "Seminar Reading: Distributed Systems",
    description: "Read the two assigned papers and post a discussion question.",
    course: "Distributed Systems",
    courseCode: "COM712",
    due: -30,
    effort: "S",
    status: "completed",
    createdDaysAgo: 11,
    onTime: true,
  },
  {
    title: "Statistics Problem Set 2",
    description: "Bayesian inference exercises 1–9 with worked derivations.",
    course: "Research Methods",
    courseCode: "COM702",
    due: -150,
    effort: "M",
    status: "completed",
    createdDaysAgo: 20,
    onTime: true,
  },
];

export function seedTasks(now: number): Task[] {
  return SEEDS.map((s, i) => ({
    id: `t-${i + 1}`,
    title: s.title,
    description: s.description,
    course: s.course,
    courseCode: s.courseCode,
    deadline: new Date(now + s.due * H).toISOString(),
    effort: s.effort,
    status: s.status,
    personalPreference: s.pref ?? "normal",
    createdAt: new Date(now - s.createdDaysAgo * 24 * H).toISOString(),
    completedAt:
      s.status === "completed" ? new Date(now + (s.due + 2) * H).toISOString() : undefined,
    completedOnTime: s.status === "completed" ? s.onTime : undefined,
  }));
}

export function seedNotifications(now: number): AppNotification[] {
  return [
    {
      id: "n-1",
      type: "overdue",
      title: "Database Coursework is overdue",
      body: "COM701 passed its deadline 9 hours ago. It has moved to the top of your priorities.",
      taskId: "t-3",
      createdAt: new Date(now - 2 * H).toISOString(),
      read: false,
    },
    {
      id: "n-2",
      type: "deadline",
      title: "Dissertation Chapter 3 due in 17 hours",
      body: "Estimated 14 hours of work remaining — start today to stay on track.",
      taskId: "t-1",
      createdAt: new Date(now - 5 * H).toISOString(),
      read: false,
    },
    {
      id: "n-3",
      type: "priority",
      title: "Priority changed: Group Project Meeting Notes",
      body: "Moved from Medium to High as the deadline entered the 24-hour window.",
      taskId: "t-5",
      createdAt: new Date(now - 9 * H).toISOString(),
      read: false,
    },
    {
      id: "n-4",
      type: "deadline",
      title: "Reminder scheduled for HCI Usability Report",
      body: "An email reminder will be sent 24 hours before the deadline.",
      taskId: "t-2",
      createdAt: new Date(now - 26 * H).toISOString(),
      read: true,
    },
    {
      id: "n-5",
      type: "system",
      title: "Weekly summary ready",
      body: "You completed 4 of 6 planned tasks last week — 3 of them on time.",
      createdAt: new Date(now - 50 * H).toISOString(),
      read: true,
    },
  ];
}

export function seedActivity(now: number): ActivityItem[] {
  return [
    {
      id: "a-1",
      kind: "completed",
      text: "Completed Literature Review Summary Table",
      at: new Date(now - 6 * H).toISOString(),
    },
    {
      id: "a-2",
      kind: "updated",
      text: "Moved Database Coursework to In progress",
      at: new Date(now - 20 * H).toISOString(),
    },
    {
      id: "a-3",
      kind: "created",
      text: "Added Group Project Meeting Notes",
      at: new Date(now - 27 * H).toISOString(),
    },
    {
      id: "a-4",
      kind: "reminder",
      text: "Email reminder sent for Visa Document Upload",
      at: new Date(now - 44 * H).toISOString(),
    },
  ];
}

export const COMPLETION_TREND = [
  { week: "W1", completed: 5, planned: 7 },
  { week: "W2", completed: 6, planned: 7 },
  { week: "W3", completed: 4, planned: 8 },
  { week: "W4", completed: 7, planned: 8 },
  { week: "W5", completed: 6, planned: 6 },
  { week: "W6", completed: 8, planned: 9 },
];

export const ONTIME_SPLIT = [
  { name: "On time", value: 23 },
  { name: "Late", value: 5 },
];
