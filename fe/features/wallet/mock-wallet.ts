export interface WalletTransaction {
  id: string;
  type: "deposit" | "withdrawal_requested" | "withdrawal_approved" | "withdrawal_paid" | "withdrawal_rejected" | "prize_owner" | "prize_jockey" | "prediction_win" | "prediction_refund";
  amount: number; // in points
  amountVnd: number;
  description: string;
  createdAt: string;
  status: "pending" | "completed" | "failed" | "rejected";
}

export interface CashoutRequest {
  id: string;
  userId: string;
  userFullName: string;
  userRole: "Owner" | "Jockey";
  points: number;
  amountVnd: number;
  bankAccount: string;
  bankName: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  rejectReason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

// Initial Mock Wallet balances for users
export const mockWalletBalances: Record<string, number> = {
  "user-owner-1": 15000, // in points -> 1.5M VND
  "user-jockey-1": 8500,  // in points -> 850k VND
  "user-referee-1": 0,
  "user-spectator-1": 3200, // 320k VND
};

// Initial Mock transaction logs
export let mockTransactions: WalletTransaction[] = [
  {
    id: "tx-1",
    type: "deposit",
    amount: 10000,
    amountVnd: 1000000,
    description: "Deposit via bank transfer simulation",
    createdAt: "2026-05-28T09:15:00Z",
    status: "completed",
  },
  {
    id: "tx-2",
    type: "prize_owner",
    amount: 7000,
    amountVnd: 700000,
    description: "Winner prize split (70%) - Golden Stallion in Race #1",
    createdAt: "2026-05-29T16:45:00Z",
    status: "completed",
  },
  {
    id: "tx-3",
    type: "withdrawal_requested",
    amount: 2000,
    amountVnd: 200000,
    description: "Redeemed 2,000 reward points (Cashout)",
    createdAt: "2026-05-30T10:00:00Z",
    status: "pending",
  },
  {
    id: "tx-4",
    type: "prize_jockey",
    amount: 3000,
    amountVnd: 300000,
    description: "Winner prize split (30%) - Jockey assignment for Golden Stallion",
    createdAt: "2026-05-29T16:45:00Z",
    status: "completed",
  },
  {
    id: "tx-5",
    type: "prediction_win",
    amount: 1200,
    amountVnd: 120000,
    description: "Prediction payout: Golden Stallion in Race #1",
    createdAt: "2026-05-29T17:00:00Z",
    status: "completed",
  },
];

// Initial mock cashout requests
export let mockCashoutRequests: CashoutRequest[] = [
  {
    id: "co-1",
    userId: "user-owner-1",
    userFullName: "Hoàng Trường",
    userRole: "Owner",
    points: 2000,
    amountVnd: 200000,
    bankAccount: "1028374659",
    bankName: "Vietcombank",
    status: "PENDING",
    createdAt: "2026-05-30T10:00:00Z",
  },
  {
    id: "co-2",
    userId: "user-jockey-1",
    userFullName: "Nguyễn Văn Hải",
    userRole: "Jockey",
    points: 5000,
    amountVnd: 500000,
    bankAccount: "190283748293",
    bankName: "Techcombank",
    status: "PAID",
    createdAt: "2026-05-28T14:30:00Z",
  },
  {
    id: "co-3",
    userId: "user-owner-1",
    userFullName: "Hoàng Trường",
    userRole: "Owner",
    points: 8000,
    amountVnd: 800000,
    bankAccount: "1028374659",
    bankName: "Vietcombank",
    status: "REJECTED",
    rejectReason: "Incorrect bank details provided.",
    createdAt: "2026-05-27T08:00:00Z",
  },
];

// Initial mock audit logs
export let mockAuditLogs: AuditLog[] = [
  {
    id: "al-1",
    action: "USER_LOGIN",
    performedBy: "admin@horsetrack.com",
    details: "Administrator logged in successfully",
    ipAddress: "192.168.1.10",
    createdAt: "2026-06-01T08:00:00Z",
  },
  {
    id: "al-2",
    action: "RACE_PUBLISHED",
    performedBy: "admin@horsetrack.com",
    details: "Published results for Race #1. Golden Stallion ranked 1st.",
    ipAddress: "192.168.1.10",
    createdAt: "2026-05-29T16:50:00Z",
  },
  {
    id: "al-3",
    action: "PRIZE_SPLIT",
    performedBy: "SYSTEM",
    details: "Allocated 70% prize (7000 pts) to Owner Hoàng Trường and 30% (3000 pts) to Jockey Nguyễn Văn Hải",
    ipAddress: "127.0.0.1",
    createdAt: "2026-05-29T16:51:00Z",
  },
  {
    id: "al-4",
    action: "CASHOUT_APPROVED",
    performedBy: "admin@horsetrack.com",
    details: "Approved Cashout Request co-2 (5000 pts) for Nguyễn Văn Hải",
    ipAddress: "192.168.1.10",
    createdAt: "2026-05-28T16:00:00Z",
  },
  {
    id: "al-5",
    action: "CASHOUT_REJECTED",
    performedBy: "admin@horsetrack.com",
    details: "Rejected Cashout Request co-3 (8000 pts) for Hoàng Trường: Incorrect bank details provided.",
    ipAddress: "192.168.1.10",
    createdAt: "2026-05-27T09:15:00Z",
  },
];

// Functions to manipulate data for UI responsiveness
export function addCashoutRequest(userId: string, userFullName: string, userRole: "Owner" | "Jockey", points: number, bankAccount: string, bankName: string) {
  const amountVnd = points * 100;
  
  // Deduct points from balance (if exists)
  if (mockWalletBalances[userId] !== undefined) {
    mockWalletBalances[userId] -= points;
  }
  
  const newRequest: CashoutRequest = {
    id: `co-${mockCashoutRequests.length + 1}`,
    userId,
    userFullName,
    userRole,
    points,
    amountVnd,
    bankAccount,
    bankName,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  mockCashoutRequests = [newRequest, ...mockCashoutRequests];

  // Add transaction
  const newTx: WalletTransaction = {
    id: `tx-${mockTransactions.length + 1}`,
    type: "withdrawal_requested",
    amount: points,
    amountVnd,
    description: `Redeemed ${points.toLocaleString()} reward points (Cashout)`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  mockTransactions = [newTx, ...mockTransactions];

  // Add audit log
  const newAudit: AuditLog = {
    id: `al-${mockAuditLogs.length + 1}`,
    action: "CASHOUT_REQUEST",
    performedBy: userFullName,
    details: `Requested cashout of ${points} pts to ${bankName} account ${bankAccount}`,
    ipAddress: "192.168.1.105",
    createdAt: new Date().toISOString(),
  };
  mockAuditLogs = [newAudit, ...mockAuditLogs];

  return newRequest;
}

export function updateCashoutStatus(requestId: string, status: "APPROVED" | "PAID" | "REJECTED", adminEmail: string, rejectReason?: string) {
  const requestIndex = mockCashoutRequests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) return null;

  const req = mockCashoutRequests[requestIndex];
  req.status = status;
  if (rejectReason) req.rejectReason = rejectReason;

  // Update transaction status
  const txIndex = mockTransactions.findIndex(t => t.type === "withdrawal_requested" && t.amount === req.points && t.createdAt.substring(0, 16) === req.createdAt.substring(0, 16));
  if (txIndex !== -1) {
    if (status === "APPROVED") mockTransactions[txIndex].status = "completed"; // Mock-only shortcut
    if (status === "PAID") mockTransactions[txIndex].status = "completed";
    if (status === "REJECTED") mockTransactions[txIndex].status = "rejected";
  }

  // If rejected, refund points to user
  if (status === "REJECTED") {
    if (mockWalletBalances[req.userId] !== undefined) {
      mockWalletBalances[req.userId] += req.points;
    }

    // Add refund transaction
    const newTx: WalletTransaction = {
      id: `tx-${mockTransactions.length + 1}`,
      type: "prediction_refund", // Shortcut for refund type
      amount: req.points,
      amountVnd: req.amountVnd,
      description: `Refunded ${req.points.toLocaleString()} pts due to rejected cashout`,
      createdAt: new Date().toISOString(),
      status: "completed",
    };
    mockTransactions = [newTx, ...mockTransactions];
  }

  // Add audit log
  const newAudit: AuditLog = {
    id: `al-${mockAuditLogs.length + 1}`,
    action: `CASHOUT_${status}`,
    performedBy: adminEmail,
    details: `${status} Cashout Request ${requestId} for ${req.userFullName}. Points: ${req.points}.${rejectReason ? ` Reason: ${rejectReason}` : ""}`,
    ipAddress: "192.168.1.10",
    createdAt: new Date().toISOString(),
  };
  mockAuditLogs = [newAudit, ...mockAuditLogs];

  return req;
}

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
