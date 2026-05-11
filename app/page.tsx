"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, ClipboardList, Plus, Timer } from "lucide-react";
import { BottomNav, type ViewMode } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { StatsView } from "@/components/StatsView";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { sortTasks } from "@/lib/task-utils";
import type { Task, TaskDraft, TaskStatus } from "@/lib/types";

const STORAGE_KEY = "todolist.tasks.v1";

const emptyDraft: TaskDraft = {
  title: "",
  description: "",
  priority: "Intermediate",
  status: "Pending"
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<ViewMode>("pending");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

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
              activeView === "pending"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveView("progress")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-3 text-sm font-semibold transition ${
              activeView === "progress"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
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

          {visibleTasks.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleComplete}
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
