import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppLanguage(customLang?: string): string {
  if (customLang) return customLang;
  if (typeof window !== "undefined") {
    return localStorage.getItem("language") || "vi";
  }
  return "vi";
}

export function getHorseImage(
  horse:
    | {
        images?: string[];
        image?: string;
        imageUrl?: string;
        avatar?: string;
      }
    | null
    | undefined,
): string {
  if (!horse) return "";
  if (Array.isArray(horse.images) && horse.images.length > 0 && horse.images[0]) {
    return horse.images[0];
  }
  return horse.image || horse.imageUrl || horse.avatar || "";
}

export function getUserAvatar(
  user:
    | {
        avatar?: string;
        profileImage?: string;
      }
    | null
    | undefined,
): string {
  if (!user) return "";
  return user.avatar || user.profileImage || "";
}

export const TOURNAMENT_STATUS_MAP: Record<string, { vi: string; en: string }> = {
  DRAFT: { vi: "Bản nháp", en: "Draft" },
  UPCOMING: { vi: "Sắp diễn ra", en: "Upcoming" },
  OPEN_REGISTRATION: { vi: "Mở đăng ký", en: "Open Registration" },
  CLOSED_REGISTRATION: { vi: "Đóng đăng ký", en: "Registration Closed" },
  REGISTRATION_CLOSED: { vi: "Đóng đăng ký", en: "Registration Closed" },
  ONGOING: { vi: "Đang diễn ra", en: "Ongoing" },
  COMPLETED: { vi: "Đã kết thúc", en: "Completed" },
  FINISHED: { vi: "Đã kết thúc", en: "Finished" },
  CANCELLED: { vi: "Đã hủy", en: "Cancelled" },
};

export const RACE_STATUS_MAP: Record<string, { vi: string; en: string }> = {
  SCHEDULED: { vi: "Đã lên lịch", en: "Scheduled" },
  CHECKING: { vi: "Kiểm tra thực địa", en: "Checking" },
  READY: { vi: "Sẵn sàng", en: "Ready" },
  LIVE: { vi: "Đang diễn ra", en: "Live" },
  FINISHED: { vi: "Đã kết thúc", en: "Finished" },
  RESULT_PUBLISHED: { vi: "Đã công bố kết quả", en: "Result Published" },
  CANCELLED: { vi: "Đã hủy", en: "Cancelled" },
};

export const REGISTRATION_STATUS_MAP: Record<string, { vi: string; en: string }> = {
  PENDING: { vi: "Chờ duyệt", en: "Pending" },
  APPROVED: { vi: "Đã chấp nhận", en: "Approved" },
  REJECTED: { vi: "Bị từ chối", en: "Rejected" },
  CANCELLED: { vi: "Đã hủy", en: "Cancelled" },
};

export const HORSE_APPROVAL_STATUS_MAP: Record<string, { vi: string; en: string }> = {
  PENDING: { vi: "Chờ duyệt", en: "Pending" },
  APPROVED: { vi: "Đã duyệt", en: "Approved" },
  REJECTED: { vi: "Bị từ chối", en: "Rejected" },
};

export function formatTournamentStatus(status?: string | null, customLang?: string): string {
  if (!status) return "";
  const entry = TOURNAMENT_STATUS_MAP[status.toUpperCase()];
  if (!entry) return status;
  const currentLang = getAppLanguage(customLang);
  return currentLang.startsWith("en") ? entry.en : entry.vi;
}

export function formatRaceStatus(status?: string | null, customLang?: string): string {
  if (!status) return "";
  const entry = RACE_STATUS_MAP[status.toUpperCase()];
  if (!entry) return status;
  const currentLang = getAppLanguage(customLang);
  return currentLang.startsWith("en") ? entry.en : entry.vi;
}

export function formatRegistrationStatus(status?: string | null, customLang?: string): string {
  if (!status) return "";
  const entry = REGISTRATION_STATUS_MAP[status.toUpperCase()];
  if (!entry) return status;
  const currentLang = getAppLanguage(customLang);
  return currentLang.startsWith("en") ? entry.en : entry.vi;
}

export function formatHorseApprovalStatus(status?: string | null, customLang?: string): string {
  if (!status) return "";
  const entry = HORSE_APPROVAL_STATUS_MAP[status.toUpperCase()];
  if (!entry) return status;
  const currentLang = getAppLanguage(customLang);
  return currentLang.startsWith("en") ? entry.en : entry.vi;
}
