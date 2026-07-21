export type Topic = {
  id: string;
  topic: string;
  text: string;
  links: string;
  wikipediaLink: string;
  images: string;
  confidence: string;
  verdict: string;
  reviewNotes: string;
  researchedAt: string;
};

export type ViewMode = "grid" | "table";

export const TOPICS_PAGE_SIZE = 48;

export type TopicListResult = {
  topics: Topic[];
  /** Count matching hideEmpty + search */
  total: number;
  /** Count matching hideEmpty only (search pool) */
  poolTotal: number;
  offset: number;
  limit: number;
};

export type TopicStats = {
  total: number;
  withNotes: number;
  verified: number;
};
