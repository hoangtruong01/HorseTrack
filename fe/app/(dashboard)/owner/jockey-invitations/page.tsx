"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
            raceName: item.raceId?.name || t("common.unknownRace"),
            raceStartTime: item.raceId?.startTime || new Date().toISOString(),
            horseName: item.horseId?.name || t("common.unknownHorse"),
            horseBreed: item.horseId?.breed || "",
            jockeyName: item.jockeyUserId?.fullName || t("common.unknownJockey"),
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
            fullName: item.userId?.fullName || t("common.anonymous"),
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
              raceName: item.raceId?.name || t("common.unknownRace"),
              horseName: item.horseId?.name || t("common.unknownHorse"),
            }));
          setRegistrations(rList);
        }
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu mời Jockey:", err);
      toast.error(t("common.backendError"));
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
      toast.error(t("pages.owner.jockeyInvitations.toast.selectRequired"));
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
        throw new Error(resData.message || t("pages.owner.jockeyInvitations.toast.sendFailed"));
      }

      toast.success(t("pages.owner.jockeyInvitations.toast.sendSuccess"));
      setShowModal(false);
      setSelectedReg("");
      setSelectedJockey("");
      setInvitationMessage("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || t("pages.owner.jockeyInvitations.toast.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    const isConfirm = window.confirm(t("pages.owner.jockeyInvitations.toast.cancelConfirm"));
    if (!isConfirm) return;

    try {
      const response = await fetch(`/api/owner/jockey-invitations/${id}/cancel`, {
        method: "PATCH",
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success(t("pages.owner.jockeyInvitations.toast.cancelSuccess"));
        loadData();
      } else {
        toast.error(resData.message || t("pages.owner.jockeyInvitations.toast.cancelFailed"));
      }
    } catch (err) {
      console.error("Lỗi hủy lời mời:", err);
      toast.error(t("common.networkError"));
    }
  };

  const getStatusToneAndLabel = (status: string) => {
    const statusKey = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "EXPIRED"].includes(status)
      ? status
      : null;
    if (statusKey) {
      const toneMap: Record<string, "slate" | "green" | "red" | "yellow"> = {
        PENDING: "slate",
        ACCEPTED: "green",
        REJECTED: "red",
        CANCELLED: "slate",
        EXPIRED: "yellow",
      };
      return {
        label: t(`pages.owner.jockeyInvitations.status.${statusKey}`),
        tone: toneMap[statusKey],
      };
    }
    return { label: status, tone: "slate" as const };
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow={t("pages.owner.jockeyInvitations.eyebrow")}
        title={t("pages.owner.jockeyInvitations.title")}
        description={t("pages.owner.jockeyInvitations.description")}
        actions={
          <Button
            onClick={() => {
              if (registrations.length === 0) {
                toast.info(t("pages.owner.jockeyInvitations.toast.noApprovedRegistrations"));
              }
              setShowModal(true);
            }}
            className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white"
          >
            {t("pages.owner.jockeyInvitations.inviteJockey")}
            <PlusCircle className="size-4 ml-1.5" />
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">{t("pages.owner.jockeyInvitations.loading")}</p>
        </div>
      ) : (
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
          <div className="flex items-center justify-between border-b dark:border-white/5 border-border pb-4 mb-5">
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white text-foreground flex items-center gap-2">
              <Send className="size-5 text-[#E10600]" /> {t("pages.owner.jockeyInvitations.sentInvitations")}
            </h2>
          </div>

          {invitations.length === 0 ? (
            <div className="text-center py-16 dark:text-white/50 text-muted-foreground">
              <Users className="size-16 mx-auto mb-4 opacity-20" />
              <p className="font-bold dark:text-white text-foreground uppercase tracking-wider text-sm">{t("pages.owner.jockeyInvitations.emptyTitle")}</p>
              <p className="text-xs dark:text-white/40 text-muted-foreground mt-1 max-w-md mx-auto">
                {t("pages.owner.jockeyInvitations.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="dark:bg-white/[0.03] bg-muted/50 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground border-b dark:border-white/5 border-border">
                  <tr>
                    <th className="px-4 py-3">{t("pages.owner.jockeyInvitations.table.jockey")}</th>
                    <th className="px-4 py-3">{t("pages.owner.jockeyInvitations.table.horseAndRace")}</th>
                    <th className="px-4 py-3">{t("pages.owner.jockeyInvitations.table.message")}</th>
                    <th className="px-4 py-3">{t("pages.owner.jockeyInvitations.table.status")}</th>
                    <th className="px-4 py-3 text-right">{t("pages.owner.jockeyInvitations.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invitations.map((inv) => {
                    const st = getStatusToneAndLabel(inv.status);
                    return (
                      <tr key={inv.id} className="transition hover:dark:bg-white/[0.015] bg-muted/50">
                        <td className="px-4 py-4">
                          <p className="font-black dark:text-white text-foreground">{inv.jockeyName}</p>
                          <p className="text-[10px] dark:text-white/40 text-muted-foreground font-mono mt-0.5">{inv.jockeyEmail || t("common.na")}</p>
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
                            {inv.message || t("common.noMessage")}
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
                              <XCircle className="size-3.5 mr-1" /> {t("pages.owner.jockeyInvitations.cancelInvitation")}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/60 bg-muted/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E10600] flex items-center gap-1.5">
                <Sparkles className="size-4" /> {t("pages.owner.jockeyInvitations.modal.eyebrow")}
              </p>
              <h3 className="text-2xl font-black uppercase dark:text-white text-foreground mt-1">{t("pages.owner.jockeyInvitations.modal.title")}</h3>
              <p className="text-xs dark:text-white/50 text-muted-foreground mt-1">
                {t("pages.owner.jockeyInvitations.modal.note")}
              </p>
            </div>

            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider dark:text-white/60 text-muted-foreground">
                  {t("pages.owner.jockeyInvitations.modal.selectRegistration")}
                </label>
                <select
                  value={selectedReg}
                  onChange={(e) => setSelectedReg(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/40 bg-muted/20 px-3 text-xs dark:text-white text-foreground outline-none focus:border-primary transition"
                >
                  <option value="" disabled className="dark:bg-[#15151E] bg-card">{t("pages.owner.jockeyInvitations.modal.selectRegistrationPlaceholder")}</option>
                  {registrations.map((r) => (
                    <option key={r.id} value={r.id} className="dark:bg-[#15151E] bg-card">
                      {r.horseName} - {r.raceName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider dark:text-white/60 text-muted-foreground">
                  {t("pages.owner.jockeyInvitations.modal.selectJockey")}
                </label>
                <select
                  value={selectedJockey}
                  onChange={(e) => setSelectedJockey(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/40 bg-muted/20 px-3 text-xs dark:text-white text-foreground outline-none focus:border-primary transition"
                >
                  <option value="" disabled className="dark:bg-[#15151E] bg-card">{t("pages.owner.jockeyInvitations.modal.selectJockeyPlaceholder")}</option>
                  {jockeys.map((j) => (
                    <option key={j.id} value={j.userId} className="dark:bg-[#15151E] bg-card">
                      {j.fullName} {j.experienceYears ? t("common.experienceYears", { years: j.experienceYears }) : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider dark:text-white/60 text-muted-foreground">
                  {t("pages.owner.jockeyInvitations.modal.messageLabel")}
                </label>
                <textarea
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/40 bg-muted/20 p-3 text-xs dark:text-white text-foreground outline-none focus:border-primary transition placeholder:dark:text-white/20 text-muted-foreground"
                  placeholder={t("pages.owner.jockeyInvitations.modal.messagePlaceholder")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="h-10 rounded-xl text-xs font-black uppercase tracking-wider dark:border-white/10 border-border dark:text-white text-foreground bg-transparent hover:dark:bg-white/5 bg-muted/50"
                >
                  {t("common.close")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#E10600] hover:bg-[#B80500]"
                >
                  {isSubmitting ? t("pages.owner.jockeyInvitations.modal.sending") : t("pages.owner.jockeyInvitations.modal.send")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
