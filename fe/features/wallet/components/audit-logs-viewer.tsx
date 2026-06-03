"use client";

import { Shield, Terminal } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AuditLog } from "../mock-wallet";

export type AuditLogsViewerProps = {
  logs: AuditLog[];
};

export function AuditLogsViewer({ logs }: AuditLogsViewerProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => {
    const actionLabel = t(`pages.admin.auditViewer.actions.${log.action}`, {
      defaultValue: log.action,
    });
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actionLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const performerLabel = (performedBy: string) => {
    if (performedBy === "SYSTEM") {
      return t("pages.admin.auditViewer.systemUser");
    }
    return performedBy;
  };

  return (
    <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/95 bg-card p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
            <Shield className="size-4" /> {t("pages.admin.auditViewer.eyebrow")}
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase dark:text-white text-foreground">
            {t("pages.admin.auditViewer.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("pages.admin.auditViewer.description")}
          </p>
        </div>
      </div>

      <div className="relative mt-6">
        <Terminal className="absolute top-1/2 left-4 size-4 -translate-y-1/2 dark:text-white/40 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("pages.admin.auditViewer.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 w-full rounded-full border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 pl-11 pr-6 text-sm dark:text-white text-foreground outline-none placeholder:dark:text-white/40 text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border dark:border-white/10 border-border">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            {t("pages.admin.auditViewer.empty")}
          </div>
        ) : (
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="dark:bg-white/[0.04] bg-muted/50 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">{t("pages.admin.auditViewer.colAction")}</th>
                <th className="px-4 py-3.5">{t("pages.admin.auditViewer.colUser")}</th>
                <th className="px-4 py-3.5">{t("pages.admin.auditViewer.colDetails")}</th>
                <th className="px-4 py-3.5">{t("pages.admin.auditViewer.colIp")}</th>
                <th className="px-4 py-3.5">{t("pages.admin.auditViewer.colTime")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:bg-black/5 bg-muted/20 font-mono text-xs">
              {filteredLogs.map((log) => {
                let badgeColor = "dark:text-white/70 text-muted-foreground dark:bg-white/5 bg-muted/50 dark:border-white/10 border-border";
                if (log.action.includes("APPROVED") || log.action.includes("PAID") || log.action.includes("PUBLISHED") || log.action.includes("PRIZE")) {
                  badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                } else if (log.action.includes("REJECTED") || log.action.includes("BAN")) {
                  badgeColor = "text-primary bg-primary/10 border-primary/20";
                } else if (log.action.includes("REQUEST")) {
                  badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                }

                return (
                  <tr key={log.id} className="transition hover:dark:bg-white/[0.02] bg-muted/50">
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 font-black uppercase tracking-wider text-[10px] ${badgeColor}`}>
                        {t(`pages.admin.auditViewer.actions.${log.action}`, {
                          defaultValue: log.action,
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-4 dark:text-white/95 text-muted-foreground font-semibold">
                      {performerLabel(log.performedBy)}
                    </td>
                    <td className="px-4 py-4 dark:text-white/70 text-muted-foreground font-semibold leading-relaxed max-w-sm whitespace-pre-wrap">
                      {log.details}
                    </td>
                    <td className="px-4 py-4 dark:text-white/40 text-muted-foreground">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-4 dark:text-white/60 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
