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
