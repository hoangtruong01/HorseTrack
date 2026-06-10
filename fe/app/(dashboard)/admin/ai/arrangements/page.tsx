"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { aiApi, tournamentsApi, type AiArrangementItem, type TournamentItem } from "@/lib/api-client";

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  APPLIED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
};

function getTournamentName(field: AiArrangementItem["tournamentId"]): string {
  if (typeof field === "object" && field !== null && "name" in field) return field.name;
  return String(field);
}

export default function AdminAiArrangementsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [arrangements, setArrangements] = useState<AiArrangementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    tournamentsApi.list({ limit: 100 })
      .then((res) => setTournaments(res.data))
      .catch(() => { /* silent */ });
  }, []);

  const fetchArrangements = useCallback(async (tournamentId: string) => {
    setLoading(true);
    setArrangements([]);
    try {
      const data = await aiApi.listArrangements(tournamentId);
      setArrangements(data);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTournamentSelect = (id: string) => {
    setSelectedTournamentId(id);
    if (id) void fetchArrangements(id);
  };

  const handleGenerate = async () => {
    if (!selectedTournamentId) return;
    setGenerating(true);
    try {
      await aiApi.generateArrangement(selectedTournamentId);
      toast.success("Sinh đề xuất sắp xếp thành công");
      await fetchArrangements(selectedTournamentId);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "APPLIED" | "REJECTED") => {
    setActionLoading(id + status);
    try {
      await aiApi.updateArrangementStatus(id, status);
      toast.success(`Đã ${status === "APPLIED" ? "áp dụng" : "từ chối"} đề xuất`);
      await fetchArrangements(selectedTournamentId);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="AI Service"
        title="Sắp Xếp Cuộc Đua AI"
        description="Sinh đề xuất phân bổ ngựa vào các cuộc đua theo giải đấu để đảm bảo tính cân bằng sức mạnh."
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5 flex-1 min-w-48">
          <label className="text-xs font-medium text-muted-foreground">Chọn giải đấu</label>
          <select
            value={selectedTournamentId}
            onChange={(e) => handleTournamentSelect(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Chọn tournament --</option>
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { void handleGenerate(); }}
          disabled={!selectedTournamentId || generating}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition"
        >
          <Sparkles className="size-4" />
          {generating ? "Đang sinh..." : "Sinh đề xuất mới"}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
      )}

      {!loading && selectedTournamentId && arrangements.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground text-sm">
          Chưa có đề xuất nào. Nhấn <strong className="text-foreground">&quot;Sinh đề xuất mới&quot;</strong> để tạo.
        </div>
      )}

      <div className="space-y-4">
        {arrangements.map((arr) => (
          <div key={arr._id} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-4">
              <button
                onClick={() => setExpandedId(expandedId === arr._id ? null : arr._id)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                {expandedId === arr._id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{getTournamentName(arr.tournamentId)}</p>
                <p className="text-xs text-muted-foreground">
                  {arr.proposedRaces.length} cuộc đua đề xuất
                  {arr.createdAt && ` · ${new Date(arr.createdAt).toLocaleString("vi-VN")}`}
                </p>
              </div>

              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[arr.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                {arr.status}
              </span>

              {arr.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { void handleUpdateStatus(arr._id, "APPLIED"); }}
                    disabled={actionLoading !== null}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition"
                  >
                    Áp dụng
                  </button>
                  <button
                    onClick={() => { void handleUpdateStatus(arr._id, "REJECTED"); }}
                    disabled={actionLoading !== null}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>

            {expandedId === arr._id && (
              <div className="border-t border-border px-5 py-4 space-y-4">
                {arr.reasoning && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Lý giải</p>
                    <p className="text-sm text-foreground leading-relaxed">{arr.reasoning}</p>
                  </div>
                )}

                {arr.fairnessReport && arr.fairnessReport.violations.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-1.5">Cảnh báo công bằng</p>
                    <ul className="space-y-1">
                      {arr.fairnessReport.violations.map((v, i) => (
                        <li key={i} className="text-sm text-yellow-400/80">• {v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Chi tiết các cuộc đua đề xuất</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {arr.proposedRaces.map((race, idx) => (
                      <div key={idx} className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                        <p className="text-xs font-bold text-foreground">Cuộc đua #{idx + 1}</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Cự ly:</span><span className="text-foreground font-medium">{race.distanceMeters}m</span>
                          <span>Tối đa:</span><span className="text-foreground font-medium">{race.maxParticipants} ngựa</span>
                          <span>Điều kiện:</span><span className="text-foreground font-medium">{race.trackCondition}</span>
                          <span>Thời tiết:</span><span className="text-foreground font-medium">{race.weather}</span>
                          <span>Sức mạnh TB:</span><span className="text-primary font-bold">{race.avgStrength.toFixed(2)}</span>
                          <span>Độ chênh lệch:</span><span className="text-foreground font-medium">{race.strengthSpread.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Ngựa tham gia: {race.entries.length}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
