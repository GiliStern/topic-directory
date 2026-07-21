import { cache } from "react";
import { hostnameFromUrl } from "@/lib/utils";

export type LinkMetadata = {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hostname: string;
};

const FETCH_TIMEOUT_MS = 4500;
const MAX_HTML_BYTES = 512_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; TopicDirectoryBot/1.0; +https://localhost) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    );
}

function absolutizeUrl(baseUrl: string, maybeRelative: string): string | undefined {
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function extractMetaContent(html: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
        "i",
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
        "i",
      ),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]?.trim()) {
        return decodeHtmlEntities(match[1].trim());
      }
    }
  }
  return undefined;
}

function extractTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!match?.[1]?.trim()) return undefined;
  return decodeHtmlEntities(match[1].trim());
}

function fallbackMetadata(url: string): LinkMetadata {
  return {
    url,
    title: hostnameFromUrl(url),
    hostname: hostnameFromUrl(url),
  };
}

async function fetchLinkMetadataUncached(url: string): Promise<LinkMetadata> {
  const fallback = fallbackMetadata(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return fallback;

    const contentType = response.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      return fallback;
    }

    const reader = response.body?.getReader();
    if (!reader) return fallback;

    const decoder = new TextDecoder("utf-8", { fatal: false });
    let html = "";
    let bytes = 0;

    while (bytes < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      bytes += value.byteLength;
      html += decoder.decode(value, { stream: true });
      // Enough head content for meta tags; stop early.
      if (html.includes("</head>") || html.length > 120_000) break;
    }

    try {
      await reader.cancel();
    } catch {
      // ignore cancel errors
    }

    const finalUrl = response.url || url;
    const title =
      extractMetaContent(html, ["og:title", "twitter:title"]) ??
      extractTitleTag(html) ??
      fallback.title;
    const description = extractMetaContent(html, [
      "og:description",
      "twitter:description",
      "description",
    ]);
    const rawImage = extractMetaContent(html, [
      "og:image:secure_url",
      "og:image",
      "twitter:image",
      "twitter:image:src",
    ]);
    const image = rawImage ? absolutizeUrl(finalUrl, rawImage) : undefined;

    return {
      url,
      title: title.slice(0, 200),
      description: description?.slice(0, 280),
      image,
      hostname: hostnameFromUrl(finalUrl),
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

/** Deduped per-request cache for identical URLs on a page. */
export const getLinkMetadata = cache(fetchLinkMetadataUncached);

export async function getLinksMetadata(urls: string[]): Promise<LinkMetadata[]> {
  const unique = Array.from(new Set(urls));
  return Promise.all(unique.map((url) => getLinkMetadata(url)));
}
