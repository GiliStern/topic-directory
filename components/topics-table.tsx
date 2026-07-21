import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Topic } from "@/lib/types";
import { ConfidenceBadge, VerdictBadge } from "@/components/badges";
import { formatDate } from "@/lib/utils";

type TopicsTableProps = {
  topics: Topic[];
};

export function TopicsTable({ topics }: TopicsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                ID
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Topic
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Confidence
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Verdict
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Researched
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {topics.map((topic) => (
              <tr key={topic.id} className="hover:bg-stone-50/80">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-stone-500">
                  {topic.id}
                </td>
                <td className="max-w-md px-4 py-3 font-medium text-stone-900">
                  <Link
                    href={`/topic/${topic.id}`}
                    className="hover:text-teal-800 hover:underline"
                  >
                    {topic.topic}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <ConfidenceBadge confidence={topic.confidence} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <VerdictBadge verdict={topic.verdict} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-stone-600">
                  {formatDate(topic.researchedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={`/topic/${topic.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:border-teal-700 hover:text-teal-800"
                  >
                    Open
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
