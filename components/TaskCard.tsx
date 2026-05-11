"use client";

import { useState } from "react";
import { Check, ChevronDown, Circle, Pencil, Trash2 } from "lucide-react";
import { formatDate, priorityStyles } from "@/lib/task-utils";
import type { Task } from "@/lib/types";

type TaskCardProps = {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = priorityStyles[task.priority];

  return (
    <article
      className={`rounded-[8px] border bg-white p-4 shadow-soft transition duration-200 ${
        task.completed ? "border-slate-200 opacity-60 grayscale" : `${styles.border} hover:-translate-y-0.5 hover:shadow-lg`
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
            task.completed
              ? "border-slate-300 bg-slate-200 text-slate-600"
              : "border-slate-300 text-slate-400 hover:border-slate-900 hover:text-slate-900"
          }`}
          aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
          title={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed ? <Check className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-3 w-3" aria-hidden="true" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles.badge}`}>
              <span className={`h-2 w-2 rounded-full ${styles.dot}`} aria-hidden="true" />
              {styles.label}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{task.status}</span>
          </div>

          <h3 className={`mt-3 break-words text-base font-semibold leading-snug text-slate-950 ${task.completed ? "text-slate-500 line-through" : ""}`}>
            {task.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
            <span>Created {formatDate(task.createdAt)}</span>
            {task.completed ? <span>Completed</span> : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label={isExpanded ? "Collapse task details" : "Expand task details"}
          title={isExpanded ? "Collapse details" : "Expand details"}
        >
          <ChevronDown className={`h-5 w-5 transition ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <div className={`grid transition-all duration-200 ease-out ${isExpanded ? "grid-rows-[1fr] pt-4 opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p className={`whitespace-pre-wrap break-words rounded-[8px] bg-slate-50 p-3 text-sm leading-6 text-slate-600 ${task.completed ? "line-through" : ""}`}>
            {task.description || "No detailed description added."}
          </p>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
