"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { AuditLogsViewer } from "@/features/wallet/components/audit-logs-viewer";
import { mockAuditLogs } from "@/features/audit/mock-audit-logs";

export default function AdminAuditLogsPage() {
  const [logs] = useState([...mockAuditLogs]);

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Security & Audit"
        title="Operations Audit Trail"
        description="Verify system log consistency, track referee results entries, automatic prize split distributions, and wallet redemptions."
      />
      <AuditLogsViewer logs={logs} />
    </main>
  );
}
