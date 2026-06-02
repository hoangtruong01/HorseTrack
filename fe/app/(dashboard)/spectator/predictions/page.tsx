"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Flag, Bell, Wallet, Trophy, CheckCircle, HelpCircle, Activity, AlertTriangle, Coins, Play } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { mockWalletBalances } from "@/features/wallet/mock-wallet";

// Mock Scheduled and Ready Races for Prediction
const mockScheduledRaces = [
  {
    id: "race-neon-900",
    name: "Neon Dash 900",
    tournament: "Night Circuit Trophy",
    distance: "900m",
    surface: "Synthetic Track",
    status: "READY",
    statusLabel: "Sẵn sàng (Khóa cổng sắp giờ)",
    horses: [
      { id: "h-01", name: "Crimson Bolt", jockey: "Minh Khoa", breed: "Thoroughbred" },
      { id: "h-02", name: "Midnight Alloy", jockey: "Gia Huy", breed: "Thoroughbred" },
      { id: "h-03", name: "Delta Comet", jockey: "An Nhi", breed: "Arabian" },
    ]
  },
  {
    id: "race-spring-1600",
    name: "Spring Grand Final",
    tournament: "Spring Velocity Cup",
    distance: "1,600m",
    surface: "Wet Turf",
    status: "SCHEDULED",
    statusLabel: "Chờ điểm danh",
    horses: [
      { id: "h-01", name: "Crimson Bolt", jockey: "Minh Khoa", breed: "Thoroughbred" },
      { id: "h-02", name: "Midnight Alloy", jockey: "Gia Huy", breed: "Thoroughbred" },
      { id: "h-03", name: "Delta Comet", jockey: "An Nhi", breed: "Arabian" },
      { id: "h-04", name: "Neon Stirrup", jockey: "Thanh Vy", breed: "Mustang" },
    ]
  }
];

// Mock My Existing Predictions
const initialMyPredictions = [
  {
    id: "pred-01",
    raceName: "Delta Endurance 1600",
    predictedHorse: "Delta Comet",
    jockey: "An Nhi",
    status: "WON",
    statusLabel: "Đoán Đúng",
    pointsChange: "+1 Điểm",
    date: "23 May 2026",
  },
  {
    id: "pred-02",
    raceName: "Heritage Mile 1400",
    predictedHorse: "Silver Apex",
    jockey: "Bao Nam",
    status: "LOST",
    statusLabel: "Đoán Sai",
    pointsChange: "-1 Điểm",
    date: "22 May 2026",
  }
];

export default function SpectatorPredictionsPage() {
  const userId = "user-spectator-1";
  const [balance, setBalance] = useState(mockWalletBalances[userId] || 3200);
  const [myPredictions, setMyPredictions] = useState(initialMyPredictions);
  
  // Selection states for placing prediction
  const [selectedRaceId, setSelectedRaceId] = useState(mockScheduledRaces[0].id);
  const [selectedHorseId, setSelectedHorseId] = useState("");

  const currentRace = mockScheduledRaces.find(r => r.id === selectedRaceId);

  const handlePredictSubmit = () => {
    if (!selectedHorseId) {
      toast.error("Vui lòng chọn 1 chiến mã trước khi gửi dự đoán!");
      return;
    }

    const horse = currentRace?.horses.find(h => h.id === selectedHorseId);
    if (!horse || !currentRace) return;

    // Check if already predicted this race in mock list
    const alreadyPredicted = myPredictions.some(p => p.raceName === currentRace.name && p.status === "PENDING");
    if (alreadyPredicted) {
      toast.error("Bạn đã đặt dự đoán cho cuộc đua này rồi!");
      return;
    }

    // Add mock prediction
    const newPred = {
      id: `pred-new-${Date.now()}`,
      raceName: currentRace.name,
      predictedHorse: horse.name,
      jockey: horse.jockey,
      status: "PENDING",
      statusLabel: "Đang chờ chạy",
      pointsChange: "Đang chờ kết quả",
      date: "Today",
    };

    setMyPredictions([newPred, ...myPredictions]);
    toast.success(`Đã ghi nhận dự đoán chiến mã "${horse.name}" về nhất trong cuộc đua "${currentRace.name}"!`);
    setSelectedHorseId("");
  };

  const handleSimulateResult = (predId: string, win: boolean) => {
    // Update target prediction to WON/LOST and adjust balance
    let pointsDiff = 0;
    const updated = myPredictions.map(p => {
      if (p.id === predId) {
        if (win) {
          pointsDiff = 1;
          return { ...p, status: "WON", statusLabel: "Đoán Đúng", pointsChange: "+1 Điểm" };
        } else {
          pointsDiff = balance > 0 ? -1 : 0;
          return { ...p, status: "LOST", statusLabel: "Đoán Sai", pointsChange: balance > 0 ? "-1 Điểm" : "0 Điểm" };
        }
      }
      return p;
    });

    const newBalance = Math.max(0, balance + pointsDiff);
    setBalance(newBalance);
    mockWalletBalances[userId] = newBalance;
    setMyPredictions(updated);

    if (win) {
      toast.success("Chúc mừng! Dự đoán của bạn chính xác, bạn nhận được +1 Điểm thưởng!");
    } else {
      toast.error("Rất tiếc! Chiến mã dự đoán cán đích không đúng vị trí số 1. Tài khoản bị khấu trừ -1 Điểm.");
    }
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/10 pb-6">
        <PageHeader
          eyebrow="Prediction Station"
          title="Dự Đoán Kết Quả Race"
          description="Tham gia dự đoán ngựa về nhất trong các cuộc đua sắp diễn ra hoàn toàn miễn phí nhận điểm thưởng thực tế."
        />

        {/* Quick Points Display */}
        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3 flex items-center gap-4">
          <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Coins className="size-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Số dư điểm free</span>
            <p className="text-xl font-black text-white">{balance.toLocaleString()} Pts</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Submit New Prediction */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#16161E] p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
            
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Bell className="size-5 text-primary" /> Đặt Dự Đoán Mới
            </h3>

            {/* Step 1: Select Race */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">1. Chọn trận đua sắp khởi tranh</label>
              <select
                value={selectedRaceId}
                onChange={(e) => {
                  setSelectedRaceId(e.target.value);
                  setSelectedHorseId("");
                }}
                className="w-full h-11 rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-primary cursor-pointer"
              >
                {mockScheduledRaces.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.tournament})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Horse */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">2. Chọn chiến mã dự đoán về nhất (Hạng 1)</label>
              
              <div className="space-y-2">
                {currentRace?.horses.map((h) => (
                  <label
                    key={h.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                      selectedHorseId === h.id
                        ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(225,6,0,0.15)]"
                        : "border-white/5 bg-black/20 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="horsePredict"
                        checked={selectedHorseId === h.id}
                        onChange={() => setSelectedHorseId(h.id)}
                        className="accent-primary size-4"
                      />
                      <div>
                        <span className="block text-xs font-black text-white uppercase">{h.name}</span>
                        <span className="text-[10px] text-muted-foreground">Nài ngựa: <strong className="text-white">{h.jockey}</strong></span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">{h.breed}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handlePredictSubmit}
              disabled={!selectedHorseId}
              className="w-full rounded-xl bg-primary hover:bg-[#B80500] text-white font-black uppercase tracking-wider text-xs py-5 shadow-[0_4px_16px_rgba(225,6,0,0.35)]"
            >
              Gửi Dự Đoán (+1 / -1 Pts)
            </Button>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#13131A] p-5 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="size-4" />
              <span className="text-xs font-black uppercase tracking-wider">Lưu Ý Cắt Cổng</span>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Cổng dự đoán đóng hoàn toàn khi cuộc đua chuyển sang trạng thái <strong className="text-white">LIVE</strong> (Trận đấu bắt đầu chạy). Bạn chỉ có thể đặt dự đoán ở các trận ở trạng thái <strong className="text-white">SCHEDULED</strong>, <strong className="text-white">CHECKING</strong> hoặc <strong className="text-white">READY</strong>.
            </p>
          </div>
        </div>

        {/* Right Side: List of Predictions & Simulating resolving */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Lịch sử lượt dự đoán của tôi ({myPredictions.length})
            </h3>
          </div>

          <div className="space-y-4">
            {myPredictions.map((p) => (
              <div
                key={p.id}
                className="group rounded-2xl border border-white/5 bg-[#13131A] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-white/10 transition duration-300 relative overflow-hidden"
              >
                {p.status === "PENDING" && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-400" />
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{p.date}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[8px] font-black uppercase tracking-wider ${
                      p.status === "WON"
                        ? "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                        : p.status === "LOST"
                        ? "bg-primary/10 border border-primary/20 text-primary"
                        : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                    }`}>
                      {p.statusLabel}
                    </span>
                  </div>

                  <h4 className="font-black text-white text-sm uppercase">{p.raceName}</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Đã chọn: <strong className="text-white">{p.predictedHorse}</strong> (Nài: {p.jockey})
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  <span className={`text-xs font-black ${p.status === "WON" ? "text-teal-400" : p.status === "LOST" ? "text-primary" : "text-yellow-400"}`}>
                    {p.pointsChange}
                  </span>

                  {p.status === "PENDING" && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleSimulateResult(p.id, true)}
                        className="h-7 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-[10px] px-2 py-0"
                      >
                        Đoán Đúng
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSimulateResult(p.id, false)}
                        className="h-7 rounded-lg bg-primary hover:bg-[#B80500] text-white font-bold text-[10px] px-2 py-0"
                      >
                        Đoán Sai
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
