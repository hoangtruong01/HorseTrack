"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export interface DataTablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function DataTablePagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = "",
}: DataTablePaginationProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith("vi") ?? true;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= 0) return null;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 pb-2 border-t border-border/60 ${className}`}>
      <div className="text-xs text-muted-foreground">
        {isVi ? (
          <>
            Hiển thị <span className="font-bold text-foreground">{startIndex + 1}</span> - <span className="font-bold text-foreground">{endIndex}</span> trong tổng số <span className="font-bold text-foreground">{totalItems}</span> mục
          </>
        ) : (
          <>
            Showing <span className="font-bold text-foreground">{startIndex + 1}</span> - <span className="font-bold text-foreground">{endIndex}</span> of <span className="font-bold text-foreground">{totalItems}</span> items
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-8 px-2.5 text-xs font-semibold"
          >
            <ChevronLeft className="size-3.5 mr-1" />
            {isVi ? "Trang trước" : "Previous"}
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`size-8 rounded-lg text-xs font-bold transition ${currentPage === pageNum
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-8 px-2.5 text-xs font-semibold"
          >
            {isVi ? "Trang sau" : "Next"}
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
