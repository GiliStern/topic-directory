import { FileQuestion } from "lucide-react";

type EmptyStateProps = {
  query: string;
  hideEmpty?: boolean;
};

export function EmptyState({ query, hideEmpty = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-stone-100 p-3 text-stone-500">
        <FileQuestion className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="font-display text-xl text-stone-900">No topics found</h2>
      <p className="mt-2 max-w-md text-sm text-stone-600">
        {query ? (
          <>
            Nothing matched{" "}
            <span className="font-medium text-stone-800">&ldquo;{query}&rdquo;</span>.
            Try a different keyword, verdict, or note fragment
            {hideEmpty ? ", or show empty items." : "."}
          </>
        ) : hideEmpty ? (
          <>No topics with research notes. Uncheck &ldquo;Hide empty items&rdquo; to see all topics.</>
        ) : (
          <>No topics available.</>
        )}
      </p>
    </div>
  );
}
