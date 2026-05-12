import type { Priority, Task } from "@/lib/types";

const priorityRank: Record<Priority, number> = {
  Critical: 0,
  Intermediate: 1,
  Low: 2
};

export const priorityStyles: Record<
  Priority,
  {
    label: string;
    badge: string;
    dot: string;
    border: string;
    text: string;
    band: string;
    card: string;
  }
> = {
  Critical: {
    label: "Critical",
    badge: "bg-red-100 text-red-800 ring-red-300 shadow-sm",
    dot: "bg-red-600",
    border: "border-red-200",
    text: "text-red-700",
    band: "bg-red-600",
    card: "bg-red-50/55"
  },
  Intermediate: {
    label: "Intermediate",
    badge: "bg-yellow-100 text-yellow-900 ring-yellow-300 shadow-sm",
    dot: "bg-yellow-500",
    border: "border-yellow-200",
    text: "text-yellow-800",
    band: "bg-yellow-500",
    card: "bg-yellow-50/65"
  },
  Low: {
    label: "Low",
    badge: "bg-green-100 text-green-800 ring-green-300 shadow-sm",
    dot: "bg-green-600",
    border: "border-green-200",
    text: "text-green-700",
    band: "bg-green-600",
    card: "bg-green-50/55"
  }
};

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    const priorityDelta = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(isoDate));
}
