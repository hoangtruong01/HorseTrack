import type { CashoutItem, WalletTxItem } from "@/lib/api-client";

export type WalletUiTransaction = {
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
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  rejectReason?: string;
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
  };
}
