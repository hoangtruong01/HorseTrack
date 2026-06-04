"use client";

import { useEffect, useState, useCallback } from "react";
import { Award, Loader2, Plus, Search, Trash2, Trophy, UserCheck, Users, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  refereeAssignmentsApi, apiFetch, racesApi, tournamentsApi,
  type AssignmentItem, type RaceItem, type TournamentItem, type UserItem, type PaginatedResult,
} from "@/lib/api-client";

/* ── status colors ── */
const statusColors: Record<string, string> = {
  assigned: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  accepted: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  declined: "text-red-400 bg-red-400/10 border-red-400/20",
  removed:  "text-gray-400 bg-gray-400/10 border-gray-400/20",
};
const statusLabel: Record<string, string> = {
  assigned: "Chờ phản hồi", accepted: "Đã nhận", declined: "Đã từ chối", removed: "Đã xóa",
};
const roleLabel: Record<string, string> = { main: "Trọng tài chính", assistant: "Trọng tài phụ" };

export default function AdminRefereeAssignmentsPage() {
  /* ── tournaments & races ── */
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [racesLoading, setRacesLoading] = useState(false);
  const [selectedRace, setSelectedRace] = useState("");

  /* ── assignments ── */
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* ── modal ── */
  const [showModal, setShowModal] = useState(false);
  const [referees, setReferees] = useState<Array<{ _id: string; fullName: string; email: string }>>([]);
  const [refereesLoading, setRefereesLoading] = useState(false);
  const [formTournament, setFormTournament] = useState("");
  const [formRaces, setFormRaces] = useState<RaceItem[]>([]);
  const [formRacesLoading, setFormRacesLoading] = useState(false);
  const [formRace, setFormRace] = useState("");
  const [formReferee, setFormReferee] = useState("");
  const [formRole, setFormRole] = useState<"main" | "assistant">("main");
  const [formSalary, setFormSalary] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [searchRef, setSearchRef] = useState("");

  /* ── fetch tournaments ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await tournamentsApi.list({ limit: 100 });
        setTournaments(res.data ?? []);
      } catch {}
    })();
  }, []);

  /* ── fetch races for selected tournament (main page) ── */
  useEffect(() => {
    if (!selectedTournament) { setRaces([]); setSelectedRace(""); return; }
    (async () => {
      setRacesLoading(true);
      try {
        const res = await racesApi.listByTournament(selectedTournament, { limit: 100 });
        const fetchedRaces = res.data ?? [];
        setRaces(fetchedRaces);
        setSelectedRace((prev) => {
          if (prev && fetchedRaces.some((r) => r._id === prev)) {
            return prev;
          }
          return "";
        });
      } catch {}
      finally { setRacesLoading(false); }
    })();
  }, [selectedTournament]);

  /* ── fetch races for modal tournament ── */
  useEffect(() => {
    if (!formTournament) { setFormRaces([]); setFormRace(""); return; }
    (async () => {
      setFormRacesLoading(true);
      setFormRace("");
      try {
        const res = await racesApi.listByTournament(formTournament, { limit: 100 });
        setFormRaces(res.data ?? []);
      } catch {}
      finally { setFormRacesLoading(false); }
    })();
  }, [formTournament]);

  /* ── fetch assignments by race ── */
  const fetchAssignments = useCallback(async (raceId: string) => {
    if (!raceId) return;
    setLoading(true);
    try {
      const res = await refereeAssignmentsApi.listByRace(raceId, { limit: 100 });
      setAssignments(res.data);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedRace) void fetchAssignments(selectedRace);
    else setAssignments([]);
  }, [selectedRace, fetchAssignments]);

  /* ── fetch available referees dynamically based on selected formRace ── */
  useEffect(() => {
    if (!formRace) {
      setReferees([]);
      setFormReferee("");
      return;
    }
    (async () => {
      setRefereesLoading(true);
      setFormReferee("");
      try {
        const data = await refereeAssignmentsApi.listAvailable(formRace);
        setReferees(data as any ?? []);
      } catch (e: any) {
        toast.error(e.message ?? "Lỗi tải danh sách trọng tài khả dụng");
      } finally {
        setRefereesLoading(false);
      }
    })();
  }, [formRace]);

  const openModal = () => {
    setShowModal(true);
    setFormTournament(selectedTournament);
    setFormRace(selectedRace);
    setFormReferee("");
    setFormRole("main");
    setFormSalary("0");
    setSearchRef("");
    // Available referees will load via useEffect when formRace is initialized/changed
  };

  /* ── create ── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRace || !formReferee) { toast.error("Vui lòng chọn vòng đua và trọng tài"); return; }
    setSubmitting(true);
    try {
      await refereeAssignmentsApi.create({
        raceId: formRace,
        refereeUserId: formReferee,
        role: formRole,
        salary: Number(formSalary),
      });
      toast.success("Phân công trọng tài thành công!");
      setShowModal(false);
      // Sync main page selection
      if (selectedTournament !== formTournament) setSelectedTournament(formTournament);
      if (selectedRace === formRace) await fetchAssignments(selectedRace);
      else setSelectedRace(formRace);
    } catch (e: any) { toast.error(e.message || "Phân công thất bại"); }
    finally { setSubmitting(false); }
  };

  /* ── remove ── */
  const handleRemove = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phân công này?")) return;
    try {
      await refereeAssignmentsApi.remove(id);
      toast.success("Đã xóa phân công");
      if (selectedRace) await fetchAssignments(selectedRace);
    } catch (e: any) { toast.error(e.message); }
  };

  /* ── helpers ── */
  const getRefName = (r: AssignmentItem["refereeUserId"]) =>
    !r ? "—" : typeof r === "object" ? r.fullName : r;
  const getRefEmail = (r: AssignmentItem["refereeUserId"]) =>
    !r || typeof r !== "object" ? "" : r.email;

  const filteredReferees = referees.filter(u => {
    if (!searchRef) return true;
    const q = searchRef.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q));
  });

  const selectedRaceName = races.find(r => r._id === selectedRace)?.name;

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Referee Assignment"
        title="Phân Công Trọng Tài"
        description="Chọn giải đấu và vòng đua để xem danh sách trọng tài, hoặc tạo phân công mới."
        actions={
          <Button onClick={openModal} className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white font-bold uppercase tracking-wider text-xs px-5 h-10 flex items-center gap-1.5">
            <Plus className="size-4" /> Phân Công Mới
          </Button>
        }
      />

      {/* ── Cascade selectors: Tournament → Race ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Giải đấu</label>
          <select
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none"
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
          >
            <option value="">— Chọn giải đấu —</option>
            {tournaments.map(t => (
              <option key={t._id} value={t._id}>{t.name} ({t.status})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Vòng đua</label>
          <select
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none disabled:opacity-40"
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
            disabled={!selectedTournament || racesLoading}
          >
            <option value="">{racesLoading ? "Đang tải..." : !selectedTournament ? "— Chọn giải đấu trước —" : "— Chọn vòng đua —"}</option>
            {races.map(r => (
              <option key={r._id} value={r._id}>
                {r.name} — {r.status} — {new Date(r.startTime).toLocaleDateString("vi-VN")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRace && (
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Trophy className="size-3.5 text-primary" />
          Đang xem: <span className="text-white font-bold">{selectedRaceName}</span>
          <span className="text-white/20">|</span>
          <span>{assignments.filter(a => a.status !== "removed").length} trọng tài</span>
        </div>
      )}

      {/* ── Assignments table ── */}
      {selectedRace && (
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent" />
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="size-12 rounded-full border border-white/10 flex items-center justify-center">
                <Users className="size-5 text-white/20" />
              </div>
              <p className="text-sm text-white/50 font-bold">Chưa có trọng tài nào được phân công</p>
              <Button onClick={openModal} variant="outline" className="rounded-full border-white/10 text-white text-xs hover:bg-white/5">
                <Plus className="size-3.5 mr-1" /> Phân công ngay
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/40">#</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/40">Trọng tài</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/40">Vai trò</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/40">Mức lương</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/40">Trạng thái</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/40">Ngày tạo</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-white/40">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assignments.map((a, i) => (
                    <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-white/30">{i + 1}</td>
                      <td className="px-5 py-4">
                        <span className="block font-bold text-white">{getRefName(a.refereeUserId)}</span>
                        <span className="text-[10px] text-white/40">{getRefEmail(a.refereeUserId)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white/70">
                          {a.role === "main" ? <Award className="size-3 text-amber-400" /> : <UserCheck className="size-3 text-blue-400" />}
                          {roleLabel[a.role] || a.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-white/80">
                        {a.salary ? a.salary.toLocaleString("vi-VN") : "0"} Điểm
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusColors[a.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                          {statusLabel[a.status] || a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/40 font-mono">
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {a.status !== "removed" && (
                          <button
                            onClick={() => handleRemove(a._id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition"
                          >
                            <Trash2 className="size-3" /> Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Create assignment modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#15151E] p-6 shadow-2xl space-y-5">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-teal-500" />

            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E10600]">New Assignment</p>
                <h3 className="text-lg font-black uppercase text-white mt-1">Phân Công Trọng Tài</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg size-8 flex items-center justify-center transition">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Tournament */}
              <label className="grid gap-1.5 text-xs font-bold text-white">
                Giải đấu <span className="text-primary">*</span>
                <select
                  required value={formTournament} onChange={(e) => setFormTournament(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/45 px-3 text-xs text-white outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">— Chọn giải đấu —</option>
                  {tournaments.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.status})</option>
                  ))}
                </select>
              </label>

              {/* Race */}
              <label className="grid gap-1.5 text-xs font-bold text-white">
                Vòng đua <span className="text-primary">*</span>
                <select
                  required value={formRace} onChange={(e) => setFormRace(e.target.value)}
                  disabled={!formTournament || formRacesLoading}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/45 px-3 text-xs text-white outline-none focus:border-primary cursor-pointer disabled:opacity-40"
                >
                  <option value="">
                    {formRacesLoading ? "Đang tải..." : !formTournament ? "— Chọn giải đấu trước —" : "— Chọn vòng đua —"}
                  </option>
                  {formRaces.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.name} — {r.status} — {new Date(r.startTime).toLocaleDateString("vi-VN")}
                    </option>
                  ))}
                </select>
                {formTournament && !formRacesLoading && formRaces.length === 0 && (
                  <span className="text-[10px] text-yellow-400">Giải đấu này chưa có vòng đua nào.</span>
                )}
              </label>

              {/* Referee */}
              <label className="grid gap-1.5 text-xs font-bold text-white">
                Trọng tài (Chỉ hiển thị các trọng tài rảnh không trùng lịch và đã ĐƯỢC DUYỆT HỒ SƠ) <span className="text-primary">*</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30 pointer-events-none" />
                  <input
                    type="text" placeholder="Tìm theo tên hoặc email..." value={searchRef}
                    disabled={!formRace}
                    onChange={(e) => setSearchRef(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/10 bg-black/45 pl-9 pr-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-primary disabled:opacity-40"
                  />
                </div>
                <select
                  required value={formReferee} onChange={(e) => setFormReferee(e.target.value)}
                  disabled={!formRace || refereesLoading}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/45 px-3 text-xs text-white outline-none focus:border-primary cursor-pointer disabled:opacity-40"
                >
                  <option value="">{!formRace ? "— Chọn vòng đua trước —" : refereesLoading ? "Đang tải trọng tài rảnh..." : "— Chọn trọng tài —"}</option>
                  {filteredReferees.map(u => (
                    <option key={u._id} value={u._id}>{u.fullName} — {u.email}</option>
                  ))}
                </select>
              </label>

              {/* Salary */}
              <label className="grid gap-1.5 text-xs font-bold text-white">
                Mức lương cho vòng đua (Điểm thưởng) <span className="text-primary">*</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  placeholder="Ví dụ: 1000"
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/45 px-3 text-xs text-white outline-none focus:border-primary"
                />
              </label>

              {/* Role */}
              <fieldset className="space-y-2">
                <legend className="text-xs font-bold text-white">Vai trò</legend>
                <div className="flex gap-3">
                  {(["main", "assistant"] as const).map(r => (
                    <label key={r}
                      className={`flex-1 flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition text-xs font-bold ${
                        formRole === r
                          ? "border-primary/50 bg-primary/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20"
                      }`}
                    >
                      <input type="radio" name="role" value={r} checked={formRole === r}
                        onChange={() => setFormRole(r)} className="sr-only" />
                      {r === "main"
                        ? <><Award className="size-4 text-amber-400" /> Trọng tài chính</>
                        : <><UserCheck className="size-4 text-blue-400" /> Trọng tài phụ</>
                      }
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={submitting}
                  className="rounded-xl px-4 h-10 border-white/10 hover:bg-white/5 text-white">
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting || !formRace || !formReferee}
                  className="rounded-xl px-5 h-10 bg-[#E10600] hover:bg-[#B80500] text-white font-bold uppercase tracking-wider text-xs disabled:opacity-40">
                  {submitting ? <><Loader2 className="size-3.5 animate-spin mr-1" /> Đang xử lý...</> : "Phân Công"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

