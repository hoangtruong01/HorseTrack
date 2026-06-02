"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { HorseCard, type Horse } from "@/features/horses/components/horse-card";
import { toast } from "sonner";

export default function HorsesStablePage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHorses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/owner/horses");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          // Response will contain { success: true, data: [...] } or direct list
          setHorses(resData.data?.data || resData.data || []);
        }
      } else {
        toast.error("Không thể lấy danh sách chiến mã từ server.");
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách ngựa:", err);
      toast.error("Kết nối tới Backend thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHorses();
  }, []);

  const handleDelete = async (id: string) => {
    const isConfirm = window.confirm("Bạn có chắc chắn muốn xóa chiến mã này khỏi chuồng không?");
    if (!isConfirm) return;

    try {
      const response = await fetch(`/api/owner/horses/${id}`, {
        method: "DELETE",
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Đã xóa chiến mã thành công.");
        fetchHorses(); // Reload
      } else {
        toast.error(resData.message || "Xóa chiến mã thất bại.");
      }
    } catch (err) {
      console.error("Lỗi xóa ngựa:", err);
      toast.error("Lỗi kết nối tới Backend.");
    }
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Quản lý chuồng đua"
        title="Danh Sách Chiến Mã"
        description="Quản lý hồ sơ kỹ thuật, trạng thái sức khỏe của từng chiến mã. Ngựa phải khỏe mạnh mới đủ điều kiện đăng ký tham dự giải đấu."
        actions={
          <Button asChild className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
            <Link href="/owner/horses/new">
              Thêm chiến mã
              <PlusCircle className="size-4 ml-1.5" />
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải dữ liệu chuồng ngựa...</p>
        </div>
      ) : horses.length === 0 ? (
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-12 text-center shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
          <Award className="size-16 dark:text-white/15 text-muted-foreground mx-auto mb-4 stroke-[1]" />
          <h3 className="text-xl font-black dark:text-white text-foreground uppercase tracking-tight mb-2">Chuồng ngựa trống</h3>
          <p className="text-sm dark:text-white/50 text-muted-foreground max-w-md mx-auto mb-6">
            Bạn chưa đăng ký bất kỳ chiến mã nào. Hãy thêm chiến mã đầu tiên để bắt đầu ghi danh tham gia các giải đấu hấp dẫn.
          </p>
          <Button asChild className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
            <Link href="/owner/horses/new">
              Thêm chiến mã ngay
              <PlusCircle className="size-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {horses.map((horse) => (
            <HorseCard key={horse.id} horse={horse} onDelete={handleDelete} />
          ))}
        </section>
      )}
    </main>
  );
}
