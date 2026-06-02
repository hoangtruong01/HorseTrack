"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Users,
  Loader2,
  Send,
  Calendar,
  Clock,
  XCircle,
  PlusCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type Invitation = {
  id: string;
  registrationId: string;
  raceName: string;
  raceStartTime: string;
  horseName: string;
  horseBreed: string;
  jockeyName: string;
  jockeyEmail: string;
  jockeyPhone: string;
  status: string;
  message?: string;
  createdAt: string;
};

type Jockey = {
  id: string;
  userId: string;
  fullName: string;
  status: string;
  experienceYears?: number;
};

type Registration = {
  id: string;
  raceName: string;
  horseName: string;
};

export default function JockeyInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [selectedReg, setSelectedReg] = useState("");
  const [selectedJockey, setSelectedJockey] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invsRes, jockeysRes, regsRes] = await Promise.all([
        fetch("/api/owner/jockey-invitations"),
        fetch("/api/owner/jockeys"),
        fetch("/api/owner/registrations"),
      ]);

      if (invsRes.ok) {
        const resData = await invsRes.json();
        if (resData.success) {
          const raw = resData.data?.data || resData.data || [];
          const mapped: Invitation[] = raw.map((item: any) => ({
            id: item.id || item._id,
            registrationId: item.registrationId?._id || item.registrationId?.id || "",
            raceName: item.raceId?.name || "Không rõ trận đua",
            raceStartTime: item.raceId?.startTime || new Date().toISOString(),
            horseName: item.horseId?.name || "Không rõ chiến mã",
            horseBreed: item.horseId?.breed || "",
            jockeyName: item.jockeyUserId?.fullName || "Không rõ Jockey",
            jockeyEmail: item.jockeyUserId?.email || "",
            jockeyPhone: item.jockeyUserId?.phone || "",
            status: item.status,
            message: item.message,
            createdAt: item.createdAt || new Date().toISOString(),
          }));
          setInvitations(mapped);
        }
      }

      if (jockeysRes.ok) {
        const resData = await jockeysRes.json();
        if (resData.success) {
          const raw = resData.data?.data || resData.data || [];
          const jList = raw.map((item: any) => ({
            id: item.id || item._id,
            userId: item.userId?._id || item.userId?.id || item.userId || "",
            fullName: item.userId?.fullName || "Ẩn danh",
            status: item.status,
            experienceYears: item.experienceYears,
          }));
          setJockeys(jList.filter((j: any) => j.status === "AVAILABLE"));
        }
      }

      if (regsRes.ok) {
        const resData = await regsRes.json();
        if (resData.success) {
          const raw = resData.data?.data || resData.data || [];
          const rList = raw
            .filter((item: any) => item.status === "APPROVED" && !item.jockeyUserId)
            .map((item: any) => ({
              id: item.id || item._id,
              raceName: item.raceId?.name || "Không rõ trận đua",
              horseName: item.horseId?.name || "Không rõ chiến mã",
            }));
          setRegistrations(rList);
        }
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu mời Jockey:", err);
      toast.error("Lỗi kết nối tới Backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg || !selectedJockey) {
      toast.error("Vui lòng chọn đầy đủ chiến mã trận đua và Jockey.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/owner/jockey-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedReg,
          jockeyId: selectedJockey,
          message: invitationMessage,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Gửi lời mời Jockey thất bại.");
      }

      toast.success("Đã gửi lời mời tới Jockey thành công!");
      setShowModal(false);
      setSelectedReg("");
      setSelectedJockey("");
      setInvitationMessage("");
      loadData(); // Reload
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    const isConfirm = window.confirm("Bạn có chắc chắn muốn hủy lời mời Jockey này không?");
    if (!isConfirm) return;

    try {
      const response = await fetch(`/api/owner/jockey-invitations/${id}/cancel`, {
        method: "PATCH",
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Đã hủy lời mời thành công.");
        loadData(); // Reload
      } else {
        toast.error(resData.message || "Hủy lời mời thất bại.");
      }
    } catch (err) {
      console.error("Lỗi hủy lời mời:", err);
      toast.error("Lỗi kết nối mạng.");
    }
  };

  const getStatusToneAndLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "Chờ phản hồi", tone: "slate" as const };
      case "ACCEPTED":
        return { label: "Đã chấp nhận", tone: "green" as const };
      case "REJECTED":
        return { label: "Từ chối", tone: "red" as const };
      case "CANCELLED":
        return { label: "Đã hủy", tone: "slate" as const };
      case "EXPIRED":
        return { label: "Hết hạn", tone: "yellow" as const };
      default:
        return { label: status, tone: "slate" as const };
    }
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Chiêu mộ nài ngựa"
        title="Quản Lý Lời Mời Jockey"
        description="Gửi lời mời tới các nài ngựa (Jockey) chuyên nghiệp để lái chiến mã của bạn trong các giải đua đã được phê duyệt hồ sơ."
        actions={
          <Button
            onClick={() => {
              if (registrations.length === 0) {
                toast.info("Không có lượt đăng ký được phê duyệt nào trống Jockey để gửi lời mời!");
              }
              setShowModal(true);
            }}
            className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white"
          >
            Mời Jockey
            <PlusCircle className="size-4 ml-1.5" />
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải lịch sử mời Jockey...</p>
        </div>
      ) : (
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
          <div className="flex items-center justify-between border-b dark:border-white/5 border-border pb-4 mb-5">
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white text-foreground flex items-center gap-2">
              <Send className="size-5 text-[#E10600]" /> Lời mời đã gửi
            </h2>
          </div>

          {invitations.length === 0 ? (
            <div className="text-center py-16 dark:text-white/50 text-muted-foreground">
              <Users className="size-16 mx-auto mb-4 opacity-20" />
              <p className="font-bold dark:text-white text-foreground uppercase tracking-wider text-sm">Hòm thư trống</p>
              <p className="text-xs dark:text-white/40 text-muted-foreground mt-1 max-w-md mx-auto">
                Bạn chưa gửi bất kỳ lời mời cộng tác Jockey nào. Gửi lời mời mới ngay để chuẩn bị tốt nhất cho trận đua sắp tới!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="dark:bg-white/[0.03] bg-muted/50 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground border-b dark:border-white/5 border-border">
                  <tr>
                    <th className="px-4 py-3">Jockey</th>
                    <th className="px-4 py-3">Chiến mã & Trận đấu</th>
                    <th className="px-4 py-3">Lời nhắn</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invitations.map((inv) => {
                    const st = getStatusToneAndLabel(inv.status);
                    return (
                      <tr key={inv.id} className="transition hover:dark:bg-white/[0.015] bg-muted/50">
                        <td className="px-4 py-4">
                          <p className="font-black dark:text-white text-foreground">{inv.jockeyName}</p>
                          <p className="text-[10px] dark:text-white/40 text-muted-foreground font-mono mt-0.5">{inv.jockeyEmail || "N/A"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold dark:text-white/95 text-muted-foreground">{inv.horseName}</p>
                          <p className="text-xs text-[#E10600] font-bold mt-0.5">{inv.raceName}</p>
                          <div className="flex items-center gap-3 text-[10px] dark:text-white/40 text-muted-foreground font-mono mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-primary" />
                              {new Date(inv.raceStartTime).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(inv.raceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-[200px] truncate">
                          <p className="text-xs dark:text-white/70 text-muted-foreground italic flex items-center gap-1.5">
                            <MessageSquare className="size-3 dark:text-white/30 text-muted-foreground shrink-0" />
                            {inv.message || "Không có lời nhắn."}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge label={st.label} tone={st.tone} />
                        </td>
                        <td className="px-4 py-4 text-right">
                          {inv.status === "PENDING" && (
                            <Button
                              onClick={() => handleCancelInvitation(inv.id)}
                              variant="ghost"
                              className="h-8 rounded-lg text-xs font-black uppercase text-primary hover:text-red-400 hover:bg-primary/10 px-3 cursor-pointer"
                            >
                              <XCircle className="size-3.5 mr-1" /> Hủy lời mời
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog for sending invitations */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/60 bg-muted/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E10600] flex items-center gap-1.5">
                <Sparkles className="size-4" /> Chiêu mộ nài ngựa
              </p>
              <h3 className="text-2xl font-black uppercase dark:text-white text-foreground mt-1">Gửi Lời Mời Jockey</h3>
              <p className="text-xs dark:text-white/50 text-muted-foreground mt-1">
                Lưu ý: Chỉ những hồ sơ ghi danh chiến mã đã được Ban Tổ Chức duyệt (APPROVED) và chưa được gán Jockey mới hiển thị bên dưới.
              </p>
            </div>

            <form onSubmit={handleSendInvitation} className="space-y-4">
              {/* Select Registration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider dark:text-white/60 text-muted-foreground">
                  Chọn Lượt Ghi Danh Khả Dụng
                </label>
                <select
                  value={selectedReg}
                  onChange={(e) => setSelectedReg(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/40 bg-muted/20 px-3 text-xs dark:text-white text-foreground outline-none focus:border-primary transition"
                >
                  <option value="" disabled className="dark:bg-[#15151E] bg-card">-- Chọn lượt đăng ký trận đấu --</option>
                  {registrations.map((r) => (
                    <option key={r.id} value={r.id} className="dark:bg-[#15151E] bg-card">
                      {r.horseName} - {r.raceName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Jockey */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider dark:text-white/60 text-muted-foreground">
                  Chọn Jockey Đang Rảnh (AVAILABLE)
                </label>
                <select
                  value={selectedJockey}
                  onChange={(e) => setSelectedJockey(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/40 bg-muted/20 px-3 text-xs dark:text-white text-foreground outline-none focus:border-primary transition"
                >
                  <option value="" disabled className="dark:bg-[#15151E] bg-card">-- Chọn Jockey tự do --</option>
                  {jockeys.map((j) => (
                    <option key={j.id} value={j.userId} className="dark:bg-[#15151E] bg-card">
                      {j.fullName} {j.experienceYears ? `(${j.experienceYears} năm kinh nghiệm)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider dark:text-white/60 text-muted-foreground">
                  Lời nhắn gửi Jockey (Tùy chọn)
                </label>
                <textarea
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/40 bg-muted/20 p-3 text-xs dark:text-white text-foreground outline-none focus:border-primary transition placeholder:dark:text-white/20 text-muted-foreground"
                  placeholder="Ví dụ: Rất mong bạn sẽ đồng hành cùng chiến mã của mình trong giải đua lần này!"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="h-10 rounded-xl text-xs font-black uppercase tracking-wider dark:border-white/10 border-border dark:text-white text-foreground bg-transparent hover:dark:bg-white/5 bg-muted/50"
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#E10600] hover:bg-[#B80500]"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi lời mời"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
