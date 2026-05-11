"use client";

import { BarChart3, ClipboardList, Plus, Timer } from "lucide-react";

export type ViewMode = "pending" | "progress" | "stats";

type BottomNavProps = {
  activeView: ViewMode;
  onChange: (view: ViewMode) => void;
  onCreate: () => void;
};

const items = [
  { id: "pending" as const, label: "Pending", icon: ClipboardList },
  { id: "progress" as const, label: "Progress", icon: Timer },
  { id: "stats" as const, label: "Stats", icon: BarChart3 }
];

export function BottomNav({ activeView, onChange, onCreate }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/94 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 shadow-[0_-14px_30px_-24px_rgba(15,23,42,0.6)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-3xl grid-cols-[1fr_1fr_64px_1fr] items-center gap-1">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[8px] text-xs font-semibold transition ${
                isActive ? "text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onCreate}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
          aria-label="Create task"
          title="Create task"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>

        {items.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[8px] text-xs font-semibold transition ${
                isActive ? "text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
