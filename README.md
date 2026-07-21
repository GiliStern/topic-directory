# Topic Directory

Production-ready Next.js App Router app that loads research topics from CSV and serves searchable grid/table views plus markdown detail pages.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + `@tailwindcss/typography`
- `papaparse` for server-side CSV parsing
- `react-markdown` for topic notes
- `lucide-react`, `clsx`, `tailwind-merge`

## Data

Place the dataset at:

- `data/topics.csv` (preferred, server-loaded)
- or `public/data/topics.csv`

Expected columns: `id`, `topic`, `text`, `links`, `wikipedia link`, `Images`, `Confidence`, `Verdict`, `ReviewNotes`, `ResearchedAt`.

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

Connect the repository to Vercel. The app uses dynamic App Router pages (`force-dynamic`) and reads the CSV from the project filesystem at runtime, which works on Vercel Functions.
