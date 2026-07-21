import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Topic } from "@/lib/types";
import { ConfidenceBadge, VerdictBadge } from "@/components/badges";
import { plainTextSnippet } from "@/lib/utils";

type TopicCardProps = {
  topic: Topic;
};

export function TopicCard({ topic }: TopicCardProps) {
  const snippet = topic.text
    ? plainTextSnippet(topic.text)
    : "No research notes yet for this topic.";

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
          #{topic.id}
        </span>
        <VerdictBadge verdict={topic.verdict} />
        <ConfidenceBadge confidence={topic.confidence} />
      </div>

      <h2 className="font-display text-lg leading-snug text-stone-900 transition group-hover:text-teal-800">
        <Link href={`/topic/${topic.id}`} className="focus:outline-none">
          <span className="absolute inset-0 rounded-2xl" aria-hidden />
          {topic.topic}
        </Link>
      </h2>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{snippet}</p>

      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
        View details
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </article>
  );
}
