"use client";

import { CheckCircle2, CircleDot, ListChecks, SignalHigh } from "lucide-react";
import { priorityStyles } from "@/lib/task-utils";
import type { Priority, Task } from "@/lib/types";

type StatsViewProps = {
  tasks: Task[];
};

const priorities: Priority[] = ["Critical", "Intermediate", "Low"];

export function StatsView({ tasks }: StatsViewProps) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Total tasks", value: total, icon: ListChecks, tone: "bg-slate-950 text-white" },
    { label: "Completed", value: completed, icon: CheckCircle2, tone: "bg-green-600 text-white" },
    { label: "Pending", value: pending, icon: CircleDot, tone: "bg-orange-500 text-white" },
    { label: "Completion", value: `${completionRate}%`, icon: SignalHigh, tone: "bg-red-500 text-white" }
  ];

  return (
    <section className="py-5">
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-500">Workspace overview</p>
        <h2 className="text-xl font-semibold text-slate-950">Statistics</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-soft">
              <div className={`flex h-10 w-10 items-center justify-center rounded-[8px] ${item.tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-950">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[8px] border border-slate-200 bg-white p-4 shadow-soft">
        <h3 className="text-base font-semibold text-slate-950">Tasks by priority</h3>
        <div className="mt-4 space-y-4">
          {priorities.map((priority) => {
            const count = tasks.filter((task) => task.priority === priority).length;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            const styles = priorityStyles[priority];

            return (
              <div key={priority}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2 font-semibold text-slate-700">
                    <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} aria-hidden="true" />
                    {priority}
                  </div>
                  <span className="font-semibold text-slate-500">
                    {count} · {percent}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${styles.dot} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
