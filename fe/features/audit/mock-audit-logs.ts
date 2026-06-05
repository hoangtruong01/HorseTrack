export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export let mockAuditLogs: AuditLog[] = [
  {
    id: "al-1",
    action: "USER_LOGIN",
    performedBy: "admin@horsetrack.com",
    details: "Admin login demo entry",
    ipAddress: "192.168.1.10",
    createdAt: "2026-06-01T08:00:00Z",
  },
  {
    id: "al-2",
    action: "RACE_PUBLISHED",
    performedBy: "SYSTEM",
    details: "Race result publication demo entry",
    ipAddress: "127.0.0.1",
    createdAt: "2026-05-29T16:50:00Z",
  },
  {
    id: "al-3",
    action: "CASHOUT_PAID",
    performedBy: "counter@horsetrack.local",
    details: "Cashout paid demo entry",
    ipAddress: "192.168.1.10",
    createdAt: "2026-05-28T16:00:00Z",
  },
];

export function addAuditLog(action: string, performedBy: string, details: string) {
  const newAudit: AuditLog = {
    id: `al-${mockAuditLogs.length + 1}`,
    action,
    performedBy,
    details,
    ipAddress: "192.168.1.10",
    createdAt: new Date().toISOString(),
  };
  mockAuditLogs = [newAudit, ...mockAuditLogs];
  return newAudit;
}
