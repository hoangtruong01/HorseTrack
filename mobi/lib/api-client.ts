import { BASE_URL } from './config';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

function injectUnderscoreId(val: any): any {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) {
    return val.map(injectUnderscoreId);
  }
  if (typeof val === 'object') {
    if (typeof val.id === 'string' && !('_id' in val)) {
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

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = text;
  }
  
  if (!res.ok) {
    const errMsg =
      (raw as { message?: string })?.message ??
      (raw as { error?: string })?.error ??
      res.statusText;
    throw new Error(errMsg);
  }

  let result: any = raw;
  if (
    raw &&
    typeof raw === 'object' &&
    'success' in (raw as object) &&
    'data' in (raw as object)
  ) {
    const envelope = raw as { success: boolean; data: unknown; meta?: unknown };
    if (envelope.meta !== undefined) {
      result = { data: envelope.data, meta: envelope.meta };
    } else {
      result = envelope.data;
    }
  }
  return injectUnderscoreId(result) as T;
}

// ─── Interfaces ─────────────────────────────────────────────────────────────
export interface UserItem {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
  avatar?: string;
  status: string;
  roles: string[];
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

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
  ownerId?: { _id: string; fullName: string; email: string } | string;
  imageUrl?: string;
  image?: string;
  createdAt?: string;
}

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
  prizePool?: number;
  imageUrl?: string;
}

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
}

export interface AssignmentItem {
  _id: string;
  raceId?: { _id: string; name: string; startTime?: string; status?: string } | string;
  refereeUserId?: { _id: string; fullName: string; email: string } | string;
  role: 'main' | 'assistant';
  status: string;
}

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

export interface WalletTxItem {
  _id: string;
  type: string;
  amount: number;
  points: number;
  description?: string;
  status: string;
  createdAt?: string;
}

export interface CashoutItem {
  _id: string;
  userId?: { _id: string; fullName: string; email: string; phone?: string } | string;
  pointsRedeemed: number;
  redemptionCode: string;
  status: string;
  createdAt?: string;
}

export interface LedgerEntryItem {
  _id: string;
  pointsDelta: number;
  balanceAfter: number;
  note?: string;
  createdAt: string;
}

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
  createdAt?: string;
}

// ─── API endpoints ───────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.role) qs.set('role', params.role);
    return apiFetch<PaginatedResult<UserItem>>(`/users?${qs}`);
  },
};

export const horsesApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    return apiFetch<PaginatedResult<HorseItem>>(`/horses?${qs}`);
  },
  listMine: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<PaginatedResult<HorseItem>>(`/horses/my-horses?${qs}`);
  },
  create: (body: FormData | { name: string; breed?: string; age?: number; gender?: string; color?: string; weightKg?: number; heightCm?: number; baseSpeed?: number; staminaScore?: number; description?: string }) =>
    apiFetch<HorseItem>('/horses', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
};

export const tournamentsApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<PaginatedResult<TournamentItem>>(`/tournaments?${qs}`);
  },
  get: (id: string) => apiFetch<TournamentItem>(`/tournaments/${id}`),
};

export const racesApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<PaginatedResult<RaceItem>>(`/races?${qs}`);
  },
  listByTournament: (tournamentId: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<PaginatedResult<RaceItem>>(`/races/tournament/${tournamentId}?${qs}`);
  },
  get: (id: string) => apiFetch<RaceItem>(`/races/${id}`),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/races/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export const refereeAssignmentsApi = {
  listByRace: (raceId: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<PaginatedResult<AssignmentItem>>(`/referee-assignments/race/${raceId}?${qs}`);
  },
  myAssignments: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<any>(`/referee-assignments/my-assignments?${qs}`);
  },
  respond: (id: string, response: 'accepted' | 'rejected') =>
    apiFetch<any>(`/referee-assignments/${id}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    }),
};

export const predictionsApi = {
  create: (dto: { raceId: string; predictedHorseId: string; betPoints?: number }) =>
    apiFetch<PredictionItem>('/predictions', { method: 'POST', body: JSON.stringify(dto) }),
  listMyPredictions: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<PaginatedResult<PredictionItem>>(`/predictions/my-predictions?${qs}`);
  },
};

export const walletApi = {
  myHistory: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<{ balance: number; points: number; data: WalletTxItem[]; meta: Record<string, unknown> }>(`/wallet/history?${qs}`);
  },
  requestCashout: (dto: { pointsToRedeem: number }) =>
    apiFetch<CashoutItem>('/wallet/cashout', { method: 'POST', body: JSON.stringify(dto) }),
  allCashouts: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<PaginatedResult<CashoutItem>>(`/wallet/cashout/all?${qs}`);
  },
  processCashout: (id: string, status: string) =>
    apiFetch(`/wallet/cashout/${id}/process`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  depositForUser: (userId: string, amount: number) =>
    apiFetch(`/wallet/deposit/for-user/${userId}`, { method: 'POST', body: JSON.stringify({ amount }) }),
};

export const rewardPointLedgerApi = {
  myHistory: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<PaginatedResult<LedgerEntryItem>>(`/reward-point-ledger/my-history?${qs}`);
  },
  myBalance: () => apiFetch<{ balance: number }>('/reward-point-ledger/my-balance'),
};

export const registrationsApi = {
  list: (params?: { page?: number; limit?: number; tournamentId?: string; raceId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.tournamentId) qs.set('tournamentId', params.tournamentId);
    if (params?.raceId) qs.set('raceId', params.raceId);
    if (params?.status) qs.set('status', params.status);
    return apiFetch<PaginatedResult<RegistrationItem>>(`/registrations?${qs}`);
  },
  create: (dto: { tournamentId: string; raceId: string; horseId: string; jockeyUserId?: string; note?: string }) =>
    apiFetch<RegistrationItem>('/registrations', { method: 'POST', body: JSON.stringify(dto) }),
  cancel: (id: string) =>
    apiFetch<any>(`/registrations/${id}/cancel`, { method: 'PATCH' }),
  withdraw: (id: string) =>
    apiFetch<any>(`/registrations/${id}/withdraw`, { method: 'PATCH' }),
};

export const raceResultsApi = {
  getByRace: (raceId: string) => apiFetch<any>(`/race-results/race/${raceId}`),
  simulate: (raceId: string) => apiFetch<any>(`/race-results/race/${raceId}/simulate`, { method: 'POST' }),
  bulkSave: (raceId: string, results: any[]) => apiFetch<any>(`/race-results/race/${raceId}/bulk`, { method: 'POST', body: JSON.stringify({ results }) }),
  confirm: (raceId: string) => apiFetch<any>(`/race-results/race/${raceId}/confirm`, { method: 'PATCH' }),
};

export const raceChecksApi = {
  listByRace: (raceId: string) => apiFetch<any>(`/race-checks/race/${raceId}`),
  update: (checkId: string, status: string, notes?: string) =>
    apiFetch(`/race-checks/${checkId}`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
};

export const jockeyInvitationsApi = {
  listSent: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<any>(`/jockey-invitations/sent?${qs}`);
  },
  list: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<any>(`/jockey-invitations?${qs}`);
  },
  create: (dto: { registrationId: string; jockeyId: string; message?: string; jockeySharePercent: number }) =>
    apiFetch<any>('/jockey-invitations', { method: 'POST', body: JSON.stringify(dto) }),
  cancel: (id: string) =>
    apiFetch<any>(`/jockey-invitations/${id}/cancel`, { method: 'PATCH' }),
  respond: (invitationId: string, response: 'accepted' | 'rejected') =>
    apiFetch<any>(`/jockey-invitations/${invitationId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    }),
};

export const jockeysApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<any>(`/jockeys?${qs}`);
  },
  get: (id: string) => apiFetch<any>(`/jockeys/${id}`),
};

export const dashboardApi = {
  getOwnerStats: () => apiFetch<any>('/dashboard/owner'),
};

export const rankingsApi = {
  globalHorses: () => apiFetch<any>('/rankings/global/horses'),
  globalJockeys: () => apiFetch<any>('/rankings/global/jockeys'),
};

export const raceViolationsApi = {
  create: (dto: {
    raceId: string;
    type: string;
    severity: string;
    penalty: string;
    raceRegistrationId: string;
    horseId: string;
    jockeyUserId?: string;
    description: string;
  }) => apiFetch<any>('/race-violations', { method: 'POST', body: JSON.stringify(dto) }),
  listByRace: (raceId: string) => apiFetch<any>(`/race-violations/race/${raceId}`),
};

