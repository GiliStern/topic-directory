import type { ReactNode } from "react";
import { CalendarDays, ImageIcon, NotebookPen, Scale, ShieldCheck } from "lucide-react";
import type { Topic } from "@/lib/types";
import { ConfidenceBadge, VerdictBadge } from "@/components/badges";
import { formatDate, parseUrls } from "@/lib/utils";

type TopicMetadataProps = {
  topic: Topic;
};

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Scale;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5 border-b border-stone-100 py-3 last:border-b-0">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <div className="text-sm text-stone-800">{children}</div>
    </div>
  );
}

export function TopicMetadata({ topic }: TopicMetadataProps) {
  const imageUrls = parseUrls(topic.images);

  return (
    <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg text-stone-900">Metadata</h2>
      <p className="mt-1 text-sm text-stone-500">Research status and source fields</p>

      <div className="mt-2">
        <MetaRow icon={ShieldCheck} label="Verdict">
          <VerdictBadge verdict={topic.verdict} />
        </MetaRow>

        <MetaRow icon={Scale} label="Confidence">
          <ConfidenceBadge confidence={topic.confidence} />
        </MetaRow>

        <MetaRow icon={CalendarDays} label="Researched at">
          {formatDate(topic.researchedAt)}
        </MetaRow>

        <MetaRow icon={NotebookPen} label="Review notes">
          <p className="whitespace-pre-wrap leading-relaxed">
            {topic.reviewNotes?.trim() || "—"}
          </p>
        </MetaRow>

        <MetaRow icon={ImageIcon} label="Images">
          {imageUrls.length > 0 ? (
            <ul className="space-y-1">
              {imageUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-teal-700 hover:underline"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-stone-500">{topic.images?.trim() || "—"}</span>
          )}
        </MetaRow>

        <div className="space-y-1.5 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Identifier
          </div>
          <p className="font-mono text-sm text-stone-700">#{topic.id}</p>
        </div>
      </div>
    </aside>
  );
}
