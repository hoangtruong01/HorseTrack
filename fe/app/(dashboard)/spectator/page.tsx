import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function SpectatorDashboardPage() {
  return (
    <RoutePlaceholder
      eyebrow="Bảng điều khiển Khán giả"
      title="Trung tâm Đua ngựa & Dự đoán"
      description="Khu vực dành cho khán giả duyệt cuộc đua công khai, tham gia dự đoán free nhận điểm thưởng và tạo mã đổi quà vật lý tại quầy."
      cards={[
        { label: "Dữ liệu giải đua công khai", value: "Sẵn sàng" },
        { label: "Dự đoán free (+1 / -1)", value: "Hoạt động" },
        { label: "Số dư ví điểm free", value: "3,200 Điểm" },
      ]}
      ctaHref="/spectator/wallet"
      ctaLabel="Xem ví điểm & Đổi thưởng"
    />
  );
}
