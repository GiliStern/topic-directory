import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { Topic, TopicListResult, TopicStats } from "@/lib/types";
import { TOPICS_PAGE_SIZE } from "@/lib/types";

export type { TopicListResult, TopicStats };
export { TOPICS_PAGE_SIZE };

export type TopicListParams = {
  query?: string;
  hideEmpty?: boolean;
  offset?: number;
  limit?: number;
};

type TopicRow = {
  id: number | string;
  topic: string | null;
  text: string | null;
  links: string | null;
  wikipedia_link: string | null;
  images: string | null;
  confidence: string | null;
  verdict: string | null;
  review_notes: string | null;
  researched_at: string | null;
};

function mapRow(row: TopicRow): Topic {
  return {
    id: String(row.id),
    topic: row.topic ?? "",
    text: row.text ?? "",
    links: row.links ?? "",
    wikipediaLink: row.wikipedia_link ?? "",
    images: row.images ?? "",
    confidence: row.confidence ?? "",
    verdict: row.verdict ?? "",
    reviewNotes: row.review_notes ?? "",
    researchedAt: row.researched_at ?? "",
  };
}

function sanitizeSearchQuery(query: string): string {
  return query.replace(/[,()]/g, " ").replace(/\s+/g, " ").trim();
}

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function buildSearchFilter(query: string): string | null {
  const sanitized = sanitizeSearchQuery(query);
  if (!sanitized) return null;

  const pattern = `%${escapeIlike(sanitized)}%`;
  const quoted = `"${pattern.replace(/"/g, "")}"`;
  const fields = [
    "topic",
    "text",
    "verdict",
    "confidence",
    "review_notes",
    "links",
    "wikipedia_link",
    "images",
    "researched_at",
  ];

  const clauses = fields.map((field) => `${field}.ilike.${quoted}`);
  const numericId = Number(sanitized);
  if (Number.isInteger(numericId)) {
    clauses.push(`id.eq.${numericId}`);
  }

  return clauses.join(",");
}

async function countTopics(options: {
  query?: string;
  hideEmpty?: boolean;
}): Promise<number> {
  const supabase = createPublicSupabaseClient();
  let request = supabase.from("topics").select("id", { count: "exact", head: true });

  if (options.hideEmpty) {
    request = request.neq("text", "");
  }

  const searchFilter = buildSearchFilter(options.query ?? "");
  if (searchFilter) {
    request = request.or(searchFilter);
  }

  const { count, error } = await request;
  if (error) throw new Error(`Failed to count topics: ${error.message}`);
  return count ?? 0;
}

export async function listTopics(params: TopicListParams = {}): Promise<TopicListResult> {
  const query = params.query?.trim() ?? "";
  const hideEmpty = params.hideEmpty ?? true;
  const offset = Math.max(0, params.offset ?? 0);
  const limit = Math.min(Math.max(1, params.limit ?? TOPICS_PAGE_SIZE), 100);

  const supabase = createPublicSupabaseClient();
  let request = supabase
    .from("topics")
    .select(
      "id, topic, text, links, wikipedia_link, images, confidence, verdict, review_notes, researched_at",
      { count: "exact" },
    )
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (hideEmpty) {
    request = request.neq("text", "");
  }

  const searchFilter = buildSearchFilter(query);
  if (searchFilter) {
    request = request.or(searchFilter);
  }

  const { data, error, count } = await request;
  if (error) throw new Error(`Failed to list topics: ${error.message}`);

  const poolTotal = query
    ? await countTopics({ hideEmpty, query: "" })
    : (count ?? 0);

  return {
    topics: (data as TopicRow[] | null)?.map(mapRow) ?? [],
    total: count ?? 0,
    poolTotal,
    offset,
    limit,
  };
}

export const getTopicById = cache(async (id: string): Promise<Topic | undefined> => {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("topics")
    .select(
      "id, topic, text, links, wikipedia_link, images, confidence, verdict, review_notes, researched_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load topic ${id}: ${error.message}`);
  if (!data) return undefined;
  return mapRow(data as TopicRow);
});

export const getTopicStats = cache(async (): Promise<TopicStats> => {
  const supabase = createPublicSupabaseClient();

  const [totalResult, notesResult, verifiedResult] = await Promise.all([
    supabase.from("topics").select("id", { count: "exact", head: true }),
    supabase.from("topics").select("id", { count: "exact", head: true }).neq("text", ""),
    supabase
      .from("topics")
      .select("id", { count: "exact", head: true })
      .ilike("verdict", "verified"),
  ]);

  if (totalResult.error) {
    throw new Error(`Failed to load topic stats: ${totalResult.error.message}`);
  }

  return {
    total: totalResult.count ?? 0,
    withNotes: notesResult.count ?? 0,
    verified: verifiedResult.count ?? 0,
  };
});

export async function getTopicIds(): Promise<string[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("topics").select("id").order("id");
  if (error) throw new Error(`Failed to load topic ids: ${error.message}`);
  return (data ?? []).map((row) => String(row.id));
}
