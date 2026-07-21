import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-800">404</p>
      <h1 className="mt-3 font-display text-3xl text-stone-900">Topic not found</h1>
      <p className="mt-3 text-sm text-stone-600">
        That topic id is missing from the CSV dataset.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        Back to topics
      </Link>
    </main>
  );
}
