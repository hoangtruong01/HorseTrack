/**
 * Thin API client — reads cookie from Next.js API route /api/auth/token
 * All calls go through the BE directly with Bearer token.
 */
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1";

async function getToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/token", { cache: "no-store" });
    if (res.ok) {
      const { token } = await res.json();
      return token as string;
    }
  } catch {}
  return null;
}

function injectUnderscoreId(val: any): any {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) {
    return val.map(injectUnderscoreId);
  }
  if (typeof val === "object") {
    if (typeof val.id === "string" && !("_id" in val)) {
      val._id = val.id;
    }
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        val[key] = injectUnderscoreId(val[key]);
      }
    }
  }
  return val;
}

interface CustomRequestInit extends RequestInit {
  _retry?: boolean;
}

export async function apiFetch<T>(path: string, options: CustomRequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = text;
  }

  if (!res.ok) {
    // Check if unauthorized and not already retried
    if (res.status === 401 && !options._retry) {
      try {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success) {
            // Retry the original request with the new token
            return apiFetch<T>(path, { ...options, _retry: true });
          }
        }
      } catch (err) {
        console.error("Auto token refresh failed:", err);
      }
    }

    const errMsg =
      (raw as { message?: string })?.message ??
      (raw as { error?: string })?.error ??
      res.statusText;
    throw new Error(errMsg);
  }

  // ResponseInterceptor wraps payload as { success, message, data, meta? }
  // Unwrap if the wrapper is present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = raw;
  if (
    raw &&
    typeof raw === "object" &&
    "success" in (raw as object) &&
    "data" in (raw as object)
  ) {
    const envelope = raw as { success: boolean; data: unknown; meta?: unknown };
    // For paginated results the meta is hoisted to top level by the interceptor
    // while data contains the array. Reconstruct { data, meta } so callers work uniformly.
    if (envelope.meta !== undefined) {
      result = { data: envelope.data, meta: envelope.meta };
    } else {
      result = envelope.data;
    }
  }
  return injectUnderscoreId(result) as T;
}

// ─── Users ──────────────────────────────────────────────────────────────────
export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
  avatar?: string;
  status: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const usersApi = {
  list: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    if (params?.role) qs.set("role", params.role);
    if (params?.status) qs.set("status", params.status);
    return apiFetch<PaginatedResult<UserItem>>(`/users?${qs}`);
  },
  ban: (id: string) => apiFetch(`/users/${id}/ban`, { method: "PATCH" }),
  unban: (id: string) => apiFetch(`/users/${id}/unban`, { method: "PATCH" }),
  delete: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
  assignRole: (id: string, role: string) =>
    apiFetch(`/users/${id}/roles`, { method: "POST", body: JSON.stringify({ role }) }),
  removeRole: (id: string, role: string) =>
    apiFetch(`/users/${id}/roles/${role}`, { method: "DELETE" }),
};

// ─── Horses ─────────────────────────────────────────────────────────────────
export interface HorseItem {
  _id: string;
  name: string;
  breed?: string;
  age?: number;
  gender?: string;
  color?: string;
  weightKg?: number;
  heightCm?: number;
  baseSpeed?: number;
  staminaScore?: number;
  description?: string;
  healthStatus: string;
  status: string;
  approvalStatus?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  approvedAt?: string;
  ownerId?: { _id: string; fullName: string; email: string } | string;
  imageUrl?: string;
  image?: string;
  createdAt?: string;
}

export const horsesApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    return apiFetch<PaginatedResult<HorseItem>>(`/horses?${qs}`);
  },
  approve: (id: string) => apiFetch(`/horses/${id}/approve`, { method: "PATCH" }),
  reject: (id: string, reason: string) =>
    apiFetch(`/horses/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  delete: (id: string) => apiFetch(`/horses/${id}`, { method: "DELETE" }),
};

// ─── Jockeys ────────────────────────────────────────────────────────────────
export interface JockeyItem {
  _id: string;
  userId?: { _id: string; fullName: string; email: string } | string;
  licenseNumber?: string;
  experienceYears?: number;
  weight?: number;
  status: string;
  totalRaces?: number;
  wins?: number;
  createdAt?: string;
}

export const jockeysApi = {
  listAdmin: (params?: { page?: number; limit?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.status) qs.set("status", params.status);
    return apiFetch<PaginatedResult<JockeyItem>>(`/jockeys/admin/all?${qs}`);
  },
  changeStatus: (id: string, status: string) =>
    apiFetch(`/jockeys/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ─── Tournaments ─────────────────────────────────────────────────────────────
export interface TournamentItem {
  _id: string;
  name: string;
  description?: string;
  location?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  maxHorses?: number;
  prize?: number;       // backward-compat alias
  prizePool?: number;   // actual backend field
  imageUrl?: string;
  createdAt?: string;
}

export const tournamentsApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<TournamentItem>>(`/tournaments?${qs}`);
  },
  get: (id: string) => apiFetch<TournamentItem>(`/tournaments/${id}`),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/tournaments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  delete: (id: string) => apiFetch(`/tournaments/${id}`, { method: "DELETE" }),
};

// ─── Races ───────────────────────────────────────────────────────────────────
export interface RaceItem {
  _id: string;
  tournamentId: { _id: string; name: string; startDate?: string; endDate?: string } | string;
  name: string;
  description?: string;
  raceNumber?: number;
  startTime: string;
  endTime?: string;
  location?: string;
  distanceMeters: number;
  lapCount?: number;
  maxParticipants?: number;
  participantsCount?: number;
  prize?: number;
  status: string;
  trackCondition?: string;
  weatherSnapshot?: string;
  createdBy?: { _id: string; fullName: string } | string;
  createdAt?: string;
}

export const racesApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<RaceItem>>(`/races?${qs}`);
  },
  listByTournament: (tournamentId: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<RaceItem>>(`/races/tournament/${tournamentId}?${qs}`);
  },
  get: (id: string) => apiFetch<RaceItem>(`/races/${id}`),
  create: (dto: {
    tournamentId: string;
    name: string;
    description?: string;
    startTime: string;
    distanceMeters: number;
    lapCount?: number;
    maxParticipants?: number;
    prize?: number;
    trackCondition?: string;
    weatherSnapshot?: string;
  }) => apiFetch<RaceItem>("/races", { method: "POST", body: JSON.stringify(dto) }),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/races/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  delete: (id: string) => apiFetch(`/races/${id}`, { method: "DELETE" }),
};

// ─── Referee Profiles ────────────────────────────────────────────────────────
export interface RefereeProfileItem {
  _id: string;
  userId?: { _id: string; fullName: string; email: string; phone?: string } | string;
  licenseNo?: string;
  experienceYears?: number;
  status: "available" | "unavailable" | "suspended";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  certificates?: string;
  bio?: string;
  createdAt?: string;
}

export const refereeProfilesApi = {
  listAdmin: (params?: { page?: number; limit?: number; approvalStatus?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.approvalStatus) qs.set("approvalStatus", params.approvalStatus);
    return apiFetch<PaginatedResult<RefereeProfileItem>>(`/referee-profiles?${qs}`);
  },
  changeApproval: (id: string, approvalStatus: "APPROVED" | "REJECTED", rejectionReason?: string) =>
    apiFetch(`/referee-profiles/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus, rejectionReason }),
    }),
  changeStatus: (id: string, status: "available" | "unavailable" | "suspended") =>
    apiFetch(`/referee-profiles/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ─── Referee Assignments ─────────────────────────────────────────────────────
export interface AssignmentItem {
  _id: string;
  raceId?: { _id: string; name: string; startTime?: string; status?: string } | string;
  refereeUserId?: { _id: string; fullName: string; email: string } | string;
  assignedBy?: { _id: string; fullName: string } | string;
  role: "main" | "assistant";
  status: string;
  salary?: number;
  createdAt?: string;
}

export const refereeAssignmentsApi = {
  listByRace: (raceId: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<AssignmentItem>>(`/referee-assignments/race/${raceId}?${qs}`);
  },
  create: (dto: { raceId: string; refereeUserId: string; role?: "main" | "assistant"; salary?: number }) =>
    apiFetch("/referee-assignments", { method: "POST", body: JSON.stringify(dto) }),
  remove: (id: string) => apiFetch(`/referee-assignments/${id}`, { method: "DELETE" }),
  listAvailable: (raceId: string) =>
    apiFetch<Array<{ _id: string; fullName: string; email: string }>>(`/referee-assignments/available-referees?raceId=${raceId}`),
};


// ─── Rankings ────────────────────────────────────────────────────────────────
export interface RankingEntry {
  horseId: string;
  horseName?: string;
  breed?: string;
  ownerName?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTimeMs?: number;
  rank?: number;
}

export interface JockeyRankingEntry {
  jockeyUserId: string;
  jockeyName?: string;
  experienceYears?: number;
  skillLevel?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTimeMs?: number;
  rank?: number;
}

export const rankingsApi = {
  getHorseRankings: (tournamentId: string) =>
    apiFetch<RankingEntry[]>(`/rankings/tournament/${tournamentId}/horses`),
  getJockeyRankings: (tournamentId: string) =>
    apiFetch<JockeyRankingEntry[]>(`/rankings/tournament/${tournamentId}/jockeys`),
  getGlobalHorseRankings: () =>
    apiFetch<RankingEntry[]>("/rankings/global/horses"),
  getGlobalJockeyRankings: () =>
    apiFetch<JockeyRankingEntry[]>("/rankings/global/jockeys"),
};

// ─── Prizes ─────────────────────────────────────────────────────────────────
export interface PrizeItem {
  _id: string;
  tournamentId?: { _id: string; name: string } | string;
  raceId?: { _id: string; name: string } | string;
  horseId?: { _id: string; name: string } | string;
  ownerId?: { _id: string; fullName: string; email: string } | string;
  rank: number;
  amount: number;
  status: string;
  paidAt?: string;
  createdAt?: string;
}

export const prizesApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<PrizeItem>>(`/prizes?${qs}`);
  },
  updateStatus: (id: string, status: string) =>
    apiFetch(`/prizes/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ─── Predictions (Bets) ───────────────────────────────────────────────────────
export interface PredictionItem {
  _id: string;
  userId?: { _id: string; fullName: string; email: string } | string;
  raceId?: { _id: string; name: string; startTime?: string; status?: string } | string;
  predictedHorseId?: { _id: string; name: string; breed?: string } | string;
  rewardPoints?: number;
  betPoints?: number;
  status: string;
  createdAt?: string;
}

export const predictionsApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<PredictionItem>>(`/predictions?${qs}`);
  },
  create: (dto: { raceId: string; predictedHorseId: string; betPoints?: number }) =>
    apiFetch<PredictionItem>("/predictions", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  listMyPredictions: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<PredictionItem>>(`/predictions/my-predictions?${qs}`);
  },
  cancel: (id: string) =>
    apiFetch<PredictionItem>(`/predictions/${id}/cancel`, {
      method: "POST",
    }),
};

// ─── Wallet Transactions ─────────────────────────────────────────────────────
export interface WalletTxItem {
  _id: string;
  userId?: { _id: string; fullName: string; email: string } | string;
  type: string;
  amount: number;
  points: number;
  description?: string;
  status: string;
  createdAt?: string;
}

export interface CashoutItem {
  _id: string;
  userId?: { _id: string; fullName: string; email: string; phone?: string; roles?: string[] } | string;
  pointsRedeemed: number;
  redemptionCode: string;
  status: string;
  approvedBy?: { _id: string; fullName: string } | string;
  paidBy?: { _id: string; fullName: string } | string;
  paidAt?: string;
  createdAt?: string;
}

export const walletApi = {
  myHistory: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<{ balance: number; points: number; data: WalletTxItem[]; meta: Record<string, unknown> }>(`/wallet/history?${qs}`);
  },
  requestCashout: (dto: { pointsToRedeem: number }) =>
    apiFetch<CashoutItem>("/wallet/cashout", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  allTransactions: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<WalletTxItem>>(`/wallet/all-transactions?${qs}`);
  },
  allCashouts: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<CashoutItem>>(`/wallet/cashout/all?${qs}`);
  },
  lookupCashout: (code: string) =>
    apiFetch<CashoutItem>(`/wallet/cashout/lookup?code=${code}`),
  processCashout: (id: string, status: string) =>
    apiFetch(`/wallet/cashout/${id}/process`, { method: "PATCH", body: JSON.stringify({ status }) }),
  depositForUser: (userId: string, amount: number) =>
    apiFetch(`/wallet/deposit/for-user/${userId}`, { method: "POST", body: JSON.stringify({ amount }) }),
};

// ─── Reward Point Ledger ─────────────────────────────────────────────────────
export interface LedgerEntryItem {
  _id: string;
  userId: string;
  sourceType: string;
  sourceId?: string;
  pointsDelta: number;
  balanceAfter: number;
  note?: string;
  createdBy?: string;
  createdAt: string;
}

export const rewardPointLedgerApi = {
  myHistory: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PaginatedResult<LedgerEntryItem>>(`/reward-point-ledger/my-history?${qs}`);
  },
  myBalance: () => apiFetch<{ balance: number }>("/reward-point-ledger/my-balance"),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getAdminStats: () => apiFetch<Record<string, any>>("/dashboard/admin"),
  getOwnerStats: () => apiFetch<Record<string, any>>("/dashboard/owner"),
  getJockeyStats: () => apiFetch<Record<string, any>>("/dashboard/jockey"),
  getRefereeStats: () => apiFetch<Record<string, any>>("/dashboard/referee"),
  getSpectatorStats: () => apiFetch<Record<string, any>>("/dashboard/spectator"),
};

// ─── Registrations ───────────────────────────────────────────────────────────
export interface RegistrationItem {
  _id: string;
  tournamentId?: { _id: string; name: string; status: string } | string;
  raceId?: { _id: string; name: string; startTime: string; status: string } | string;
  horseId?: { _id: string; name: string; breed: string } | string;
  ownerId?: { _id: string; fullName: string; email: string } | string;
  jockeyUserId?: { _id: string; fullName: string; email: string } | string;
  status: string;
  note?: string;
  rejectedReason?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const registrationsApi = {
  list: (params?: { page?: number; limit?: number; tournamentId?: string; raceId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.tournamentId) qs.set("tournamentId", params.tournamentId);
    if (params?.raceId) qs.set("raceId", params.raceId);
    if (params?.status) qs.set("status", params.status);
    return apiFetch<PaginatedResult<RegistrationItem>>(`/registrations?${qs}`);
  },
  get: (id: string) => apiFetch<RegistrationItem>(`/registrations/${id}`),
  approve: (id: string) => apiFetch<RegistrationItem>(`/registrations/${id}/approve`, { method: "PATCH" }),
  reject: (id: string, reason?: string) =>
    apiFetch<RegistrationItem>(`/registrations/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};
