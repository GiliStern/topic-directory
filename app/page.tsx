import { TopicsExplorer } from "@/components/topics-explorer";
import { getTopics } from "@/lib/topics";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const topics = await getTopics();
  const researched = topics.filter((topic) => topic.text.trim().length > 0).length;
  const verified = topics.filter(
    (topic) => topic.verdict.trim().toLowerCase() === "verified",
  ).length;

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
          Search and explore {topics.length.toLocaleString()} topics with verified research notes,
          confidence scores, and source links. Switch between card and table views to scan the
          archive quickly.
        </p>
        <dl className="mt-6 flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-stone-500">Topics</dt>
            <dd className="font-display text-2xl text-stone-900">{topics.length.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-stone-500">With notes</dt>
            <dd className="font-display text-2xl text-stone-900">{researched.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Verified</dt>
            <dd className="font-display text-2xl text-stone-900">{verified.toLocaleString()}</dd>
          </div>
        </dl>
      </header>

      <TopicsExplorer topics={topics} />
    </main>
  );
}
