"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AuditLogsViewer } from "@/features/wallet/components/audit-logs-viewer";
import { mockAuditLogs } from "@/features/wallet/mock-wallet";

export default function AdminAuditLogsPage() {
  const { t } = useTranslation();
  const [logs] = useState([...mockAuditLogs]);

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <AuditLogsViewer logs={logs} />
    </main>
  );
}
