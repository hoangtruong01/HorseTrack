import fs from "fs";

const file = "app/(dashboard)/jockey/page.tsx";
let s = fs.readFileSync(file, "utf8");

const reps = [
  ['import { toast } from "sonner";', 'import { normalizeLanguage } from "@/lib/i18n-language";\nimport { toast } from "sonner";'],
  ['const { t } = useTranslation();', 'const { t, i18n } = useTranslation();\n  const dateLocale = normalizeLanguage(i18n.language) === "en" ? "en-US" : "vi-VN";'],
  ['toast.error("Không thể kết nối đến server. Vui lòng thử lại.");', 'toast.error(t("jockey.ui.loadError"));'],
  ['const actionLabel = responseStatus === "ACCEPTED" ? "Chấp nhận" : "Từ chối";', 'const actionLabel = responseStatus === "ACCEPTED" ? t("jockey.ui.accept") : t("jockey.ui.reject");'],
  ['toast.success(`${actionLabel} lời mời thành công!`);', 'toast.success(t("jockey.ui.respondSuccess", { action: actionLabel.toLowerCase() }));'],
  ['toast.error("Không thể lấy thông tin chi tiết của ngựa.");', 'toast.error(t("jockey.ui.horseFetchError"));'],
  ['toast.error("Lỗi kết nối.");', 'toast.error(t("jockey.ui.connectionError"));'],
  ['if (!dateStr) return "Chưa xác định";', 'if (!dateStr) return t("jockey.ui.dateUnknown");'],
  ['return `${d.toLocaleTimeString("vi-VN", { hour: \'2-digit\', minute: \'2-digit\' })} ngày ${d.toLocaleDateString("vi-VN")}`;',
   'return `${d.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })} ${t("jockey.ui.dateAt")} ${d.toLocaleDateString(dateLocale)}`;'],
  ["Lịch thi đấu gần nhất", '{t("jockey.ui.scheduleTitle")}'],
  ["Tất cả <ChevronRight", '{t("jockey.ui.viewAll")} <ChevronRight'],
  ["Không có cuộc đua nào được chấp nhận sắp tới.", '{t("jockey.ui.noAcceptedRaces")}'],
  ['inv.raceId?.name || "Tên trận đấu"', 'inv.raceId?.name || t("jockey.ui.raceNameFallback")'],
  ["Chiến mã: {inv.horseId?.name}", '{t("jockey.ui.horseLabel", { name: inv.horseId?.name })}'],
  ["Hòm thư lời mời ({pendingInvs.length})", '{t("jockey.ui.inboxTitle", { count: pendingInvs.length })}'],
  ["Xem hết <ChevronRight", '{t("jockey.ui.viewAllInvites")} <ChevronRight'],
  ["Hòm thư trống. Hiện tại không có lời mời mới nào.", '{t("jockey.ui.inboxEmpty")}'],
  ['<span className="text-[10px] font-black uppercase text-primary">Lời mời</span>', '<span className="text-[10px] font-black uppercase text-primary">{t("jockey.ui.inviteBadge")}</span>'],
  ["Cuộc đua: {inv.raceId?.name}", '{t("jockey.ui.raceLabel", { name: inv.raceId?.name })}'],
  ["Danh sách lời mời từ Chủ chuồng", '{t("jockey.ui.invitationsTitle")}'],
  ["{pendingInvs.length} Lời mời mới", '{t("jockey.ui.newInvitesCount", { count: pendingInvs.length })}'],
  ["<h4 className=\"font-bold dark:text-white text-foreground\">Hòm thư trống</h4>", '<h4 className="font-bold dark:text-white text-foreground">{t("jockey.ui.inboxEmptyTitle")}</h4>'],
  ["Hiện tại không có lời mời thi đấu nào từ chủ chuồng gửi cho bạn. Khi các chủ ngựa cần nài ngựa chuyên nghiệp, thông tin lời mời sẽ hiển thị tại đây.", '{t("jockey.ui.inboxEmptyDesc")}'],
  ['<StatusBadge label="Chờ duyệt"', '<StatusBadge label={t("jockey.ui.pendingApproval")}'],
  ["Chủ chuồng gửi", '{t("jockey.ui.sentByOwner")}'],
  ['inv.ownerId?.phone || "Không có SĐT"', 'inv.ownerId?.phone || t("jockey.ui.noPhone")'],
  ['{submittingId === inv._id ? "Đang xử lý..." : "Từ chối"}', '{submittingId === inv._id ? t("jockey.ui.processing") : t("jockey.ui.reject")}'],
  ['{submittingId === inv._id ? "Đang xử lý..." : "Chấp nhận"}', '{submittingId === inv._id ? t("jockey.ui.processing") : t("jockey.ui.accept")}'],
  ['inv.raceId?.status === "PENDING" ? "Chờ chạy" :', 'inv.raceId?.status === "PENDING" ? t("jockey.ui.statusPending") :'],
  ['inv.raceId?.status === "READY" ? "Sẵn sàng" :', 'inv.raceId?.status === "READY" ? t("jockey.ui.statusReady") :'],
  ['inv.raceId?.status === "LIVE" ? "ĐANG CHẠY" :', 'inv.raceId?.status === "LIVE" ? t("jockey.ui.statusLive") :'],
  ['inv.raceId?.status === "FINISHED" ? "Đã xong" :', 'inv.raceId?.status === "FINISHED" ? t("jockey.ui.statusFinished") :'],
  ['inv.raceId?.status === "RESULT_PUBLISHED" ? "Đã có kết quả" : inv.raceId?.status', 'inv.raceId?.status === "RESULT_PUBLISHED" ? t("jockey.ui.statusPublished") : inv.raceId?.status'],
  ["Xem chi tiết thông số", '{t("jockey.ui.viewHorseSpecs")}'],
  ["Hồ sơ nài ngựa", '{t("jockey.ui.profileTitle")}'],
  ["JOCKEY CHUYÊN NGHIỆP", '{t("jockey.ui.proJockey").toUpperCase()}'],
  ["Số điện thoại", '{t("jockey.ui.phone")}'],
  ['profile?.phone || "Chưa cập nhật"', 'profile?.phone || t("jockey.ui.notUpdated")'],
  ["Bảng điểm & Thành tích thi đấu chính thức", '{t("jockey.ui.performanceTitle")}'],
  ["Vô địch (Hạng 1)", '{t("jockey.ui.winsLabel")}'],
  ["Tổng trận chạy", '{t("jockey.ui.totalRacesLabel")}'],
  ["Tỷ lệ thắng", '{t("jockey.ui.winRateLabel")}'],
  ["Điểm thi đấu", '{t("jockey.ui.pointsLabel")}'],
  ["Lịch sử chi tiết vị trí và điểm tích lũy của từng trận đấu được lấy trực tiếp từ kết quả chính thức do Ban giám sát cuộc đua công bố.", '{t("jockey.ui.historyNote")}'],
  ["<span className=\"text-[9px] font-bold uppercase tracking-widest text-primary\">CHI TIẾT CHIẾN MÃ</span>", '<span className="text-[9px] font-bold uppercase tracking-widest text-primary">{t("jockey.ui.modalTitle")}</span>'],
  ['{isLoadingHorse ? "Đang tải dữ liệu..." : horseDetail?.name}', '{isLoadingHorse ? t("jockey.ui.loadingData") : horseDetail?.name}'],
  ["Chưa tải lên hình ảnh của chiến mã", '{t("jockey.ui.noImage")}'],
  ["Giống ngựa", '{t("jockey.ui.breed")}'],
  ["Tuổi đời", '{t("jockey.ui.age")}'],
  ["{horseDetail.age} tuổi", '{t("jockey.ui.yearsOld", { age: horseDetail.age })}'],
  ["Giới tính", '{t("jockey.ui.gender")}'],
  ['horseDetail.gender === "male" ? "Đực" : "Cái"', 'horseDetail.gender === "male" ? t("jockey.ui.male") : t("jockey.ui.female")'],
  ["Thể trạng & Kỹ thuật thi đấu", '{t("jockey.ui.conditionTitle")}'],
  ["Sức mạnh tốc độ", '{t("jockey.ui.speedPower")}'],
  ["Sức bền dẻo dai", '{t("jockey.ui.stamina")}'],
  ["Sức khỏe", '{t("jockey.ui.health")}'],
  ['horseDetail.healthStatus === "HEALTHY" ? "Khỏe mạnh" :', 'horseDetail.healthStatus === "HEALTHY" ? t("jockey.ui.healthy") :'],
  ['horseDetail.healthStatus === "INJURED" ? "Chấn thương" : "Bị ốm"', 'horseDetail.healthStatus === "INJURED" ? t("jockey.ui.injured") : t("jockey.ui.sick")'],
  ["Thông số vật lý", '{t("jockey.ui.physicalStats")}'],
  ["Mô tả đặc điểm chiến mã", '{t("jockey.ui.descriptionLabel")}'],
  ["Không tìm thấy thông tin chiến mã.", '{t("jockey.ui.horseNotFound")}'],
  [">Đóng<", ">{t(\"jockey.ui.close\")}<"],
  ["Đang tải trạm điều hành...", '{t("jockey.ui.loadingStation")}'],
];

for (const [from, to] of reps) {
  if (!s.includes(from)) {
    console.warn("MISSING:", from.slice(0, 60));
  } else {
    s = s.replace(from, to);
  }
}

fs.writeFileSync(file, s);
console.log("done");
