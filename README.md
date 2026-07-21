# Topic Directory

Next.js App Router app that loads research topics from Supabase and serves a searchable, virtualized grid/table plus markdown detail pages.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres) for topic storage
- Tailwind CSS + `@tailwindcss/typography`
- `@tanstack/react-virtual` for windowed lists
- `react-markdown` for topic notes
- `lucide-react`, `clsx`, `tailwind-merge`

## Data

Topics live in the Supabase `public.topics` table (columns: `id`, `topic`, `text`, `links`, `wikipedia_link`, `images`, `confidence`, `verdict`, `review_notes`, `researched_at`).

Required env vars (see `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The home page SSR-loads the first page of topics; `/api/topics` handles paginated search across the full archive.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Deploy on Vercel

Connect the repository to Vercel and set the Supabase env vars for the project.
