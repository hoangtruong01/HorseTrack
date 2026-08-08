/**
 * ====================================================================
 * CHỨC NĂNG: TRANG CHỦ TỔNG QUAN ADMIN (ADMIN DASHBOARD)
 * QUYỀN SỬ DỤNG: ADMIN
 * MÔ TẢ:
 * - Hiển thị các số liệu thống kê chung, tổng quan doanh thu, số lượng ngựa, nài ngựa, và các giải đấu đang diễn ra.
 * ====================================================================
 */

import { AdminOverview } from "@/features/dashboard/components/admin-overview";

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
