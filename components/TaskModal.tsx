"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Priority, TaskDraft, TaskStatus } from "@/lib/types";

type TaskModalProps = {
  mode: "create" | "edit";
  initialValue: TaskDraft;
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => void;
};

const priorities: Priority[] = ["Critical", "Intermediate", "Low"];
const statuses: TaskStatus[] = ["Pending", "In Progress"];

export function TaskModal({ mode, initialValue, onClose, onSubmit }: TaskModalProps) {
  const [draft, setDraft] = useState<TaskDraft>(initialValue);
  const [titleTouched, setTitleTouched] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const isInvalid = draft.title.trim().length === 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTitleTouched(true);

    if (!isInvalid) {
      onSubmit(draft);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/30 px-3 pb-3 pt-10 backdrop-blur-sm sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-[8px] bg-white shadow-2xl ring-1 ring-slate-200"
        aria-label={mode === "create" ? "Create task" : "Edit task"}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{mode === "create" ? "New task" : "Update task"}</p>
            <h2 className="text-lg font-semibold text-slate-950">{mode === "create" ? "Create Task" : "Edit Task"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close modal"
            title="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Title</span>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              onBlur={() => setTitleTouched(true)}
              placeholder="Prepare project handoff"
              className="mt-2 h-12 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
              maxLength={100}
              autoFocus
            />
            {titleTouched && isInvalid ? <span className="mt-1 block text-sm font-medium text-red-600">Title is required.</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Detailed description</span>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Add context, blockers, links, or acceptance criteria."
              className="mt-2 min-h-28 w-full resize-none rounded-[8px] border border-slate-200 bg-white px-3 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
              maxLength={1200}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Priority</span>
              <select
                value={draft.priority}
                onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as Priority }))}
                className="mt-2 h-12 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-base font-medium text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Tab</span>
              <select
                value={draft.status}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as TaskStatus }))}
                className="mt-2 h-12 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-base font-medium text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-[8px] px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-[8px] bg-slate-950 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
          >
            {mode === "create" ? "Create task" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
