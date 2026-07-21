import { cn } from "@/lib/utils";

const verdictStyles: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  "needs-review": "bg-amber-50 text-amber-900 ring-amber-200",
  disputed: "bg-rose-50 text-rose-800 ring-rose-200",
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
};

type VerdictBadgeProps = {
  verdict: string;
  className?: string;
};

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const value = verdict.trim();
  if (!value) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-stone-100 text-stone-500 ring-stone-200",
          className,
        )}
      >
        Unreviewed
      </span>
    );
  }

  const styles = verdictStyles[value.toLowerCase()] ?? "bg-sky-50 text-sky-900 ring-sky-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        styles,
        className,
      )}
    >
      {value.replace(/-/g, " ")}
    </span>
  );
}

type ConfidenceBadgeProps = {
  confidence: string;
  className?: string;
};

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const value = confidence.trim();
  if (!value) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-stone-100 text-stone-500 ring-stone-200",
          className,
        )}
      >
        No score
      </span>
    );
  }

  const numeric = Number(value);
  const tone =
    Number.isFinite(numeric) && numeric >= 90
      ? "bg-teal-50 text-teal-800 ring-teal-200"
      : Number.isFinite(numeric) && numeric >= 70
        ? "bg-cyan-50 text-cyan-900 ring-cyan-200"
        : "bg-orange-50 text-orange-900 ring-orange-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tone,
        className,
      )}
    >
      {Number.isFinite(numeric) ? `${numeric}%` : value}
    </span>
  );
}
