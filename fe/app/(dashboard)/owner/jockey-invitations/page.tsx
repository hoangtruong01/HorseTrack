"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Users, Loader2, Send, Calendar, Clock, XCircle, PlusCircle,
  Sparkles, Eye, Trophy, Flag, Percent, Search,
  Star, Award, X, User,
} from "lucide-react";
import { toast } from "sonner";

/* ───────── Types ───────── */
type JockeyProfile = {
  id: string; userId: string; fullName: string; email: string; phone?: string;
  avatar?: string; heightCm: number; weightKg: number; experienceYears: number;
  status: string; skillLevel?: string; bio?: string; specialty?: string;
  personality?: string; totalRaces: number; wins: number;
};

type Registration = {
  id: string; raceName: string; horseName: string; raceStartTime: string;
  tournamentName: string; tournamentId: string; raceId: string;
};

type Invitation = {
  id: string; jockeyName: string; jockeyEmail: string; horseName: string;
  horseBreed: string; raceName: string; raceStartTime: string;
  tournamentName: string; status: string; message?: string;
  jockeySharePercent: number; createdAt: string;
};

/* ───────── Helpers ───────── */
const skillLabel: Record<string, string> = {
  beginner: "Tập sự", intermediate: "Trung cấp",
  advanced: "Nâng cao", professional: "Chuyên nghiệp",
};

const statusTone = (s: string) => {
  switch (s) {
    case "PENDING": return { label: "Chờ phản hồi", tone: "yellow" as const };
    case "ACCEPTED": return { label: "Đã chấp nhận", tone: "green" as const };
    case "REJECTED": return { label: "Từ chối", tone: "red" as const };
    case "CANCELLED": return { label: "Đã hủy", tone: "slate" as const };
    case "EXPIRED": return { label: "Hết hạn", tone: "yellow" as const };
    default: return { label: s, tone: "slate" as const };
  }
};

export default function JockeyInvitationsPage() {
  const [tab, setTab] = useState<"marketplace" | "history">("marketplace");
  const [jockeys, setJockeys] = useState<JockeyProfile[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [selectedJockey, setSelectedJockey] = useState<JockeyProfile | null>(null);
  const [selectedJockeyForDetail, setSelectedJockeyForDetail] = useState<JockeyProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReg, setSelectedReg] = useState("");
  const [sharePercent, setSharePercent] = useState(30);
  const [invMessage, setInvMessage] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invsRes, jockeysRes, regsRes] = await Promise.all([
        fetch("/api/owner/jockey-invitations"),
        fetch("/api/owner/jockeys"),
        fetch("/api/owner/registrations?limit=100"),
      ]);

      if (jockeysRes.ok) {
        const d = await jockeysRes.json();
        if (d.success) {
          const raw = d.data?.data || d.data || [];
          setJockeys(raw.map((j: Record<string, unknown>) => {
            const userId = j.userId as Record<string, unknown> | string | undefined;
            const userObj = typeof userId === "object" && userId !== null ? userId : null;
            return {
              id: (j.id || j._id) as string,
              userId: (userObj?._id || userObj?.id || j.userId || "") as string,
              fullName: (userObj?.fullName as string) || "Ẩn danh",
              email: (userObj?.email as string) || "",
              phone: userObj?.phone as string | undefined,
              avatar: userObj?.avatar as string | undefined,
              heightCm: (j.heightCm as number) || 0,
              weightKg: (j.weightKg as number) || 0,
              experienceYears: (j.experienceYears as number) || 0,
              status: j.status as string,
              skillLevel: j.skillLevel as string | undefined,
              bio: j.bio as string | undefined,
              specialty: j.specialty as string | undefined,
              personality: j.personality as string | undefined,
              totalRaces: (j.totalRaces as number) || 0,
              wins: (j.wins as number) || 0,
            };
          }));
        }
      }

      if (regsRes.ok) {
        const d = await regsRes.json();
        if (d.success) {
          const raw = d.data?.data || d.data || [];
          setRegistrations((raw as Record<string, unknown>[])
            .filter((r) => {
              const raceId = r.raceId as Record<string, unknown> | null | undefined;
              const raceStatus = raceId?.status as string | undefined;
              return (
                r.status === "APPROVED" &&
                !r.jockeyUserId &&
                raceStatus &&
                ["SCHEDULED", "CHECKING"].includes(raceStatus)
              );
            })
            .map((r) => {
              const raceId = r.raceId as Record<string, unknown> | null | undefined;
              const horseId = r.horseId as Record<string, unknown> | null | undefined;
              const tournamentId = r.tournamentId as Record<string, unknown> | null | undefined;
              return {
                id: (r.id || r._id) as string,
                raceName: (raceId?.name as string) || "Không rõ",
                horseName: (horseId?.name as string) || "Không rõ",
                raceStartTime: (raceId?.startTime as string) || "",
                tournamentName: (tournamentId?.name as string) || "Không rõ giải",
                tournamentId: ((tournamentId?._id || tournamentId?.id) as string) || "",
                raceId: ((raceId?._id || raceId?.id) as string) || "",
              };
            }));
        }
      }

      if (invsRes.ok) {
        const d = await invsRes.json();
        if (d.success) {
          const raw = d.data?.data || d.data || [];
          setInvitations((raw as Record<string, unknown>[]).map((i) => {
            const jockeyUserId = i.jockeyUserId as Record<string, unknown> | null | undefined;
            const horseId = i.horseId as Record<string, unknown> | null | undefined;
            const raceId = i.raceId as Record<string, unknown> | null | undefined;
            const tournamentId = i.tournamentId as Record<string, unknown> | null | undefined;
            return {
              id: (i.id || i._id) as string,
              jockeyName: (jockeyUserId?.fullName as string) || "Không rõ",
              jockeyEmail: (jockeyUserId?.email as string) || "",
              horseName: (horseId?.name as string) || "Không rõ",
              horseBreed: (horseId?.breed as string) || "",
              raceName: (raceId?.name as string) || "Không rõ",
              raceStartTime: (raceId?.startTime as string) || "",
              tournamentName: (tournamentId?.name as string) || "",
              status: i.status as string,
              message: i.message as string | undefined,
              jockeySharePercent: (i.jockeySharePercent as number) ?? 30,
              createdAt: (i.createdAt as string) || "",
            };
          }));
        }
      }
    } catch { toast.error("Lỗi kết nối tới Backend."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg || !selectedJockey) { toast.error("Vui lòng chọn đầy đủ."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/owner/jockey-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedReg,
          jockeyId: selectedJockey.userId,
          message: invMessage,
          jockeySharePercent: sharePercent,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.message || "Gửi lời mời thất bại.");
        return;
      }
      toast.success("Đã gửi lời mời thành công!");
      setShowModal(false); setSelectedReg(""); setInvMessage(""); setSharePercent(30);
      setSelectedJockey(null); loadData();
    } catch (err) {
      console.error("Lỗi khi gửi lời mời:", err);
      toast.error("Đã xảy ra lỗi hệ thống khi gửi lời mời.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Bạn có chắc muốn hủy lời mời này?")) return;
    try {
      const res = await fetch(`/api/owner/jockey-invitations/${id}/cancel`, { method: "PATCH" });
      const d = await res.json();
      if (res.ok && d.success) { toast.success("Đã hủy lời mời."); loadData(); }
      else toast.error(d.message || "Hủy thất bại.");
    } catch { toast.error("Lỗi kết nối."); }
  };

  const filtered = jockeys.filter((j) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return j.fullName.toLowerCase().includes(q) || j.email.toLowerCase().includes(q)
      || (j.specialty?.toLowerCase().includes(q)) || (j.personality?.toLowerCase().includes(q));
  });

  const availableJockeys = filtered.filter(j => j.status === "available");

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Chiêu mộ nài ngựa"
        title="Quản Lý Lời Mời Jockey"
        description="Nghiên cứu hồ sơ nài ngựa chuyên nghiệp, chọn người phù hợp và gửi lời mời cùng tỷ lệ chia thưởng tùy chỉnh."
      />

      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { key: "marketplace" as const, label: "Thị Trường Jockey", icon: Users },
          { key: "history" as const, label: "Lịch Sử Lời Mời", icon: Send },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${tab === t.key ? "bg-[#E10600] text-foreground shadow-lg shadow-red-500/20" : "bg-muted text-muted-foreground hover:bg-foreground/5 border border-border"}`}>
            <t.icon className="size-4" />{t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-foreground/55">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
        </div>
      ) : (
        <>
          {/* ── TAB 1: MARKETPLACE ── */}
          {tab === "marketplace" && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm tên, sở trường, tính tình..."
                  className="w-full h-10 rounded-xl border border-border bg-muted/40 pl-10 pr-4 text-xs text-foreground outline-none focus:border-[#E10600] transition placeholder:text-foreground/25" />
              </div>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">{availableJockeys.length} Jockey đang sẵn sàng</p>

              {availableJockeys.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border bg-card">
                  <Users className="size-12 mx-auto mb-3 opacity-20" />
                  <p className="font-bold text-sm">Không tìm thấy Jockey</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableJockeys.map(j => (
                    <div key={j.id} className="group relative rounded-2xl border border-border bg-card p-5 hover:border-[#E10600]/30 hover:bg-muted/50 dark:hover:bg-[#1C1C25] transition shadow-xl flex flex-col justify-between">
                      {/* Header */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-full border-2 border-[#E10600]/40 bg-[#E10600]/10 flex items-center justify-center overflow-hidden shrink-0">
                            {j.avatar ? <Image src={j.avatar} className="size-full object-cover rounded-full" alt="" width={48} height={48} /> : <User className="size-5 text-[#E10600]" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black uppercase text-foreground truncate">{j.fullName}</h4>
                            <p className="text-[10px] text-muted-foreground/60 font-mono truncate">{j.email}</p>
                          </div>
                        </div>
                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: "Kinh nghiệm", value: `${j.experienceYears} năm`, icon: Star },
                            { label: "Tổng trận", value: j.totalRaces.toString(), icon: Flag },
                            { label: "Chiến thắng", value: j.wins.toString(), icon: Award },
                          ].map((s, i) => (
                            <div key={i} className="p-2 rounded-lg bg-muted/50 dark:bg-black/30 border border-border">
                              <s.icon className="size-3 text-[#E10600] mx-auto mb-1" />
                              <p className="text-xs font-black text-foreground">{s.value}</p>
                              <p className="text-[8px] text-foreground/35 uppercase tracking-wider">{s.label}</p>
                            </div>
                          ))}
                        </div>
                        {/* Info rows */}
                        <div className="space-y-1.5 text-[10px]">
                          <div className="flex justify-between"><span className="text-muted-foreground/60">Trình độ</span><span className="text-foreground font-bold">{skillLabel[j.skillLevel || ""] || "Chưa xác định"}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground/60">Chiều cao / Cân nặng</span><span className="text-foreground font-bold">{j.heightCm}cm / {j.weightKg}kg</span></div>
                          {j.specialty && <div className="flex justify-between"><span className="text-muted-foreground/60">Sở trường</span><span className="text-foreground font-bold truncate max-w-[140px]">{j.specialty}</span></div>}
                          {j.personality && <div className="flex justify-between"><span className="text-muted-foreground/60">Tính tình</span><span className="text-foreground font-bold truncate max-w-[140px]">{j.personality}</span></div>}
                          {j.totalRaces > 0 && <div className="flex justify-between"><span className="text-muted-foreground/60">Tỷ lệ thắng</span><span className="text-teal-400 font-bold">{((j.wins / j.totalRaces) * 100).toFixed(1)}%</span></div>}
                        </div>
                        {j.bio && <p className="text-[10px] text-muted-foreground italic bg-muted p-2 rounded-lg leading-relaxed line-clamp-2">&ldquo;{j.bio}&rdquo;</p>}
                      </div>
                      {/* CTA */}
                      <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2">
                        <Button onClick={() => setSelectedJockeyForDetail(j)} variant="outline"
                          className="rounded-full border-border hover:bg-muted text-[10px] h-9 uppercase font-bold text-foreground">
                          <Eye className="size-3.5 mr-1" /> Chi tiết
                        </Button>
                        <Button onClick={() => { setSelectedJockey(j); setShowModal(true); setSelectedReg(""); setSharePercent(30); setInvMessage(""); }}
                          disabled={registrations.length === 0}
                          className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-[10px] h-9 uppercase font-bold text-foreground">
                          <PlusCircle className="size-3.5 mr-1" /> Mời
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: HISTORY ── */}
          {tab === "history" && (
            <div className="rounded-2xl border border-border bg-card/85 p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                  <Send className="size-5 text-[#E10600]" /> Lời mời đã gửi
                </h2>
              </div>
              {invitations.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="size-16 mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-foreground uppercase tracking-wider text-sm">Hòm thư trống</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Jockey</th>
                        <th className="px-4 py-3">Chiến mã & Giải đấu</th>
                        <th className="px-4 py-3">% Chia</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invitations.map(inv => {
                        const st = statusTone(inv.status);
                        return (
                          <tr key={inv.id} className="transition hover:bg-muted/15">
                            <td className="px-4 py-4">
                              <p className="font-black text-foreground">{inv.jockeyName}</p>
                              <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{inv.jockeyEmail}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-bold text-foreground/95">{inv.horseName}</p>
                              {inv.tournamentName && <p className="text-[10px] text-teal-400 font-bold mt-0.5"><Trophy className="inline size-3 mr-0.5" />{inv.tournamentName}</p>}
                              <p className="text-xs text-[#E10600] font-bold mt-0.5">{inv.raceName}</p>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 font-mono mt-1">
                                <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(inv.raceStartTime).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(inv.raceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-500/10 text-teal-400 font-black text-xs border border-teal-500/20">
                                <Percent className="size-3" />{inv.jockeySharePercent}%
                              </span>
                            </td>
                            <td className="px-4 py-4"><StatusBadge label={st.label} tone={st.tone} /></td>
                            <td className="px-4 py-4 text-right">
                              {inv.status === "PENDING" && (
                                <Button onClick={() => handleCancel(inv.id)} variant="ghost"
                                  className="h-8 rounded-lg text-xs font-black uppercase text-primary hover:text-red-400 hover:bg-primary/10 px-3 cursor-pointer">
                                  <XCircle className="size-3.5 mr-1" /> Hủy
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── MODAL: Send invitation ── */}
      {showModal && selectedJockey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 size-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-foreground/70 hover:text-foreground transition">
              <X className="size-4" />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E10600] flex items-center gap-1.5"><Sparkles className="size-4" /> Gửi lời mời</p>
              <h3 className="text-xl font-black uppercase text-foreground mt-1">Mời {selectedJockey.fullName}</h3>
              <p className="text-xs text-muted-foreground mt-1">Chọn trận đấu đã duyệt chưa gán Jockey để gửi lời mời.</p>
            </div>

            {/* Jockey summary */}
            <div className="p-3 rounded-xl bg-muted/50 dark:bg-black/30 border border-border flex items-center gap-3">
              <div className="size-10 rounded-full border border-[#E10600]/40 bg-[#E10600]/10 flex items-center justify-center shrink-0">
                {selectedJockey.avatar ? <Image src={selectedJockey.avatar} className="size-full object-cover rounded-full" alt="" width={40} height={40} /> : <User className="size-4 text-[#E10600]" />}
              </div>
              <div className="text-xs">
                <p className="font-black text-foreground">{selectedJockey.fullName}</p>
                <p className="text-muted-foreground/60">{selectedJockey.experienceYears} năm KN • {selectedJockey.totalRaces} trận • {selectedJockey.wins} thắng • {skillLabel[selectedJockey.skillLevel || ""] || "N/A"}</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              {/* Registration select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Chọn Ngựa & Trận đấu</label>
                <select value={selectedReg} onChange={e => setSelectedReg(e.target.value)} required
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-xs text-foreground outline-none focus:border-primary transition">
                  <option value="" disabled className="bg-card">-- Chọn slot ghi danh --</option>
                  {registrations.map(r => (
                    <option key={r.id} value={r.id} className="bg-card">
                      🐴 {r.horseName} — 🏁 {r.raceName} — 🏆 {r.tournamentName}
                    </option>
                  ))}
                </select>
                {selectedReg && (() => {
                  const r = registrations.find(x => x.id === selectedReg);
                  return r?.raceStartTime ? (
                    <p className="text-[10px] text-teal-400 flex items-center gap-1 mt-1"><Clock className="size-3" />Thời gian: {new Date(r.raceStartTime).toLocaleString("vi-VN")}</p>
                  ) : null;
                })()}
              </div>

              {/* Share percent slider */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">% Chia thưởng cho Jockey</label>
                <div className="flex items-center gap-4">
                  <input type="range" min={5} max={50} step={1} value={sharePercent} onChange={e => setSharePercent(Number(e.target.value))}
                    className="flex-1 accent-[#E10600] h-2 rounded-full" />
                  <span className="text-lg font-black text-teal-400 min-w-[50px] text-center">{sharePercent}%</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/60">
                  <span>Owner nhận: {100 - sharePercent}%</span>
                  <span>Jockey nhận: {sharePercent}%</span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Lời nhắn (Tùy chọn)</label>
                <textarea value={invMessage} onChange={e => setInvMessage(e.target.value)} rows={3}
                  className="w-full rounded-xl border border-border bg-muted/40 p-3 text-xs text-foreground outline-none focus:border-primary transition placeholder:text-muted-foreground/40"
                  placeholder="Ví dụ: Rất mong bạn đồng hành cùng chiến mã của tôi!" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={isSubmitting}
                  className="h-10 rounded-xl text-xs font-black uppercase tracking-wider border-border text-foreground bg-transparent hover:bg-muted">Đóng</Button>
                <Button type="submit" disabled={isSubmitting}
                  className="h-10 rounded-xl text-xs font-black uppercase tracking-wider text-foreground bg-[#E10600] hover:bg-[#B80500]">
                  {isSubmitting ? "Đang gửi..." : "Gửi lời mời"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Jockey profile detail ── */}
      {selectedJockeyForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedJockeyForDetail(null)} className="absolute top-4 right-4 size-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-foreground/70 hover:text-foreground transition">
              <X className="size-4" />
            </button>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E10600] flex items-center gap-1.5"><Sparkles className="size-4" /> Hồ sơ chi tiết</p>
              <h3 className="text-xl font-black uppercase text-foreground mt-1">Thông Tin Jockey</h3>
            </div>

            {/* Profile header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 dark:bg-black/30 border border-border">
              <div className="size-16 rounded-full border-2 border-[#E10600]/40 bg-[#E10600]/10 flex items-center justify-center overflow-hidden shrink-0">
                {selectedJockeyForDetail.avatar ? <Image src={selectedJockeyForDetail.avatar} className="size-full object-cover rounded-full" alt="" width={64} height={64} /> : <User className="size-8 text-[#E10600]" />}
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-black uppercase text-foreground">{selectedJockeyForDetail.fullName}</h4>
                <p className="text-xs text-[#E10600] font-bold mt-0.5">{skillLabel[selectedJockeyForDetail.skillLevel || ""] || "Chưa xác định"}</p>
                <p className="text-xs text-muted-foreground/60 font-mono mt-1">{selectedJockeyForDetail.email}</p>
              </div>
            </div>

            {/* Biography */}
            {selectedJockeyForDetail.bio && (
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground/60">Giới thiệu bản thân</label>
                <p className="text-xs text-foreground/70 italic bg-muted p-3 rounded-xl border border-border leading-relaxed">
                  &ldquo;{selectedJockeyForDetail.bio}&rdquo;
                </p>
              </div>
            )}

            {/* Stats section */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground/60">Thống kê sự nghiệp</label>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-muted/50 dark:bg-black/30 border border-border">
                  <Star className="size-4 text-[#E10600] mx-auto mb-1" />
                  <p className="text-sm font-black text-foreground">{selectedJockeyForDetail.experienceYears} năm</p>
                  <p className="text-[9px] text-foreground/35 uppercase tracking-wider mt-0.5">Kinh nghiệm</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 dark:bg-black/30 border border-border">
                  <Flag className="size-4 text-[#E10600] mx-auto mb-1" />
                  <p className="text-sm font-black text-foreground">{selectedJockeyForDetail.totalRaces}</p>
                  <p className="text-[9px] text-foreground/35 uppercase tracking-wider mt-0.5">Tổng trận</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 dark:bg-black/30 border border-border">
                  <Award className="size-4 text-[#E10600] mx-auto mb-1" />
                  <p className="text-sm font-black text-foreground">{selectedJockeyForDetail.wins}</p>
                  <p className="text-[9px] text-foreground/35 uppercase tracking-wider mt-0.5">Chiến thắng</p>
                </div>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-muted/40 dark:bg-black/25 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-border pb-1.5"><span className="text-muted-foreground/60">Chiều cao:</span><span className="font-bold text-foreground">{selectedJockeyForDetail.heightCm} cm</span></div>
                <div className="flex justify-between border-b border-border pb-1.5"><span className="text-muted-foreground/60">Cân nặng:</span><span className="font-bold text-foreground">{selectedJockeyForDetail.weightKg} kg</span></div>
                {selectedJockeyForDetail.totalRaces > 0 && (
                  <div className="flex justify-between pb-0.5"><span className="text-muted-foreground/60">Tỷ lệ thắng:</span><span className="font-bold text-teal-400">{((selectedJockeyForDetail.wins / selectedJockeyForDetail.totalRaces) * 100).toFixed(1)}%</span></div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-border pb-1.5"><span className="text-muted-foreground/60">Sở trường:</span><span className="font-bold text-foreground truncate max-w-[120px]" title={selectedJockeyForDetail.specialty}>{selectedJockeyForDetail.specialty || "N/A"}</span></div>
                <div className="flex justify-between border-b border-border pb-1.5"><span className="text-muted-foreground/60">Tính tình:</span><span className="font-bold text-foreground truncate max-w-[120px]" title={selectedJockeyForDetail.personality}>{selectedJockeyForDetail.personality || "N/A"}</span></div>
                <div className="flex justify-between pb-0.5"><span className="text-muted-foreground/60">Trạng thái:</span><span className="font-bold text-green-400 uppercase text-[9px] tracking-wider bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">Sẵn sàng</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedJockeyForDetail(null)}
                className="h-10 rounded-xl text-xs font-black uppercase tracking-wider border-border text-foreground bg-transparent hover:bg-muted">Đóng</Button>
              <Button onClick={() => { setSelectedJockey(selectedJockeyForDetail); setSelectedJockeyForDetail(null); setShowModal(true); setSelectedReg(""); setSharePercent(30); setInvMessage(""); }}
                disabled={registrations.length === 0}
                className="h-10 rounded-xl text-xs font-black uppercase tracking-wider text-foreground bg-[#E10600] hover:bg-[#B80500]">
                <PlusCircle className="size-4 mr-1.5" />
                {registrations.length === 0 ? "Chưa có slot trống" : "Gửi lời mời ngay"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
