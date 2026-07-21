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

export function TopicsExplorer({ topics }: TopicsExplorerProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return topics;
    return topics.filter((topic) => matchesQuery(topic, normalized));
  }, [topics, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full sm:max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={filtered.length}
            totalCount={topics.length}
          />
        </div>
        <ViewSwitcher value={view} onChange={setView} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState query={query.trim()} />
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
