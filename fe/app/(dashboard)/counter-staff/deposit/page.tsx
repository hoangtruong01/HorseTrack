"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Wallet, Search, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { usersApi, walletApi, type UserItem } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export default function CounterDepositPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    txId: string;
    userName: string;
    email: string;
    amount: number;
    timestamp: string;
  } | null>(null);

  // Search users whenever query changes
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await usersApi.list({ search: searchQuery, limit: 10 });
        if (res && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm user:", err);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Vui lòng chọn một khách hàng.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Số tiền nạp phải lớn hơn 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await walletApi.depositForUser(selectedUser.id, numericAmount);
      toast.success(`Nạp tiền thành công cho ${selectedUser.fullName}!`);
      
      setSuccessReceipt({
        txId: res?._id || res?.id || `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        userName: selectedUser.fullName,
        email: selectedUser.email,
        amount: numericAmount,
        timestamp: new Date().toLocaleString("vi-VN"),
      });

      // Clear inputs
      setAmount("");
      setSelectedUser(null);
      setSearchQuery("");
      setUsers([]);
    } catch (err: any) {
      toast.error(err.message || "Lỗi trong quá trình nạp điểm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Wallet Topup"
        title="Nạp Tiền Cho Khách Hàng"
        description="Nạp số dư ví trực tiếp tại quầy giao dịch cho người dùng. Khách hàng trả tiền mặt, quầy quy đổi và nạp ví điện tử."
      />

      <div className="grid gap-6 md:grid-cols-5">
        {/* Main Form Area */}
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-6 shadow-2xl">
            <h2 className="text-base font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
              <Wallet className="size-5 text-primary" /> Chi tiết giao dịch nạp điểm
            </h2>

            <form onSubmit={handleDeposit} className="space-y-5">
              {/* User Search Input */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  1. Tìm kiếm tài khoản khách hàng
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Nhập tên, email hoặc số điện thoại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#E10600]"
                  />
                  {searching && (
                    <RefreshCw className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-white/30 animate-spin" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {users.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#1A1A24] divide-y divide-white/5 shadow-2xl">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setUsers([]);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-white/[0.03] transition flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#E10600]/80 bg-[#E10600]/10 border border-[#E10600]/20 px-2 py-0.5 rounded">
                          {u.roles[0] || "Spectator"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected User Showcase */}
              {selectedUser && (
                <div className="rounded-xl border border-[#E10600]/20 bg-[#E10600]/5 p-4 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-primary">Tài khoản được chọn</span>
                    <h4 className="text-sm font-black text-white">{selectedUser.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-xs font-bold text-white/40 hover:text-white hover:underline cursor-pointer"
                  >
                    Thay đổi
                  </button>
                </div>
              )}

              {/* Deposit Amount */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  2. Số tiền nạp ví (VND)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-white/30 text-sm">₫</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="Ví dụ: 100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={!selectedUser}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-8 pr-4 text-base font-black font-mono text-white placeholder:text-white/20 outline-none transition focus:border-[#E10600] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                {amount && !isNaN(parseFloat(amount)) && (
                  <p className="text-xs text-emerald-400 font-bold">
                    Quy đổi điểm tương ứng: <span className="underline font-black">{(parseFloat(amount) / 1000).toLocaleString()} PTS</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !selectedUser}
                className="h-12 w-full rounded-full bg-primary hover:bg-[#B80500] font-black uppercase tracking-[0.16em] text-white shadow-[0_4px_12px_rgba(225,6,0,0.25)] transition duration-200"
              >
                {isSubmitting ? "Đang xử lý nạp điểm..." : "Xác nhận nạp ví"}
              </Button>
            </form>
          </div>
        </div>

        {/* Receipt Showcase Sidebar */}
        <div className="md:col-span-2 space-y-6">
          {successReceipt ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0E1712]/95 p-6 shadow-2xl text-center space-y-4 animate-[fadeIn_0.4s_ease-out]">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-white">Nạp tiền thành công</h3>
                <p className="text-xs text-muted-foreground">Giao dịch đã được ghi nhận vào ví người dùng</p>
              </div>

              {/* Transaction Receipt Card */}
              <div className="rounded-xl border border-white/5 bg-black/40 p-4 text-left space-y-3 font-mono text-xs text-white/80">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black block">Mã giao dịch</span>
                  <span className="font-bold text-[#E10600]">{successReceipt.txId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black block">Khách hàng</span>
                  <span className="font-bold text-white">{successReceipt.userName}</span>
                  <span className="block text-[10px] text-muted-foreground">{successReceipt.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black block">Số tiền nạp</span>
                  <span className="font-black text-emerald-400 text-sm">₫{successReceipt.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black block">Thời gian</span>
                  <span className="text-white/60">{successReceipt.timestamp}</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setSuccessReceipt(null)}
                className="w-full h-10 rounded-full border-white/10 text-white hover:bg-white/5 font-bold text-xs"
              >
                Thực hiện nạp tiếp
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-[#15151E]/60 p-6 text-center space-y-4">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white/[0.03] text-muted-foreground">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Chế độ quầy an toàn</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Tất cả các giao dịch nạp điểm tại quầy đều được kiểm toán nghiêm ngặt và lưu lại dưới dạng Audit Log. Hãy chắc chắn rằng bạn đã nhận đủ tiền mặt trước khi nhấn xác nhận nạp ví.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
