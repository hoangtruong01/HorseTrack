"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Shield, Ban, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { usersApi, type UserItem } from "@/lib/api-client";

const ROLES = ["admin", "owner", "jockey", "referee", "spectator", "counter_staff"];
const STATUSES = ["active", "inactive", "banned", "deleted"];

const statusColors: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  inactive: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  banned: "text-red-400 bg-red-400/10 border-red-400/20",
  deleted: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  owner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  jockey: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  referee: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  spectator: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  counter_staff: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await usersApi.list({
        page,
        limit: 15,
        search: search || undefined,
        role: filterRole || undefined,
        status: filterStatus || undefined,
      });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      showToast(e.message ?? "Không tải được danh sách users", "err");
    } finally {
      setLoading(false);
    }
  }, [search, filterRole, filterStatus]);

  useEffect(() => { void fetchUsers(1); }, [fetchUsers]);

  const handleBan = async (u: UserItem) => {
    setActionLoading(u.id);
    try {
      if (u.status === "banned") {
        await usersApi.unban(u.id);
        showToast(`Đã unban ${u.fullName}`);
      } else {
        await usersApi.ban(u.id);
        showToast(`Đã ban ${u.fullName}`);
      }
      await fetchUsers(meta.page);
    } catch (e: any) {
      showToast(e.message, "err");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (u: UserItem) => {
    if (!confirm(`Xóa user "${u.fullName}"? Hành động này không thể hoàn tác.`)) return;
    setActionLoading(u.id);
    try {
      await usersApi.delete(u.id);
      showToast(`Đã xóa ${u.fullName}`);
      await fetchUsers(meta.page);
    } catch (e: any) {
      showToast(e.message, "err");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="User Management"
        title="Quản Lý Người Dùng"
        description="Xem, ban/unban, và xóa tài khoản. Tìm kiếm theo tên hoặc email."
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl transition-all ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 pl-10 pr-4 py-2.5 text-sm dark:text-white text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2.5 text-sm dark:text-white text-foreground focus:border-primary/50 focus:outline-none"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">Tất cả Role</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          className="rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2.5 text-sm dark:text-white text-foreground focus:border-primary/50 focus:outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="size-4" />
        <span>Tổng: <strong className="dark:text-white text-foreground">{meta.total}</strong> users — Trang {meta.page}/{meta.totalPages}</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Không tìm thấy user nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-white/10 border-border text-left">
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Người dùng</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Roles</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngày tạo</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:dark:bg-white/[0.02] bg-muted/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-black">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold dark:text-white text-foreground">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map(r => (
                          <span key={r} className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleColors[r] ?? "dark:bg-white/5 bg-muted/50 text-gray-400 dark:border-white/10 border-border"}`}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${statusColors[u.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleBan(u)}
                          disabled={actionLoading === u.id || u.status === "deleted"}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed ${u.status === "banned" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"}`}
                        >
                          <Ban className="size-3" />
                          {u.status === "banned" ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={actionLoading === u.id || u.status === "deleted"}
                          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:scale-105 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="size-3" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchUsers(meta.page - 1)}
            disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2 text-sm dark:text-white text-foreground hover:dark:bg-white/[0.06] bg-muted/50 disabled:opacity-40 transition"
          >
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button
            onClick={() => fetchUsers(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2 text-sm dark:text-white text-foreground hover:dark:bg-white/[0.06] bg-muted/50 disabled:opacity-40 transition"
          >
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
