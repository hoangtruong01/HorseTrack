"use client";

import { Shield, Terminal } from "lucide-react";
import { useState } from "react";

import type { AuditLog } from "../mock-wallet";

export type AuditLogsViewerProps = {
  logs: AuditLog[];
};

export function AuditLogsViewer({ logs }: AuditLogsViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
            <Shield className="size-4" /> System Audit Trail
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">
            System Operations Logs
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Immutably tracked security activities, prize disbursements, result publishing, and administrative queue approvals.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mt-6">
        <Terminal className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Filter audit entries by action, user or details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 w-full rounded-full border border-white/10 bg-black/25 pl-11 pr-6 text-sm text-white outline-none placeholder:text-white/40 focus:border-primary"
        />
      </div>

      {/* Audit List */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No system operations entries found matching the query.
          </div>
        ) : (
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Action Event</th>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Activity Details</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black/5 font-mono text-xs">
              {filteredLogs.map((log) => {
                let badgeColor = "text-white/70 bg-white/5 border-white/10";
                if (log.action.includes("APPROVED") || log.action.includes("PAID") || log.action.includes("PUBLISHED") || log.action.includes("PRIZE")) {
                  badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                } else if (log.action.includes("REJECTED") || log.action.includes("BAN")) {
                  badgeColor = "text-primary bg-primary/10 border-primary/20";
                } else if (log.action.includes("REQUEST")) {
                  badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                }

                return (
                  <tr key={log.id} className="transition hover:bg-white/[0.02]">
                    {/* Action */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 font-black uppercase tracking-wider text-[10px] ${badgeColor}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Performed By */}
                    <td className="px-4 py-4 text-white/95 font-semibold">
                      {log.performedBy}
                    </td>

                    {/* Details */}
                    <td className="px-4 py-4 text-white/70 font-semibold leading-relaxed max-w-sm whitespace-pre-wrap">
                      {log.details}
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-4 text-white/40">
                      {log.ipAddress}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-white/60">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
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
