"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  PlusCircle,
  Flag,
  Users,
  Wallet,
  ClipboardCheck,
  ChevronRight,
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
            <Button asChild className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-foreground">
              <Link href="/owner/horses/new">
                Thêm chiến mã
                <PlusCircle className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-border hover:bg-muted text-foreground">
              <Link href="/owner/races">
                Đăng ký trận đua
                <Flag className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </section>

      {/* Quick Action Hub */}
      <section className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-foreground">Chức năng chính</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* Action 1: Danh sách ngựa */}
          <Link
            href="/owner/horses"
            className="group block rounded-2xl border border-border bg-card p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Users className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              Chuồng chiến mã
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Xem chi tiết, cập nhật thông tin và quản lý danh sách ngựa đua của riêng bạn.
            </p>
          </Link>

          {/* Action 2: Đăng ký trận đua */}
          <Link
            href="/owner/races"
            className="group block rounded-2xl border border-border bg-card p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Flag className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              Đăng ký trận đua
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Tìm các giải đấu mở đăng ký và ghi danh chiến mã khỏe mạnh để tham gia thi đấu.
            </p>
          </Link>

          {/* Action 3: Lịch sử đăng ký */}
          <Link
            href="/owner/registrations"
            className="group block rounded-2xl border border-border bg-card p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <ClipboardCheck className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              Lịch sử ghi danh
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Theo dõi tiến độ phê duyệt hồ sơ trận đua và thực hiện hủy hoặc rút tên đăng ký.
            </p>
          </Link>

          {/* Action 4: Mời Jockey */}
          <Link
            href="/owner/jockey-invitations"
            className="group block rounded-2xl border border-border bg-card p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Users className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              Mời nài ngựa
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Quản lý và gửi lời mời đến nài ngựa chuyên nghiệp điều khiển ngựa chiến của bạn.
            </p>
          </Link>

          {/* Action 5: Theo dõi kết quả */}
          <Link
            href="/owner/results"
            className="group block rounded-2xl border border-border bg-card p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Activity className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              Kết quả thi đấu
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Theo dõi chi tiết kết quả xếp hạng và biên bản thời gian chạy của các trận đấu.
            </p>
          </Link>

          {/* Action 6: Bảng xếp hạng */}
          <Link
            href="/owner/rankings"
            className="group block rounded-2xl border border-border bg-card p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Medal className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              Bảng xếp hạng
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Xem đại sảnh vinh danh xếp hạng chiến mã và nài ngựa xuất sắc nhất theo số trận thắng.
            </p>
          </Link>

          {/* Action 7: Ví thưởng */}
          <Link
            href="/owner/wallet"
            className="group block rounded-2xl border border-border bg-card p-5 hover:border-[#E10600]/30 hover:bg-[#1C1C25] transition shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Wallet className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              Ví của tôi
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Yêu cầu rút tiền mặt (cashout), kiểm tra số dư điểm thưởng và xem sao kê ví.
            </p>
          </Link>

        </div>
      </section>
    </main>
  );
}
