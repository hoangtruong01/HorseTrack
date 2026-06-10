"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Lock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { aiApi, racesApi, type AiPredictionItem, type RaceItem } from "@/lib/api-client";

const sourceLabels: Record<string, string> = {
  LLM: "LLM",
  RULE_BASED: "Rule-based",
  MANUAL: "Manual",
};

const sourceColors: Record<string, string> = {
  LLM: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  RULE_BASED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  MANUAL: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

function getHorseName(field: AiPredictionItem["rankings"][number]["horseId"]): string {
  if (typeof field === "object" && field !== null && "name" in field) return field.name;
  return String(field);
}

function getHorseBreed(field: AiPredictionItem["rankings"][number]["horseId"]): string {
  if (typeof field === "object" && field !== null && "breed" in field && field.breed) return field.breed;
  return "";
}

export default function SpectatorAiPredictionsPage() {
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [prediction, setPrediction] = useState<AiPredictionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [noSubscription, setNoSubscription] = useState(false);

  useEffect(() => {
    racesApi.list({ limit: 100 })
      .then((res) => setRaces(res.data))
      .catch(() => { /* silent */ });
  }, []);

  const handleRaceSelect = async (raceId: string) => {
    setSelectedRaceId(raceId);
    setNoSubscription(false);
    setPrediction(null);
    if (!raceId) return;

    setLoading(true);
    try {
      const data = await aiApi.getPrediction(raceId);
      setPrediction(data);
    } catch (e) {
      const msg = (e as Error).message ?? "";
      if (msg.toLowerCase().includes("subscription") || msg.toLowerCase().includes("forbidden") || msg.toLowerCase().includes("403")) {
        setNoSubscription(true);
      } else {
        // No prediction yet — that is acceptable
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="AI Service"
        title="Dự Đoán AI"
        description="Xem phân tích xác suất thắng và thứ hạng dự đoán của từng ngựa trong cuộc đua, được tính toán bởi AI."
      />

      <div className="space-y-1.5 max-w-sm">
        <label className="text-xs font-medium text-muted-foreground">Chọn cuộc đua</label>
        <select
          value={selectedRaceId}
          onChange={(e) => { void handleRaceSelect(e.target.value); }}
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">-- Chọn race --</option>
          {races.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name} — {new Date(r.startTime).toLocaleDateString("vi-VN")}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải dự đoán...</div>
      )}

      {noSubscription && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8 text-center space-y-4">
          <Lock className="size-10 text-yellow-400 mx-auto" />
          <div>
            <p className="text-base font-bold text-foreground">Tính năng yêu cầu đăng ký gói AI</p>
            <p className="text-sm text-muted-foreground mt-1">Bạn cần có gói dự đoán AI đang hoạt động để xem kết quả dự đoán.</p>
          </div>
          <Link
            href="/spectator/ai-packages"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <Brain className="size-4" />
            Xem các gói AI
          </Link>
        </div>
      )}

      {!loading && !noSubscription && selectedRaceId && !prediction && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground text-sm">
          Chưa có dự đoán AI cho cuộc đua này. Hãy thử lại sau khi cuộc đua được cập nhật.
        </div>
      )}

      {!loading && !noSubscription && prediction && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex-1 min-w-24 space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Nguồn AI</p>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${sourceColors[prediction.source] ?? ""}`}>
                {sourceLabels[prediction.source] ?? prediction.source}
              </span>
            </div>
            <div className="flex-1 min-w-24 space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Độ tin cậy</p>
              <p className="text-3xl font-black text-primary">{prediction.confidenceLevel}%</p>
            </div>
            <div className="flex-1 min-w-24 space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Cập nhật lúc</p>
              <p className="text-sm text-foreground">{new Date(prediction.generatedAt).toLocaleString("vi-VN")}</p>
            </div>
          </div>

          {prediction.reasoning && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Phân tích của AI</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{prediction.reasoning}</p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Dự đoán thứ hạng</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Hạng</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngựa</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Xác suất thắng</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Điểm sức mạnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...prediction.rankings]
                  .sort((a, b) => a.predictedRank - b.predictedRank)
                  .map((r) => {
                    const key = typeof r.horseId === "object" && "_id" in r.horseId ? r.horseId._id : String(r.horseId);
                    return (
                      <tr key={key} className="hover:bg-muted transition-colors">
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex size-8 items-center justify-center rounded-full text-sm font-black ${r.predictedRank === 1 ? "bg-yellow-400/20 text-yellow-400" : r.predictedRank === 2 ? "bg-slate-400/20 text-slate-300" : r.predictedRank === 3 ? "bg-orange-400/20 text-orange-400" : "bg-muted text-muted-foreground"}`}>
                            {r.predictedRank}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-foreground">{getHorseName(r.horseId)}</p>
                          {getHorseBreed(r.horseId) && (
                            <p className="text-xs text-muted-foreground">{getHorseBreed(r.horseId)}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${r.winProbability * 100}%` }} />
                            </div>
                            <span className="font-mono text-sm font-bold text-foreground w-12 text-right">{(r.winProbability * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-sm text-muted-foreground">{r.strengthScore.toFixed(2)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
