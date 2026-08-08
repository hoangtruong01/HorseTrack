"use client";

/**
 * ====================================================================
 * CHỨC NĂNG: DANH SÁCH BÁO CÁO VI PHẠM (VIOLATIONS LIST)
 * QUYỀN SỬ DỤNG: REFEREE
 * MÔ TẢ:
 * - Quản lý và xem lại tất cả các lỗi vi phạm đã ghi nhận của các nài ngựa.
 * ====================================================================
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefereeViolationsWorkspacePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/referee/result-entry");
  }, [router]);

  return null;
}
