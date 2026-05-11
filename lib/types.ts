export type Priority = "Critical" | "Intermediate" | "Low";

export type TaskStatus = "Pending" | "In Progress";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskDraft = {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
};
