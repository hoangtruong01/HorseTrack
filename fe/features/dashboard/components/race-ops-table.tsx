"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, RefreshCw, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import type { RaceItem } from "@/lib/api-client";

export type RaceOpsTableProps = {
  races: RaceItem[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

type SortKey = "name" | "status" | "startTime";
type SortDir = "asc" | "desc";

// Define general ordering based on status importance
const statusOrder: Record<string, number> = {
  LIVE: 0,
  READY: 1,
  CHECKING: 2,
  SCHEDULED: 3,
  FINISHED: 4,
  RESULT_PUBLISHED: 5,
  CANCELLED: 6,
};

const getStatusBadge = (status: string) => {
  const s = status.toUpperCase();
  if (s === "LIVE") {
    return { label: "LIVE", className: "border-red-500/30 bg-red-500/15 text-red-400" };
  }
  if (["SCHEDULED", "READY", "CHECKING"].includes(s)) {
    return { label: "SẮP ĐẾN", className: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300" };
  }
  if (s === "CANCELLED") {
    return { label: "ĐÃ HỦY", className: "border-red-400/30 bg-red-400/10 text-red-300 opacity-60" };
  }
  return { label: "XONG", className: "border-border bg-muted/50 text-muted-foreground" };
};

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (column !== sortKey) {
    return <ArrowUpDown className="size-3 opacity-40" />;
  }
  return sortDir === "asc" ? (
    <ArrowUp className="size-3 text-primary" />
  ) : (
    <ArrowDown className="size-3 text-primary" />
  );
}

export function RaceOpsTable({ races, isLoading, error, onRefresh }: RaceOpsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...races].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "status") {
      const orderA = statusOrder[a.status.toUpperCase()] ?? 99;
      const orderB = statusOrder[b.status.toUpperCase()] ?? 99;
      cmp = orderA - orderB;
    } else if (sortKey === "startTime") {
      cmp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    } else {
      cmp = a.name.localeCompare(b.name, "vi");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const thClass =
    "px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground select-none";
  const thSortClass = cn(thClass, "cursor-pointer hover:text-foreground transition-colors duration-100");

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Vận hành cuộc đua</h2>
          {isLoading && <RefreshCw className="size-3.5 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          )}
          <Link
            href="/admin/races"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Xem tất cả
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto flex-1">
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="size-6 text-red-400 mb-2" />
            <p className="text-sm text-red-400 font-medium">Lỗi tải dữ liệu</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : races.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Info className="size-6 mb-2 opacity-50" />
            <p className="text-sm">Không có cuộc đua nào.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>
                <th className={thSortClass} onClick={() => handleSort("name")}>
                  <span className="inline-flex items-center gap-1.5">
                    Tên cuộc đua
                    <SortIcon column="name" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th className={thSortClass} onClick={() => handleSort("status")}>
                  <span className="inline-flex items-center gap-1.5">
                    Trạng thái
                    <SortIcon column="status" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th className={thSortClass} onClick={() => handleSort("startTime")}>
                  <span className="inline-flex items-center gap-1.5">
                    Thời gian
                    <SortIcon column="startTime" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th className={thClass}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && races.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-xs text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                sorted.map((race) => {
                  const badge = getStatusBadge(race.status);
                  const isLive = race.status.toUpperCase() === "LIVE";
                  const tournamentName =
                    typeof race.tournamentId === "object"
                      ? race.tournamentId.name
                      : "Giải đấu ẩn";

                  return (
                    <tr
                      key={race._id}
                      className="transition-colors duration-100 hover:bg-muted/20"
                    >
                      {/* Race Name */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {isLive && (
                            <span
                              className="size-1.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_6px_rgba(225,6,0,0.8)] animate-pulse"
                              aria-label="Live"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {race.name}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {tournamentName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border",
                            badge.className,
                          )}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Start Time */}
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(race.startTime), "HH:mm - dd/MM/yyyy")}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/races/${race._id}`}
                          className="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold border border-border bg-muted/50 text-foreground transition-colors duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        >
                          Xem
                          <ExternalLink className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
