import type { CashoutItem, WalletTxItem, LedgerEntryItem } from "@/lib/api-client";

export type WalletUiTransaction = {
  id: string;
  type:
    | "deposit"
    | "withdrawal_requested"
    | "withdrawal_approved"
    | "withdrawal_paid"
    | "withdrawal_rejected"
    | "withdrawal_refund"
    | "prize_owner"
    | "prize_jockey"
    | "prediction_win"
    | "prediction_refund"
    | "salary_bonus";
  amount: number;
  description: string;
  createdAt: string;
  status: "pending" | "completed" | "failed" | "rejected";
};

export type CashoutQueueRequest = {
  id: string;
  userId: string;
  userFullName: string;
  userRole: "Owner" | "Jockey" | "Spectator";
  points: number;
  redemptionCode: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED" | "FAILED";
  rejectReason?: string;
  rejectedBy?: string;
  createdAt: string;
  paidBy?: string;
  paidAt?: string;
};

export function mapWalletTransaction(tx: WalletTxItem): WalletUiTransaction {
  let type: WalletUiTransaction["type"] = "deposit";

  if (tx.type === "PRIZE_EARNING" || tx.type === "RACE_WIN_REWARD") {
    type = "prize_owner";
  } else if (tx.type === "PREDICTION_REWARD") {
    type = tx.points >= 0 ? "prediction_win" : "prediction_refund";
  } else if (tx.type === "REWARD_CASHOUT" || tx.type === "POINT_REDEMPTION") {
    if (tx.status === "PENDING") type = "withdrawal_requested";
    else if (tx.status === "SUCCESS") type = "withdrawal_paid";
    else type = "withdrawal_rejected";
  }

  const codeMatch = tx.description?.match(/RWD-[A-Z0-9]+/);
  const cashoutDescription =
    type === "withdrawal_requested"
      ? `Yeu cau doi thuong${codeMatch ? ` (Ma: ${codeMatch[0]})` : ""}`
      : type === "withdrawal_paid"
        ? `Da doi thuong thanh cong${codeMatch ? ` (Ma: ${codeMatch[0]})` : ""}`
        : type === "withdrawal_rejected"
          ? `Yeu cau doi thuong bi tu choi${codeMatch ? ` (Ma: ${codeMatch[0]})` : ""}`
          : undefined;

  return {
    id: tx._id,
    type,
    amount: Math.abs(tx.points || tx.amount || 0),
    description: cashoutDescription || tx.description || "Giao dich vi diem thuong",
    status:
      tx.status === "SUCCESS"
        ? "completed"
        : tx.status === "PENDING"
          ? "pending"
          : "failed",
    createdAt: tx.createdAt || new Date().toISOString(),
  };
}

export function mapWalletTransactions(txs: WalletTxItem[] = []) {
  return txs.map(mapWalletTransaction);
}

export function mapLedgerTransaction(ledger: LedgerEntryItem): WalletUiTransaction {
  let type: WalletUiTransaction["type"] = "deposit";

  if (ledger.sourceType === "race_win_reward") {
    type = "prize_owner";
  } else if (ledger.sourceType === "prediction_reward") {
    type = ledger.pointsDelta >= 0 ? "prediction_win" : "prediction_refund";
  } else if (ledger.sourceType === "redemption") {
    if (ledger.pointsDelta > 0) {
      type = "withdrawal_refund";
    } else {
      type = "withdrawal_requested";
      if (ledger.note?.toLowerCase().includes("thành công") || ledger.note?.toLowerCase().includes("thanh cong") || ledger.note?.toLowerCase().includes("paid")) {
        type = "withdrawal_paid";
      } else if (ledger.note?.toLowerCase().includes("từ chối") || ledger.note?.toLowerCase().includes("tu choi")) {
        type = "withdrawal_rejected";
      }
    }
  } else if (ledger.sourceType === "referee_salary") {
    type = "salary_bonus";
  }

  return {
    id: ledger._id,
    type,
    amount: Math.abs(ledger.pointsDelta || 0),
    description: ledger.note || "Giao dich vi diem thuong",
    status: "completed", // Ledger entries are inherently completed
    createdAt: ledger.createdAt || new Date().toISOString(),
  };
}

export function mapLedgerTransactions(ledgers: LedgerEntryItem[] = []) {
  return ledgers.map(mapLedgerTransaction);
}

export function mapCashoutToQueueRequest(cashout: CashoutItem): CashoutQueueRequest {
  const user = typeof cashout.userId === "object" ? cashout.userId : null;
  const roles = user && "roles" in user && Array.isArray(user.roles) ? user.roles : [];
  const userRole = roles.includes("owner")
    ? "Owner"
    : roles.includes("jockey")
      ? "Jockey"
      : "Spectator";

  return {
    id: cashout._id,
    userId: typeof cashout.userId === "string" ? cashout.userId : user?._id || "",
    userFullName: user?.fullName || "Khach hang",
    userRole,
    points: cashout.pointsRedeemed,
    redemptionCode: cashout.redemptionCode,
    status: cashout.status as CashoutQueueRequest["status"],
    createdAt: cashout.createdAt || new Date().toISOString(),
    paidBy:
      typeof cashout.paidBy === "object"
        ? cashout.paidBy.fullName
        : typeof cashout.approvedBy === "object"
          ? cashout.approvedBy.fullName
          : typeof cashout.paidBy === "string"
            ? cashout.paidBy
            : typeof cashout.approvedBy === "string"
              ? cashout.approvedBy
              : undefined,
    paidAt: cashout.paidAt,
    rejectReason: cashout.rejectReason,
    rejectedBy:
      typeof cashout.rejectedBy === "object"
        ? cashout.rejectedBy.fullName
        : typeof cashout.rejectedBy === "string"
          ? cashout.rejectedBy
          : undefined,
  };
}
