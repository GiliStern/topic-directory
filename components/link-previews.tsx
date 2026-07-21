import { ExternalLink, Globe } from "lucide-react";
import { hostnameFromUrl } from "@/lib/utils";

type LinkPreviewCardProps = {
  url: string;
  label?: string;
};

export function LinkPreviewCard({ url, label }: LinkPreviewCardProps) {
  const host = hostnameFromUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 transition hover:border-teal-700/40 hover:shadow-sm"
    >
      <div className="mt-0.5 rounded-lg bg-teal-50 p-2 text-teal-700">
        <Globe className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-stone-900">
            {label ?? host}
          </p>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-stone-400 transition group-hover:text-teal-700" />
        </div>
        <p className="mt-1 truncate text-xs text-stone-500">{host}</p>
        <p className="mt-2 line-clamp-2 break-all text-xs leading-relaxed text-stone-600">
          {url}
        </p>
      </div>
    </a>
  );
}

type LinkPreviewsProps = {
  links: string[];
  wikipediaLinks?: string[];
};

export function LinkPreviews({ links, wikipediaLinks = [] }: LinkPreviewsProps) {
  const wikipediaSet = new Set(wikipediaLinks);
  const unique = Array.from(new Set([...wikipediaLinks, ...links]));

  if (unique.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
        No external links recorded for this topic.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {unique.map((url) => (
        <LinkPreviewCard
          key={url}
          url={url}
          label={wikipediaSet.has(url) ? "Wikipedia" : undefined}
        />
      ))}
    </div>
  );
}
