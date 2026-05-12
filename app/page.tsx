"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronsUpDown, ClipboardList, Download, Plus, Timer } from "lucide-react";
import { BottomNav, type ViewMode } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { StatsView } from "@/components/StatsView";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { formatDate, sortTasks } from "@/lib/task-utils";
import type { Task, TaskDraft, TaskStatus } from "@/lib/types";

const STORAGE_KEY = "todolist.tasks.v1";

const emptyDraft: TaskDraft = {
  title: "",
  description: "",
  priority: "Intermediate",
  status: "Pending"
};

const reportGroups: TaskStatus[] = ["Pending", "In Progress"];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildReportHtml(tasks: Task[]) {
  const generatedDate = new Date().toISOString().slice(0, 10);
  const groupMarkup = reportGroups
    .map((status) => {
      const groupTasks = sortTasks(tasks.filter((task) => task.status === status));
      const taskRows = groupTasks.length
        ? groupTasks
            .map(
              (task) => `
                <article class="task priority-${task.priority.toLowerCase()} ${task.completed ? "completed" : ""}">
                  <div class="task-header">
                    <h3>${escapeHtml(task.title)}</h3>
                    <span class="badge ${task.priority.toLowerCase()}">${escapeHtml(task.priority)}</span>
                  </div>
                  <dl>
                    <div><dt>Status</dt><dd>${escapeHtml(task.status)}${task.completed ? " - Completed" : ""}</dd></div>
                    <div><dt>Created</dt><dd>${escapeHtml(formatDate(task.createdAt))}</dd></div>
                  </dl>
                  <p>${escapeHtml(task.description || "No detailed description added.").replaceAll("\n", "<br />")}</p>
                </article>`
            )
            .join("")
        : `<p class="empty">No ${escapeHtml(status.toLowerCase())} tasks.</p>`;

      return `
        <section>
          <h2>${escapeHtml(status)} Tasks</h2>
          ${taskRows}
        </section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>TodoList Report ${generatedDate}</title>
  <style>
    body { margin: 40px; color: #111827; font-family: Arial, sans-serif; line-height: 1.45; }
    header { border-bottom: 2px solid #e5e7eb; margin-bottom: 28px; padding-bottom: 18px; }
    h1 { font-size: 30px; margin: 0 0 8px; }
    h2 { border-bottom: 1px solid #e5e7eb; font-size: 22px; margin: 30px 0 16px; padding-bottom: 8px; }
    h3 { font-size: 17px; margin: 0; }
    .meta, .empty { color: #6b7280; }
    .task { border: 1px solid #e5e7eb; border-left: 8px solid #9ca3af; border-radius: 8px; margin: 0 0 14px; padding: 16px; page-break-inside: avoid; }
    .task.completed { background: #f3f4f6; color: #6b7280; opacity: 0.78; text-decoration: line-through; }
    .task-header { align-items: center; display: flex; gap: 12px; justify-content: space-between; }
    .badge { border-radius: 999px; display: inline-block; font-size: 12px; font-weight: 700; padding: 5px 10px; text-transform: uppercase; }
    .critical { background: #fee2e2; color: #991b1b; }
    .intermediate { background: #fef3c7; color: #854d0e; }
    .low { background: #dcfce7; color: #166534; }
    .priority-critical { border-left-color: #dc2626; }
    .priority-intermediate { border-left-color: #eab308; }
    .priority-low { border-left-color: #16a34a; }
    dl { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 12px 0; }
    dt { color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    dd { margin: 2px 0 0; }
    p { margin: 12px 0 0; white-space: normal; }
    @media print { body { margin: 24px; } }
  </style>
</head>
<body>
  <header>
    <h1>TodoList Report</h1>
    <div class="meta">Generated ${generatedDate}</div>
  </header>
  ${groupMarkup}
</body>
</html>`;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<ViewMode>("pending");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Task[];
        setTasks(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setTasks([]);
    } finally {
      setIsHydrated(true);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [isHydrated, tasks]);

  const visibleTasks = useMemo(() => {
    const status: TaskStatus = activeView === "progress" ? "In Progress" : "Pending";
    return sortTasks(tasks.filter((task) => task.status === status));
  }, [activeView, tasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalMode("create");
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingTask(null);
  };

  const handleCreate = (draft: TaskDraft) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      priority: draft.priority,
      status: draft.status,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    setTasks((current) => sortTasks([task, ...current]));
    setActiveView(task.status === "In Progress" ? "progress" : "pending");
    closeModal();
  };

  const handleUpdate = (draft: TaskDraft) => {
    if (!editingTask) {
      return;
    }

    setTasks((current) =>
      sortTasks(
        current.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: draft.title.trim(),
                description: draft.description.trim(),
                priority: draft.priority,
                status: draft.status,
                updatedAt: new Date().toISOString()
              }
            : task
        )
      )
    );
    setActiveView(draft.status === "In Progress" ? "progress" : "pending");
    closeModal();
  };

  const toggleComplete = (taskId: string) => {
    setTasks((current) =>
      sortTasks(
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: !task.completed,
                updatedAt: new Date().toISOString()
              }
            : task
        )
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setExpandedTaskIds((current) => {
      const next = new Set(current);
      next.delete(taskId);
      return next;
    });
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskIds((current) => {
      const next = new Set(current);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const allVisibleExpanded = visibleTasks.length > 0 && visibleTasks.every((task) => expandedTaskIds.has(task.id));

  const toggleAllVisibleTasks = () => {
    setExpandedTaskIds((current) => {
      const next = new Set(current);
      if (allVisibleExpanded) {
        visibleTasks.forEach((task) => next.delete(task.id));
      } else {
        visibleTasks.forEach((task) => next.add(task.id));
      }
      return next;
    });
  };

  const exportReport = () => {
    const reportDate = new Date().toISOString().slice(0, 10);
    const html = buildReportHtml(tasks);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `todolist-report-${reportDate}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const currentLabel = activeView === "progress" ? "In Progress Tasks" : "Pending Tasks";
  const taskCountLabel = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-28 pt-5 sm:px-6 lg:max-w-5xl">
      <header className="sticky top-0 z-20 -mx-4 border-b border-slate-200/70 bg-white/88 px-4 pb-4 pt-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <ClipboardList className="h-4 w-4 text-red-500" aria-hidden="true" />
              Professional task manager
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">TodoList</h1>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
            aria-label="Create task"
            title="Create task"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-[8px] bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveView("pending")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-3 text-sm font-semibold transition ${
              activeView === "pending" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveView("progress")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-3 text-sm font-semibold transition ${
              activeView === "progress" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Timer className="h-4 w-4" aria-hidden="true" />
            In Progress
          </button>
        </div>
      </header>

      {activeView === "stats" ? (
        <StatsView tasks={tasks} />
      ) : (
        <section className="flex flex-1 flex-col py-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{taskCountLabel}</p>
              <h2 className="text-xl font-semibold text-slate-950">{currentLabel}</h2>
            </div>
            <div className="hidden items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:flex">
              <BarChart3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Sorted by priority
            </div>
          </div>

          <div className="mb-4 grid gap-2 sm:flex sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={toggleAllVisibleTasks}
              disabled={visibleTasks.length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
              {allVisibleExpanded ? "Collapse All" : "Expand All"}
            </button>
            <button
              type="button"
              onClick={exportReport}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Report
            </button>
          </div>

          {visibleTasks.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedTaskIds.has(task.id)}
                  onToggleComplete={toggleComplete}
                  onToggleExpand={toggleTaskExpansion}
                  onEdit={openEditModal}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={activeView === "progress" ? "No work in progress" : "Your pending list is clear"}
              message={
                activeView === "progress"
                  ? "Start a task and move it here when it needs focused attention."
                  : "Create a task with a priority and enough detail for future you to act fast."
              }
              actionLabel="Create task"
              onAction={openCreateModal}
            />
          )}
        </section>
      )}

      <BottomNav activeView={activeView} onChange={setActiveView} onCreate={openCreateModal} />

      {modalMode ? (
        <TaskModal
          mode={modalMode}
          initialValue={
            editingTask
              ? {
                  title: editingTask.title,
                  description: editingTask.description,
                  priority: editingTask.priority,
                  status: editingTask.status
                }
              : { ...emptyDraft, status: activeView === "progress" ? "In Progress" : "Pending" }
          }
          onClose={closeModal}
          onSubmit={modalMode === "create" ? handleCreate : handleUpdate}
        />
      ) : null}
    </main>
  );
}
