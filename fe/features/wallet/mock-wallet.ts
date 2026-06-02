export interface WalletTransaction {
  id: string;
  type:
    | "deposit"
    | "withdrawal_requested"
    | "withdrawal_approved"
    | "withdrawal_paid"
    | "withdrawal_rejected"
    | "prize_owner"
    | "prize_jockey"
    | "prediction_win"
    | "prediction_refund";
  amount: number; // in points
  description: string;
  createdAt: string;
  status: "pending" | "completed" | "failed" | "rejected";
}

export interface CashoutRequest {
  id: string;
  userId: string;
  userFullName: string;
  userRole: "Owner" | "Jockey" | "Spectator";
  points: number;
  redemptionCode: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  rejectReason?: string;
  createdAt: string;
  paidBy?: string;
  paidAt?: string;
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
  "user-owner-1": 15000, // points
  "user-jockey-1": 8500, // points
  "user-referee-1": 0,
  "user-spectator-1": 3200, // points
};

// Initial Mock transaction logs
export let mockTransactions: WalletTransaction[] = [
  {
    id: "tx-1",
    type: "deposit",
    amount: 10000,
    description: "Nhận điểm thưởng ban đầu từ hệ thống",
    createdAt: "2026-05-28T09:15:00Z",
    status: "completed",
  },
  {
    id: "tx-2",
    type: "prize_owner",
    amount: 7000,
    description: "Nhận chia sẻ phần thưởng giải đua (70%) - Ngựa Golden Stallion thắng Cuộc đua số 1",
    createdAt: "2026-05-29T16:45:00Z",
    status: "completed",
  },
  {
    id: "tx-3",
    type: "withdrawal_requested",
    amount: 2000,
    description: "Tạo yêu cầu đổi 2,000 điểm lấy phần thưởng (Mã: RWD-YHS9X3)",
    createdAt: "2026-05-30T10:00:00Z",
    status: "pending",
  },
  {
    id: "tx-4",
    type: "prize_jockey",
    amount: 3000,
    description: "Nhận chia sẻ phần thưởng nài ngựa (30%) - Điều khiển ngựa Golden Stallion",
    createdAt: "2026-05-29T16:45:00Z",
    status: "completed",
  },
  {
    id: "tx-5",
    type: "prediction_win",
    amount: 1200,
    description: "Dự đoán chính xác cuộc đua: Ngựa Golden Stallion về nhất Cuộc đua số 1",
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
    redemptionCode: "RWD-YHS9X3",
    status: "PENDING",
    createdAt: "2026-05-30T10:00:00Z",
  },
  {
    id: "co-2",
    userId: "user-jockey-1",
    userFullName: "Nguyễn Văn Hải",
    userRole: "Jockey",
    points: 5000,
    redemptionCode: "RWD-A8D1X2",
    status: "PAID",
    createdAt: "2026-05-28T14:30:00Z",
    paidBy: "admin@horsetrack.com",
    paidAt: "2026-05-28T16:00:00Z",
  },
  {
    id: "co-3",
    userId: "user-owner-1",
    userFullName: "Hoàng Trường",
    userRole: "Owner",
    points: 8000,
    redemptionCode: "RWD-F83S2A",
    status: "REJECTED",
    rejectReason: "Mã đã quá hạn quy đổi tại quầy hoặc không đủ điều kiện.",
    createdAt: "2026-05-27T08:00:00Z",
    paidBy: "admin@horsetrack.com",
    paidAt: "2026-05-27T09:15:00Z",
  },
];

// Initial mock audit logs
export let mockAuditLogs: AuditLog[] = [
  {
    id: "al-1",
    action: "USER_LOGIN",
    performedBy: "admin@horsetrack.com",
    details: "Quản trị viên đăng nhập thành công",
    ipAddress: "192.168.1.10",
    createdAt: "2026-06-01T08:00:00Z",
  },
  {
    id: "al-2",
    action: "RACE_PUBLISHED",
    performedBy: "admin@horsetrack.com",
    details: "Công bố kết quả Cuộc đua số 1. Ngựa Golden Stallion xếp thứ 1.",
    ipAddress: "192.168.1.10",
    createdAt: "2026-05-29T16:50:00Z",
  },
  {
    id: "al-3",
    action: "PRIZE_SPLIT",
    performedBy: "SYSTEM",
    details: "Phân bổ 70% phần thưởng (7000 điểm) cho Chủ ngựa Hoàng Trường và 30% (3000 điểm) cho Nài ngựa Nguyễn Văn Hải",
    ipAddress: "127.0.0.1",
    createdAt: "2026-05-29T16:51:00Z",
  },
  {
    id: "al-4",
    action: "CASHOUT_APPROVED",
    performedBy: "admin@horsetrack.com",
    details: "Duyệt mã đổi thưởng co-2 (5000 điểm) cho Nguyễn Văn Hải",
    ipAddress: "192.168.1.10",
    createdAt: "2026-05-28T16:00:00Z",
  },
  {
    id: "al-5",
    action: "CASHOUT_REJECTED",
    performedBy: "admin@horsetrack.com",
    details: "Từ chối mã đổi thưởng co-3 (8000 điểm) của Hoàng Trường: Mã quá hạn.",
    ipAddress: "192.168.1.10",
    createdAt: "2026-05-27T09:15:00Z",
  },
];

// Functions to manipulate data for UI responsiveness
export function addCashoutRequest(
  userId: string,
  userFullName: string,
  userRole: "Owner" | "Jockey" | "Spectator",
  points: number
) {
  // Check points balance
  const currentPoints = mockWalletBalances[userId] || 0;
  if (currentPoints < points) {
    throw new Error(`Số dư điểm không đủ. Hiện có: ${currentPoints}, cần: ${points}`);
  }

  // NOTE: Do not deduct points immediately! Points are deducted only when confirmed (PAID/APPROVED) by the staff at the counter.

  const redemptionCode = "RWD-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const newRequest: CashoutRequest = {
    id: `co-${mockCashoutRequests.length + 1}`,
    userId,
    userFullName,
    userRole,
    points,
    redemptionCode,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  mockCashoutRequests = [newRequest, ...mockCashoutRequests];

  // Add pending transaction
  const newTx: WalletTransaction = {
    id: `tx-${mockTransactions.length + 1}`,
    type: "withdrawal_requested",
    amount: points,
    description: `Tạo yêu cầu đổi ${points.toLocaleString()} điểm lấy quà. Mã quy đổi: ${redemptionCode}. Mang mã ra quầy để nhận.`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  mockTransactions = [newTx, ...mockTransactions];

  // Add audit log
  const newAudit: AuditLog = {
    id: `al-${mockAuditLogs.length + 1}`,
    action: "CASHOUT_REQUEST",
    performedBy: userFullName,
    details: `Tạo yêu cầu đổi ${points} điểm tại quầy. Mã quy đổi được tạo: ${redemptionCode}`,
    ipAddress: "192.168.1.105",
    createdAt: new Date().toISOString(),
  };
  mockAuditLogs = [newAudit, ...mockAuditLogs];

  return newRequest;
}

export function updateCashoutStatus(
  requestId: string,
  status: "APPROVED" | "PAID" | "REJECTED",
  adminEmail: string,
  rejectReason?: string
) {
  const requestIndex = mockCashoutRequests.findIndex((r) => r.id === requestId);
  if (requestIndex === -1) return null;

  const req = mockCashoutRequests[requestIndex];
  const previousStatus = req.status;
  req.status = status;
  if (rejectReason) req.rejectReason = rejectReason;

  if (status === "PAID" || status === "APPROVED") {
    req.paidBy = adminEmail;
    req.paidAt = new Date().toISOString();
  }

  // Deduct points only when transitioning to APPROVED or PAID (if not already deducted)
  if (previousStatus === "PENDING" && (status === "APPROVED" || status === "PAID")) {
    const currentPoints = mockWalletBalances[req.userId] || 0;
    if (currentPoints < req.points) {
      req.status = "REJECTED";
      req.rejectReason = "Người dùng không đủ số dư điểm tại thời điểm xác nhận.";
      // Mark transaction as failed
      const txIndex = mockTransactions.findIndex(
        (t) =>
          t.type === "withdrawal_requested" &&
          t.amount === req.points &&
          t.description.includes(req.redemptionCode)
      );
      if (txIndex !== -1) {
        mockTransactions[txIndex].status = "rejected";
        mockTransactions[txIndex].description += " (Thất bại: Không đủ điểm)";
      }
      return req;
    }

    // Actually deduct points
    mockWalletBalances[req.userId] -= req.points;
  }

  // Update transaction status
  const txIndex = mockTransactions.findIndex(
    (t) =>
      t.type === "withdrawal_requested" &&
      t.amount === req.points &&
      t.description.includes(req.redemptionCode)
  );
  if (txIndex !== -1) {
    if (status === "APPROVED" || status === "PAID") {
      mockTransactions[txIndex].status = "completed";
      mockTransactions[txIndex].description = `Đã nhận quà quy đổi từ ${req.points.toLocaleString()} điểm thưởng (Mã: ${req.redemptionCode}).`;
    }
    if (status === "REJECTED") {
      mockTransactions[txIndex].status = "rejected";
      mockTransactions[txIndex].description = `Yêu cầu đổi thưởng bị từ chối (Mã: ${req.redemptionCode}). Lý do: ${rejectReason || "Không xác định"}`;
    }
  }

  // If rejected after being APPROVED, refund points
  if (status === "REJECTED" && previousStatus === "APPROVED") {
    mockWalletBalances[req.userId] += req.points;

    // Add refund transaction
    const newTx: WalletTransaction = {
      id: `tx-${mockTransactions.length + 1}`,
      type: "prediction_refund",
      amount: req.points,
      description: `Hoàn trả ${req.points.toLocaleString()} điểm do yêu cầu đổi thưởng mã ${req.redemptionCode} bị hủy sau khi duyệt`,
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
    details: `${status === "PAID" ? "Xác nhận đã nhận thưởng" : status === "APPROVED" ? "Duyệt yêu cầu" : "Từ chối yêu cầu"} mã đổi thưởng ${req.redemptionCode} của ${req.userFullName}. Điểm: ${req.points}.${rejectReason ? ` Lý do: ${rejectReason}` : ""}`,
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
