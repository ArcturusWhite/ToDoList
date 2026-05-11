"use client";

import { Plus } from "lucide-react";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-soft">
      <div className="relative h-36 w-36">
        <div className="absolute left-5 top-3 h-28 w-24 rotate-[-5deg] rounded-[8px] border border-slate-200 bg-slate-50 shadow-sm" />
        <div className="absolute left-8 top-0 h-28 w-24 rotate-[7deg] rounded-[8px] border border-slate-200 bg-white shadow-sm">
          <div className="mx-4 mt-5 h-2 rounded-full bg-red-200" />
          <div className="mx-4 mt-4 h-2 rounded-full bg-orange-200" />
          <div className="mx-4 mt-4 h-2 rounded-full bg-green-200" />
          <div className="mx-4 mt-4 h-2 w-10 rounded-full bg-slate-200" />
        </div>
        <div className="absolute bottom-3 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white shadow-soft">
          <Plus className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {actionLabel}
      </button>
    </div>
  );
}
