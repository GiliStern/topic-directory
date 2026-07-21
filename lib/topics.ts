import { readFileSync } from "fs";
import path from "path";
import { cache } from "react";
import Papa from "papaparse";
import type { Topic } from "@/lib/types";

type CsvRow = Record<string, string | undefined>;

function normalizeKey(key: string): string {
  return key.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function getField(row: CsvRow, ...candidates: string[]): string {
  const normalized = new Map<string, string>();

  for (const [key, value] of Object.entries(row)) {
    if (!key.trim()) continue;
    normalized.set(normalizeKey(key), value?.trim() ?? "");
  }

  for (const candidate of candidates) {
    const value = normalized.get(normalizeKey(candidate));
    if (value !== undefined && value !== "") return value;
  }

  for (const candidate of candidates) {
    const value = normalized.get(normalizeKey(candidate));
    if (value !== undefined) return value;
  }

  return "";
}

function mapRow(row: CsvRow): Topic | null {
  const id = getField(row, "id");
  const topic = getField(row, "topic");

  if (!id || !topic) return null;

  return {
    id,
    topic,
    text: getField(row, "text"),
    links: getField(row, "links", "links "),
    wikipediaLink: getField(row, "wikipedia link", "wikipediaLink", "wikipedia"),
    images: getField(row, "Images", "images"),
    confidence: getField(row, "Confidence", "confidence"),
    verdict: getField(row, "Verdict", "verdict"),
    reviewNotes: getField(row, "ReviewNotes", "reviewNotes", "review notes"),
    researchedAt: getField(row, "ResearchedAt", "researchedAt", "researched at"),
  };
}

function resolveCsvPath(): string {
  const candidates = [
    path.join(process.cwd(), "data", "topics.csv"),
    path.join(process.cwd(), "public", "data", "topics.csv"),
  ];

  for (const candidate of candidates) {
    try {
      readFileSync(candidate, "utf8");
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    "topics.csv not found. Expected data/topics.csv or public/data/topics.csv",
  );
}

function stripLeadingBlankLines(csv: string): string {
  const lines = csv.split(/\r?\n/);
  while (lines.length > 0) {
    const candidate = lines[0]?.replace(/,/g, "").trim() ?? "";
    if (candidate.length === 0) {
      lines.shift();
      continue;
    }
    break;
  }
  return lines.join("\n");
}

function parseTopicsFromCsv(csv: string): Topic[] {
  const normalizedCsv = stripLeadingBlankLines(csv);
  const parsed = Papa.parse<CsvRow>(normalizedCsv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim(),
  });

  if (parsed.errors.length > 0) {
    const fatal = parsed.errors.filter((error) => error.type === "FieldMismatch");
    if (fatal.length > 0) {
      console.warn("CSV parse warnings:", fatal.slice(0, 3));
    }
  }

  const topics: Topic[] = [];

  for (const row of parsed.data) {
    const mapped = mapRow(row);
    if (mapped) topics.push(mapped);
  }

  return topics;
}

export const getTopics = cache(async (): Promise<Topic[]> => {
  const csvPath = resolveCsvPath();
  const csv = readFileSync(csvPath, "utf8");
  return parseTopicsFromCsv(csv);
});

export const getTopicById = cache(async (id: string): Promise<Topic | undefined> => {
  const topics = await getTopics();
  return topics.find((topic) => topic.id === id);
});

export async function getTopicIds(): Promise<string[]> {
  const topics = await getTopics();
  return topics.map((topic) => topic.id);
}
