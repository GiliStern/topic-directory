import ReactMarkdown from "react-markdown";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content.trim()) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-sm text-stone-500">
        No markdown research content is available for this topic yet.
      </div>
    );
  }

  return (
    <article className="prose prose-stone max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-teal-700 prose-strong:text-stone-900">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}
