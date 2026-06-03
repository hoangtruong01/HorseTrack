"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  PlusCircle,
  Flag,
  Users,
  Wallet,
  ArrowRight,
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
  Activity,
  Medal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/data-display/stat-card";
import { PageHeader } from "@/components/layout/page-header";

type OwnerStats = {
  horses: { count: number };
  registrations: { count: number };
  winnings: { pending: number; paid: number; total: number };
};

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/owner/dashboard");
        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            setStats(resData.data);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin thống kê:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statsCards = [
    {
      label: "Chiến mã trong chuồng",
      value: isLoading ? "..." : (stats?.horses.count || 0).toString(),
      helper: "Tổng số lượng chiến mã đã được đăng ký trong danh mục của bạn.",
      icon: Users,
      tone: "neutral" as const,
      trend: "Chuồng đua",
    },
    {
      label: "Lượt đăng ký trận đua",
      value: isLoading ? "..." : (stats?.registrations.count || 0).toString(),
      helper: "Lượt đăng ký tham gia các vòng đua (chờ duyệt, đã duyệt, đã hủy).",
      icon: ClipboardCheck,
      tone: "yellow" as const,
      trend: "Ghi danh",
    },
    {
      label: "Tổng tiền thưởng tích lũy",
      value: isLoading ? "..." : `${(stats?.winnings.total || 0).toLocaleString("vi-VN")} đ`,
      helper: `Đã thanh toán: ${(stats?.winnings.paid || 0).toLocaleString("vi-VN")} đ · Chờ xử lý: ${(stats?.winnings.pending || 0).toLocaleString("vi-VN")} đ`,
      icon: Award,
      tone: "teal" as const,
      trend: "Thu nhập 70/30",
    },
  ];

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Bảng điều khiển chủ chuồng"
        title="Quản Lý Chuồng Đua"
        description="Trung tâm điều hành của chủ ngựa độc lập. Đăng ký chiến mã, ghi danh trận đấu, quản lý thu nhập phân chia 70/30 từ giải thưởng trận đua."
        actions={
          <div className="flex gap-3">
            <Button asChild className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
              <Link href="/owner/horses/new">
                Thêm chiến mã
                <PlusCircle className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 text-white">
              <Link href="/owner/races">
                Đăng ký trận đua
                <Flag className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* Hero Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#15151E] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(225,6,0,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(6,126,106,0.15),transparent_28rem)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E10600] to-transparent" />
        
        <div className="relative grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:items-center">
          <div>
            <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              TRẠM ĐIỀU HÀNH CHỦ NGỰA
            </span>
            <h2 className="mt-4 text-3xl font-black uppercase leading-tight tracking-tight text-white sm:text-4xl">
              Nâng cấp chiến mã. Chiến thắng trên mọi đường đua.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Kiểm soát quy trình từ khâu tuyển chọn, đăng ký tham gia thi đấu tới tối ưu hóa phần chia lợi nhuận 70% từ quỹ thưởng. Hãy chắc chắn ngựa luôn khỏe mạnh và sẵn sàng trước giờ xuất phát.
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-black/35 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-primary">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Phân chia thưởng
                </p>
                <p className="text-xs font-bold text-white mt-0.5">
                  Chủ ngựa nhận 70% · Nài ngựa 30%
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-2.5 text-teal-400">
                <Wallet className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Ví điểm thưởng
                </p>
                <p className="text-xs font-bold text-white mt-0.5">
                  Tỷ lệ quy đổi: 1 điểm = 100 VND
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </section>

      {/* Quick Action Hub */}
      <section className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-white">Chức năng chính</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          {/* Action 1: Danh sách ngựa */}
          <Link
            href="/owner/horses"
            className="group block rounded-2xl border border-white/5 bg-[#15151E] p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-[#E10600]/10 flex items-center justify-center border border-white/10 group-hover:border-[#E10600]/25 transition mb-4">
              <Users className="size-5 text-white/60 group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-white group-hover:text-primary transition flex items-center justify-between">
              Chuồng chiến mã
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Xem chi tiết, cập nhật thông tin và quản lý danh sách ngựa đua của riêng bạn.
            </p>
          </Link>

          {/* Action 2: Đăng ký trận đua */}
          <Link
            href="/owner/races"
            className="group block rounded-2xl border border-white/5 bg-[#15151E] p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-[#E10600]/10 flex items-center justify-center border border-white/10 group-hover:border-[#E10600]/25 transition mb-4">
              <Flag className="size-5 text-white/60 group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-white group-hover:text-primary transition flex items-center justify-between">
              Đăng ký trận đua
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Tìm các giải đấu mở đăng ký và ghi danh chiến mã khỏe mạnh để tham gia thi đấu.
            </p>
          </Link>

          {/* Action 3: Lịch sử đăng ký */}
          <Link
            href="/owner/registrations"
            className="group block rounded-2xl border border-white/5 bg-[#15151E] p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-[#E10600]/10 flex items-center justify-center border border-white/10 group-hover:border-[#E10600]/25 transition mb-4">
              <ClipboardCheck className="size-5 text-white/60 group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-white group-hover:text-primary transition flex items-center justify-between">
              Lịch sử ghi danh
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Theo dõi tiến độ phê duyệt hồ sơ trận đua và thực hiện hủy hoặc rút tên đăng ký.
            </p>
          </Link>

          {/* Action 4: Mời Jockey */}
          <Link
            href="/owner/jockey-invitations"
            className="group block rounded-2xl border border-white/5 bg-[#15151E] p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-[#E10600]/10 flex items-center justify-center border border-white/10 group-hover:border-[#E10600]/25 transition mb-4">
              <Users className="size-5 text-white/60 group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-white group-hover:text-primary transition flex items-center justify-between">
              Mời nài ngựa
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Quản lý và gửi lời mời đến nài ngựa chuyên nghiệp điều khiển ngựa chiến của bạn.
            </p>
          </Link>

          {/* Action 5: Theo dõi kết quả */}
          <Link
            href="/owner/results"
            className="group block rounded-2xl border border-white/5 bg-[#15151E] p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-[#E10600]/10 flex items-center justify-center border border-white/10 group-hover:border-[#E10600]/25 transition mb-4">
              <Activity className="size-5 text-white/60 group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-white group-hover:text-primary transition flex items-center justify-between">
              Kết quả thi đấu
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Theo dõi chi tiết kết quả xếp hạng và biên bản thời gian chạy của các trận đấu.
            </p>
          </Link>

          {/* Action 6: Bảng xếp hạng */}
          <Link
            href="/owner/rankings"
            className="group block rounded-2xl border border-white/5 bg-[#15151E] p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-[#E10600]/10 flex items-center justify-center border border-white/10 group-hover:border-[#E10600]/25 transition mb-4">
              <Medal className="size-5 text-white/60 group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-white group-hover:text-primary transition flex items-center justify-between">
              Bảng xếp hạng
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Xem đại sảnh vinh danh xếp hạng chiến mã và nài ngựa xuất sắc nhất theo số trận thắng.
            </p>
          </Link>

          {/* Action 7: Ví thưởng */}
          <Link
            href="/owner/wallet"
            className="group block rounded-2xl border border-white/5 bg-[#15151E] p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-[#E10600]/10 flex items-center justify-center border border-white/10 group-hover:border-[#E10600]/25 transition mb-4">
              <Wallet className="size-5 text-white/60 group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-white group-hover:text-primary transition flex items-center justify-between">
              Ví của tôi
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Yêu cầu rút tiền mặt (cashout), kiểm tra số dư điểm thưởng và xem sao kê ví.
            </p>
          </Link>

        </div>
      </section>
    </main>
  );
}
