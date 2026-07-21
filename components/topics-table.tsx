"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useCallback, useMemo, type UIEvent } from "react";
import DataGrid, { type Column, type RenderCellProps } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import type { Topic } from "@/lib/types";
import { ConfidenceBadge, VerdictBadge } from "@/components/badges";
import { formatDate } from "@/lib/utils";

type TopicsTableProps = {
  topics: Topic[];
  onLoadMore?: () => void;
  hasMore?: boolean;
};

function TopicCell({ row }: RenderCellProps<Topic>) {
  return (
    <Link
      href={`/topic/${row.id}`}
      className="block truncate font-medium text-stone-900 hover:text-teal-800 hover:underline"
      title={row.topic}
    >
      {row.topic}
    </Link>
  );
}

function ConfidenceCell({ row }: RenderCellProps<Topic>) {
  return <ConfidenceBadge confidence={row.confidence} />;
}

function VerdictCell({ row }: RenderCellProps<Topic>) {
  return <VerdictBadge verdict={row.verdict} />;
}

function ResearchedCell({ row }: RenderCellProps<Topic>) {
  return <span className="text-stone-600">{formatDate(row.researchedAt)}</span>;
}

function ActionsCell({ row }: RenderCellProps<Topic>) {
  return (
    <Link
      href={`/topic/${row.id}`}
      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:border-teal-700 hover:text-teal-800"
    >
      Open
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

const columns: readonly Column<Topic>[] = [
  {
    key: "id",
    name: "ID",
    width: 72,
    minWidth: 56,
    frozen: true,
    renderCell: ({ row }) => (
      <span className="font-mono text-xs text-stone-500">{row.id}</span>
    ),
  },
  {
    key: "topic",
    name: "Topic",
    width: 320,
    minWidth: 180,
    frozen: true,
    renderCell: TopicCell,
  },
  {
    key: "confidence",
    name: "Confidence",
    width: 120,
    minWidth: 100,
    renderCell: ConfidenceCell,
  },
  {
    key: "verdict",
    name: "Verdict",
    width: 140,
    minWidth: 110,
    renderCell: VerdictCell,
  },
  {
    key: "researchedAt",
    name: "Researched",
    width: 180,
    minWidth: 140,
    renderCell: ResearchedCell,
  },
  {
    key: "actions",
    name: "Actions",
    width: 110,
    minWidth: 96,
    renderCell: ActionsCell,
  },
];

function rowKeyGetter(row: Topic) {
  return row.id;
}

export function TopicsTable({ topics, onLoadMore, hasMore = false }: TopicsTableProps) {
  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!hasMore || !onLoadMore) return;
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      if (scrollTop + clientHeight >= scrollHeight - 240) {
        onLoadMore();
      }
    },
    [hasMore, onLoadMore],
  );

  const defaultColumnOptions = useMemo(
    () => ({
      resizable: true,
    }),
    [],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <DataGrid
        className="topics-data-grid rdg-light"
        columns={columns}
        rows={topics}
        rowKeyGetter={rowKeyGetter}
        defaultColumnOptions={defaultColumnOptions}
        rowHeight={52}
        headerRowHeight={44}
        onScroll={handleScroll}
        style={{ blockSize: "min(70vh, 720px)" }}
      />
    </div>
  );
}
