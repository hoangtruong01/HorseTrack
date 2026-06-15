"use client";
import Image from "next/image";

import { useEffect, useState, useCallback } from "react";
import { Users, Ban, Trash2, Search, ChevronLeft, ChevronRight, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { usersApi, type UserItem } from "@/lib/api-client";

const ROLES = ["admin", "owner", "jockey", "referee", "spectator", "counter_staff"];
const STATUSES = ["active", "inactive", "banned", "deleted"];

const statusColors: Record<string, string> = {
  active: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  inactive: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  banned: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
  deleted: "text-gray-600 dark:text-gray-400 bg-gray-500/10 border-gray-500/20",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  owner: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  jockey: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  referee: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  spectator: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  counter_staff: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<UserItem | null>(null);
  const [rolesActionLoading, setRolesActionLoading] = useState<string | null>(null);

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
    } catch (e) {
      toast.error((e as Error).message ?? "Không tải được danh sách users");
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
        toast.success(`Đã unban ${u.fullName}`);
      } else {
        await usersApi.ban(u.id);
        toast.success(`Đã ban ${u.fullName}`);
      }
      await fetchUsers(meta.page);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (u: UserItem) => {
    setDeleteTarget(u);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      await usersApi.delete(deleteTarget.id);
      toast.success(`Đã xóa ${deleteTarget.fullName}`);
      await fetchUsers(meta.page);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const handleAssignRole = async (userId: string, role: string) => {
    setRolesActionLoading(`${role}-add`);
    try {
      await usersApi.assignRole(userId, role);
      toast.success(`Đã cấp quyền "${role}" thành công`);
      if (selectedUserForRoles && selectedUserForRoles.id === userId) {
        setSelectedUserForRoles({
          ...selectedUserForRoles,
          roles: [...selectedUserForRoles.roles, role]
        });
      }
      await fetchUsers(meta.page);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRolesActionLoading(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (selectedUserForRoles && selectedUserForRoles.roles.length <= 1) {
      toast.error("Không thể xóa vai trò cuối cùng của người dùng");
      return;
    }
    setRolesActionLoading(`${role}-rm`);
    try {
      await usersApi.removeRole(userId, role);
      toast.success(`Đã gỡ quyền "${role}" thành công`);
      if (selectedUserForRoles && selectedUserForRoles.id === userId) {
        setSelectedUserForRoles({
          ...selectedUserForRoles,
          roles: selectedUserForRoles.roles.filter(r => r !== role)
        });
      }
      await fetchUsers(meta.page);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRolesActionLoading(null);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="User & Role Management"
        title="Quản Lý & Phân Quyền"
        description="Xem thông tin, ban/unban, xóa tài khoản và phân quyền hệ thống cho từng người dùng."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-muted pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="" className="bg-card text-foreground">Tất cả Role</option>
          {ROLES.map(r => <option key={r} value={r} className="bg-card text-foreground">{r}</option>)}
        </select>
        <select
          className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="" className="bg-card text-foreground">Tất cả Status</option>
          {STATUSES.map(s => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="size-4" />
        <span>Tổng: <strong className="text-foreground">{meta.total}</strong> users — Trang {meta.page}/{meta.totalPages}</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-foreground/55">
  <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
  <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
</div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Không tìm thấy user nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Người dùng</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Roles</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngày tạo</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-muted transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-black">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map(r => (
                          <span key={r} className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleColors[r] ?? "bg-muted text-gray-400 border-border"}`}>{r}</span>
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
                          onClick={() => setSelectedUserForRoles(u)}
                          disabled={actionLoading === u.id || u.status === "deleted"}
                          className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:scale-105 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <UserCog className="size-3" />
                          Quyền
                        </button>
                        <button
                          onClick={() => handleBan(u)}
                          disabled={actionLoading === u.id || u.status === "deleted"}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed ${u.status === "banned" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20"}`}
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
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition"
          >
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button
            onClick={() => fetchUsers(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition"
          >
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa tài khoản <strong className="text-foreground">&quot;{deleteTarget?.fullName}&quot;</strong>. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xóa tài khoản</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Phân Quyền */}
      {selectedUserForRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <UserCog className="size-5 text-primary" />
                  Phân Quyền Người Dùng
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Thay đổi vai trò cho người dùng <strong>{selectedUserForRoles.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForRoles(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="py-6 space-y-4">
              <p className="text-xs text-muted-foreground">Chọn vai trò dưới đây để cấp hoặc gỡ quyền:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map((r) => {
                  const hasRole = selectedUserForRoles.roles.includes(r);
                  const isLoading = rolesActionLoading === `${r}-add` || rolesActionLoading === `${r}-rm`;

                  return (
                    <button
                      key={r}
                      disabled={rolesActionLoading !== null}
                      onClick={() => {
                        if (hasRole) {
                          handleRemoveRole(selectedUserForRoles.id, r);
                        } else {
                          handleAssignRole(selectedUserForRoles.id, r);
                        }
                      }}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 ${
                        hasRole
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-muted text-muted-foreground hover:border-primary hover:text-foreground"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider">{r}</span>
                        {isLoading ? (
                          <div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : hasRole ? (
                          <div className="size-2 rounded-full bg-primary" />
                        ) : null}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {r === "admin" && "Quyền quản trị tối cao"}
                        {r === "owner" && "Chủ sở hữu chiến mã"}
                        {r === "jockey" && "Nài ngựa chuyên nghiệp"}
                        {r === "referee" && "Trọng tài điều khiển trận"}
                        {r === "spectator" && "Khán giả / Người dự đoán"}
                        {r === "counter_staff" && "Nhân viên quầy giao dịch"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUserForRoles(null)}
                className="rounded-xl bg-muted border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


