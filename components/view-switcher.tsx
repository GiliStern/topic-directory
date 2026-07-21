"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import type { ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewSwitcherProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

const options: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "table", label: "Table", icon: Table2 },
];

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-teal-700 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
