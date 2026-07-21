import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowDownToLine, ArrowLeft } from "lucide-react";
import { LinkPreviews, LinkPreviewsSkeleton } from "@/components/link-previews";
import { MarkdownContent } from "@/components/markdown-content";
import { TopicMetadata } from "@/components/topic-metadata";
import { getTopicById } from "@/lib/topics";
import { parseUrls } from "@/lib/utils";

export const revalidate = 60;

type TopicPageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const topic = await getTopicById(params.id);
  if (!topic) {
    return { title: "Topic not found" };
  }
  return {
    title: topic.topic,
    description: topic.text
      ? topic.text.replace(/\s+/g, " ").slice(0, 160)
      : `Research topic: ${topic.topic}`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const topic = await getTopicById(params.id);
  if (!topic) notFound();

  const links = parseUrls(topic.links);
  const wikipediaLinks = parseUrls(topic.wikipediaLink);

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to topics
        </Link>
        <a
          href="#external-resources"
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-teal-700 hover:text-teal-800 lg:hidden"
        >
          <ArrowDownToLine className="h-4 w-4" aria-hidden />
          External resources
        </a>
      </div>

      <div className="grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)_320px]">
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <a
              href="#external-resources"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-teal-700 hover:text-teal-800"
            >
              <ArrowDownToLine className="h-4 w-4 shrink-0" aria-hidden />
              External resources
            </a>
          </div>
        </aside>

        <section className="min-w-0 space-y-8">
          <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-800">
              Topic #{topic.id}
            </p>
            <h1 className="mt-3 font-display text-3xl tracking-tight text-stone-900 sm:text-4xl">
              {topic.topic}
            </h1>
          </header>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 font-display text-xl text-stone-900">Research notes</h2>
            <MarkdownContent content={topic.text} />
          </section>

          <section id="external-resources" className="scroll-mt-8 space-y-4">
            <div>
              <h2 className="font-display text-xl text-stone-900">External resources</h2>
              <p className="mt-1 text-sm text-stone-500">
                Parsed from links and Wikipedia fields
              </p>
            </div>
            <Suspense
              fallback={<LinkPreviewsSkeleton count={Math.min(links.length + wikipediaLinks.length, 6) || 4} />}
            >
              <LinkPreviews links={links} wikipediaLinks={wikipediaLinks} />
            </Suspense>
          </section>
        </section>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <TopicMetadata topic={topic} />
        </div>
      </div>
    </main>
  );
}
