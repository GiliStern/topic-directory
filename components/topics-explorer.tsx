"use client";

import { useMemo, useState } from "react";
import type { Topic, ViewMode } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { SearchBar } from "@/components/search-bar";
import { TopicCard } from "@/components/topic-card";
import { TopicsTable } from "@/components/topics-table";
import { ViewSwitcher } from "@/components/view-switcher";

type TopicsExplorerProps = {
  topics: Topic[];
};

function matchesQuery(topic: Topic, query: string): boolean {
  const haystack = [
    topic.id,
    topic.topic,
    topic.text,
    topic.verdict,
    topic.confidence,
    topic.reviewNotes,
    topic.links,
    topic.wikipediaLink,
    topic.images,
    topic.researchedAt,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function hasNotes(topic: Topic): boolean {
  return topic.text.trim().length > 0;
}

export function TopicsExplorer({ topics }: TopicsExplorerProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [hideEmpty, setHideEmpty] = useState(true);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return topics.filter((topic) => {
      if (hideEmpty && !hasNotes(topic)) return false;
      if (normalized && !matchesQuery(topic, normalized)) return false;
      return true;
    });
  }, [topics, query, hideEmpty]);

  const poolCount = useMemo(
    () => (hideEmpty ? topics.filter(hasNotes).length : topics.length),
    [topics, hideEmpty],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full sm:max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={filtered.length}
            totalCount={poolCount}
          />
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={hideEmpty}
              onChange={(event) => setHideEmpty(event.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600/30"
            />
            Hide empty items
          </label>
        </div>
        <ViewSwitcher value={view} onChange={setView} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState query={query.trim()} hideEmpty={hideEmpty} />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      ) : (
        <TopicsTable topics={filtered} />
      )}
    </div>
  );
}
