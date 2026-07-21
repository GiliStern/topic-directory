import { ExternalLink, Globe } from "lucide-react";
import { getLinksMetadata, type LinkMetadata } from "@/lib/link-metadata";
import { hostnameFromUrl } from "@/lib/utils";

type LinkPreviewCardProps = {
  meta: LinkMetadata;
  isWikipedia?: boolean;
};

function LinkPreviewCard({ meta, isWikipedia }: LinkPreviewCardProps) {
  const host = meta.hostname || hostnameFromUrl(meta.url);
  const title = meta.title || host;

  return (
    <a
      href={meta.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-teal-700/40 hover:shadow-sm"
    >
      {meta.image ? (
        <div className="relative w-[7.25rem] shrink-0 self-stretch bg-stone-100 sm:w-36">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary third-party OG hosts */}
          <img
            src={meta.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="flex w-14 shrink-0 items-start justify-center bg-teal-50/80 pt-4 sm:w-16">
          <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
            <Globe className="h-4 w-4" aria-hidden />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-start gap-2">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-stone-900">
            {title}
          </p>
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400 transition group-hover:text-teal-700" />
        </div>
        <p className="mt-1 truncate text-xs text-stone-500">
          {isWikipedia ? "Wikipedia · " : ""}
          {host}
        </p>
        {meta.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-600">
            {meta.description}
          </p>
        ) : (
          <p className="mt-2 line-clamp-2 break-all text-xs leading-relaxed text-stone-600">
            {meta.url}
          </p>
        )}
      </div>
    </a>
  );
}

export function LinkPreviewsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex h-[7.5rem] overflow-hidden rounded-xl border border-stone-200 bg-white"
        >
          <div className="w-[7.25rem] shrink-0 animate-pulse bg-stone-100 sm:w-36" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-stone-100" />
            <div className="mt-1 h-3 w-full animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

type LinkPreviewsProps = {
  links: string[];
  wikipediaLinks?: string[];
};

export async function LinkPreviews({
  links,
  wikipediaLinks = [],
}: LinkPreviewsProps) {
  const wikipediaSet = new Set(wikipediaLinks);
  const unique = Array.from(new Set([...wikipediaLinks, ...links]));

  if (unique.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
        No external links recorded for this topic.
      </p>
    );
  }

  const metadata = await getLinksMetadata(unique);
  const byUrl = new Map(metadata.map((item) => [item.url, item]));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {unique.map((url) => {
        const meta = byUrl.get(url) ?? {
          url,
          title: hostnameFromUrl(url),
          hostname: hostnameFromUrl(url),
        };

        return (
          <LinkPreviewCard
            key={url}
            meta={meta}
            isWikipedia={wikipediaSet.has(url)}
          />
        );
      })}
    </div>
  );
}
