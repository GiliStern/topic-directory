import type { Metadata } from "next";
import { TopicsExplorer } from "@/components/topics-explorer";
import { getTopicStats, listTopics } from "@/lib/topics";
import { TOPICS_PAGE_SIZE } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Topic Directory",
  description:
    "Search and explore research topics with verified notes, confidence scores, and source links.",
};

export default async function HomePage() {
  const [stats, initialTopics] = await Promise.all([
    getTopicStats(),
    listTopics({ hideEmpty: true, offset: 0, limit: TOPICS_PAGE_SIZE }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-800">
          Research archive
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-stone-900 sm:text-5xl">
          Topic Directory
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
          Search and explore {stats.total.toLocaleString()} topics with verified research notes,
          confidence scores, and source links. Switch between card and table views to scan the
          archive quickly.
        </p>
        <dl className="mt-6 flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-stone-500">Topics</dt>
            <dd className="font-display text-2xl text-stone-900">
              {stats.total.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">With notes</dt>
            <dd className="font-display text-2xl text-stone-900">
              {stats.withNotes.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">Verified</dt>
            <dd className="font-display text-2xl text-stone-900">
              {stats.verified.toLocaleString()}
            </dd>
          </div>
        </dl>
      </header>

      <TopicsExplorer initialData={initialTopics} />
    </main>
  );
}
