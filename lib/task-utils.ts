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
  }
> = {
  Critical: {
    label: "Critical",
    badge: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
    border: "border-red-200",
    text: "text-red-600"
  },
  Intermediate: {
    label: "Intermediate",
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
    border: "border-orange-200",
    text: "text-orange-600"
  },
  Low: {
    label: "Low",
    badge: "bg-green-50 text-green-700 ring-green-200",
    dot: "bg-green-500",
    border: "border-green-200",
    text: "text-green-600"
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
