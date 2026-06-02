"use client";

import { useEffect, useState, useCallback } from "react";
import { UserCog, Plus, X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { usersApi, type UserItem } from "@/lib/api-client";

const ALL_ROLES = ["admin", "owner", "jockey", "referee", "spectator", "counter_staff"];

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  owner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  jockey: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  referee: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  spectator: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  counter_staff: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function AdminRolesPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, limit: 15, search: search || undefined });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      showToast(e.message ?? "Lỗi tải dữ liệu", "err");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { void fetchUsers(1); }, [fetchUsers]);

  const handleAssignRole = async (userId: string, role: string) => {
    setActionLoading(`${userId}-${role}-add`);
    try {
      await usersApi.assignRole(userId, role);
      showToast(`Đã thêm role "${role}"`);
      await fetchUsers(meta.page);
    } catch (e: any) { showToast(e.message, "err"); }
    finally { setActionLoading(null); }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    setActionLoading(`${userId}-${role}-rm`);
    try {
      await usersApi.removeRole(userId, role);
      showToast(`Đã xóa role "${role}"`);
      await fetchUsers(meta.page);
    } catch (e: any) { showToast(e.message, "err"); }
    finally { setActionLoading(null); }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Role Management"
        title="Phân Quyền Hệ Thống"
        description="Assign hoặc remove roles cho từng user. Thay đổi có hiệu lực ngay lập tức."
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          placeholder="Tìm theo tên, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Người dùng</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Roles hiện tại</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Thêm Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => {
                  const missingRoles = ALL_ROLES.filter(r => !u.roles.includes(r));
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-white">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles.map(r => (
                            <span
                              key={r}
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleColors[r] ?? "bg-white/5 text-gray-400 border-white/10"}`}
                            >
                              {r}
                              <button
                                onClick={() => handleRemoveRole(u.id, r)}
                                disabled={actionLoading === `${u.id}-${r}-rm` || (u.roles.length <= 1)}
                                className="hover:text-red-400 disabled:opacity-40 cursor-pointer"
                                title="Remove role"
                              >
                                <X className="size-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {missingRoles.map(r => (
                            <button
                              key={r}
                              onClick={() => handleAssignRole(u.id, r)}
                              disabled={actionLoading === `${u.id}-${r}-add`}
                              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:border-primary/40 hover:text-primary transition disabled:opacity-40"
                            >
                              <Plus className="size-2.5" />
                              {r}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchUsers(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchUsers(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
