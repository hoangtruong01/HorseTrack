"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Wallet, Search, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { usersApi, walletApi, type UserItem } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { normalizeLanguage } from "@/lib/i18n-language";

export default function CounterDepositPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = normalizeLanguage(i18n.language) === "en" ? "en-US" : "vi-VN";
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    txId: string;
    userName: string;
    email: string;
    amount: number;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await usersApi.list({ search: searchQuery, limit: 10 });
        if (res && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error("User search error:", err);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error(t("pages.counterStaff.deposit.selectCustomer"));
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error(t("pages.counterStaff.deposit.invalidAmount"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await walletApi.depositForUser(selectedUser.id, numericAmount);
      toast.success(t("pages.counterStaff.deposit.depositSuccess", { name: selectedUser.fullName }));

      setSuccessReceipt({
        txId: res?._id || res?.id || `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        userName: selectedUser.fullName,
        email: selectedUser.email,
        amount: numericAmount,
        timestamp: new Date().toLocaleString(dateLocale),
      });

      setAmount("");
      setSelectedUser(null);
      setSearchQuery("");
      setUsers([]);
    } catch (err: any) {
      toast.error(err.message || t("pages.counterStaff.deposit.depositError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-6">

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/95 bg-card p-6 shadow-2xl">
            <h2 className="text-base font-black uppercase tracking-wider dark:text-white text-foreground mb-6 flex items-center gap-2">
              <Wallet className="size-5 text-primary" /> {t("pages.counterStaff.deposit.formTitle")}
            </h2>

            <form onSubmit={handleDeposit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  {t("pages.counterStaff.deposit.step1Label")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 dark:text-white/30 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("pages.counterStaff.deposit.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.04] bg-muted/50 pl-10 pr-4 text-sm dark:text-white text-foreground outline-none transition placeholder:dark:text-white/30 text-muted-foreground focus:border-[#E10600]"
                  />
                  {searching && (
                    <RefreshCw className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 dark:text-white/30 text-muted-foreground animate-spin" />
                  )}
                </div>

                {users.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border dark:border-white/10 border-border bg-[#1A1A24] divide-y divide-white/5 shadow-2xl">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setUsers([]);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-4 py-3 hover:dark:bg-white/[0.03] bg-muted/50 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold dark:text-white text-foreground">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#E10600]/80 bg-[#E10600]/10 border border-[#E10600]/20 px-2 py-0.5 rounded">
                          {u.roles[0] || "Spectator"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="rounded-xl border border-[#E10600]/20 bg-[#E10600]/5 p-4 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-primary">{t("pages.counterStaff.deposit.selectedAccount")}</span>
                    <h4 className="text-sm font-black dark:text-white text-foreground">{selectedUser.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-xs font-bold dark:text-white/40 text-muted-foreground hover:dark:text-white text-foreground hover:underline cursor-pointer"
                  >
                    {t("pages.counterStaff.deposit.changeAccount")}
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  {t("pages.counterStaff.deposit.step2Label")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black dark:text-white/30 text-muted-foreground text-sm">₫</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder={t("pages.counterStaff.deposit.amountPlaceholder")}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={!selectedUser}
                    className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.04] bg-muted/50 pl-8 pr-4 text-base font-black font-mono dark:text-white text-foreground placeholder:dark:text-white/20 text-muted-foreground outline-none transition focus:border-[#E10600] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                {amount && !isNaN(parseFloat(amount)) && (
                  <p className="text-xs text-emerald-400 font-bold">
                    {t("pages.counterStaff.deposit.pointsConversion")}{" "}
                    <span className="underline font-black">{(parseFloat(amount) / 1000).toLocaleString()} PTS</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !selectedUser}
                className="h-12 w-full rounded-full bg-primary hover:bg-[#B80500] font-black uppercase tracking-[0.16em] text-white shadow-[0_4px_12px_rgba(225,6,0,0.25)] transition duration-200"
              >
                {isSubmitting ? t("pages.counterStaff.deposit.submitting") : t("pages.counterStaff.deposit.submit")}
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {successReceipt ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0E1712]/95 p-6 shadow-2xl text-center space-y-4 animate-[fadeIn_0.4s_ease-out]">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase dark:text-white text-foreground">{t("pages.counterStaff.deposit.successTitle")}</h3>
                <p className="text-xs text-muted-foreground">{t("pages.counterStaff.deposit.successDescription")}</p>
              </div>

              <div className="rounded-xl border dark:border-white/5 border-border dark:bg-black/40 bg-muted/20 p-4 text-left space-y-3 font-mono text-xs dark:text-white/80 text-muted-foreground">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black block">{t("pages.counterStaff.deposit.receiptTxId")}</span>
                  <span className="font-bold text-[#E10600]">{successReceipt.txId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black block">{t("pages.counterStaff.deposit.receiptCustomer")}</span>
                  <span className="font-bold dark:text-white text-foreground">{successReceipt.userName}</span>
                  <span className="block text-[10px] text-muted-foreground">{successReceipt.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black block">{t("pages.counterStaff.deposit.receiptAmount")}</span>
                  <span className="font-black text-emerald-400 text-sm">₫{successReceipt.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black block">{t("pages.counterStaff.deposit.receiptTime")}</span>
                  <span className="dark:text-white/60 text-muted-foreground">{successReceipt.timestamp}</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setSuccessReceipt(null)}
                className="w-full h-10 rounded-full dark:border-white/10 border-border dark:text-white text-foreground hover:dark:bg-white/5 bg-muted/50 font-bold text-xs"
              >
                {t("pages.counterStaff.deposit.depositAgain")}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E]/60 bg-card p-6 text-center space-y-4">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl dark:bg-white/[0.03] bg-muted/50 text-muted-foreground">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground">{t("pages.counterStaff.deposit.safeModeTitle")}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                {t("pages.counterStaff.deposit.safeModeDescription")}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
