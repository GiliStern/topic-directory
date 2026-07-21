"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Topic, TopicListResult, ViewMode } from "@/lib/types";
import { TOPICS_PAGE_SIZE } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { SearchBar } from "@/components/search-bar";
import { TopicCard } from "@/components/topic-card";
import { TopicsTable } from "@/components/topics-table";
import { ViewSwitcher } from "@/components/view-switcher";

type TopicsExplorerProps = {
  initialData: TopicListResult;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function useColumnCount() {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const xl = window.matchMedia("(min-width: 1280px)");

    const update = () => {
      setColumns(xl.matches ? 3 : sm.matches ? 2 : 1);
    };

    update();
    sm.addEventListener("change", update);
    xl.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      xl.removeEventListener("change", update);
    };
  }, []);

  return columns;
}

async function fetchTopics(params: {
  query: string;
  hideEmpty: boolean;
  offset: number;
  limit?: number;
}): Promise<TopicListResult> {
  const search = new URLSearchParams({
    q: params.query,
    hideEmpty: params.hideEmpty ? "1" : "0",
    offset: String(params.offset),
    limit: String(params.limit ?? TOPICS_PAGE_SIZE),
  });

  const response = await fetch(`/api/topics?${search.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to load topics");
  }

  return (await response.json()) as TopicListResult;
}

export function TopicsExplorer({ initialData }: TopicsExplorerProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [view, setView] = useState<ViewMode>("grid");
  const [hideEmpty, setHideEmpty] = useState(true);
  const [topics, setTopics] = useState<Topic[]>(initialData.topics);
  const [total, setTotal] = useState(initialData.total);
  const [poolTotal, setPoolTotal] = useState(initialData.poolTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const requestIdRef = useRef(0);
  const skipNextFetchRef = useRef(true);
  const columns = useColumnCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!listRef.current || view !== "grid") return;
    setScrollMargin(listRef.current.offsetTop);
  }, [mounted, view, topics.length, loading]);

  const reload = useCallback(async (nextQuery: string, nextHideEmpty: boolean) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchTopics({
        query: nextQuery,
        hideEmpty: nextHideEmpty,
        offset: 0,
      });

      if (requestId !== requestIdRef.current) return;
      setTopics(result.topics);
      setTotal(result.total);
      setPoolTotal(result.poolTotal);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load topics");
      setTopics([]);
      setTotal(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (skipNextFetchRef.current && debouncedQuery === "" && hideEmpty) {
      skipNextFetchRef.current = false;
      return;
    }

    skipNextFetchRef.current = false;
    void reload(debouncedQuery, hideEmpty);
  }, [debouncedQuery, hideEmpty, reload]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || topics.length >= total) return;

    const requestId = requestIdRef.current;
    setLoadingMore(true);
    setError(null);

    try {
      const result = await fetchTopics({
        query: debouncedQuery,
        hideEmpty,
        offset: topics.length,
      });

      if (requestId !== requestIdRef.current) return;
      setTopics((current) => {
        const seen = new Set(current.map((topic) => topic.id));
        const appended = result.topics.filter((topic) => !seen.has(topic.id));
        return [...current, ...appended];
      });
      setTotal(result.total);
      setPoolTotal(result.poolTotal);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load more topics");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [debouncedQuery, hideEmpty, loading, loadingMore, topics.length, total]);

  const rowCount = useMemo(() => {
    return Math.ceil(topics.length / Math.max(columns, 1));
  }, [topics.length, columns]);

  const virtualizer = useWindowVirtualizer({
    count: view === "grid" ? rowCount : 0,
    estimateSize: () => 280,
    overscan: 4,
    scrollMargin,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!mounted || loading || view !== "grid" || topics.length >= total) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    const loadedRows = Math.ceil(topics.length / Math.max(columns, 1));
    if (lastItem.index >= loadedRows - 3) {
      void loadMore();
    }
  }, [mounted, loading, topics.length, total, virtualItems, view, columns, loadMore]);

  const hasMore = topics.length < total;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full sm:max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={total}
            totalCount={poolTotal}
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

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-stone-500">Searching the full archive…</p>
      ) : null}

      {!loading && topics.length === 0 ? (
        <EmptyState query={query.trim()} hideEmpty={hideEmpty} />
      ) : null}

      <div ref={listRef}>
        {!loading && topics.length > 0 && view === "table" ? (
          <TopicsTable topics={topics} onLoadMore={loadMore} hasMore={hasMore} />
        ) : null}

        {!loading && topics.length > 0 && view === "grid" && !mounted ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        ) : null}

        {!loading && topics.length > 0 && view === "grid" && mounted ? (
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualItems.map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const rowTopics = topics.slice(startIndex, startIndex + columns);

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute left-0 top-0 grid w-full grid-cols-1 gap-4 pb-4 sm:grid-cols-2 xl:grid-cols-3"
                  style={{
                    transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                  }}
                >
                  {rowTopics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {loadingMore ? (
        <p className="text-center text-sm text-stone-500">Loading more topics…</p>
      ) : null}
    </div>
  );
}
