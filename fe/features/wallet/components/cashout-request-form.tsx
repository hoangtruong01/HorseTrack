"use client";

import { AlertTriangle, Banknote, Landmark, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export type CashoutRequestFormProps = {
  availablePoints: number;
  onSubmit: (points: number, bankAccount: string, bankName: string) => void;
  onCancel: () => void;
};

const BANK_OPTIONS = [
  "Vietcombank",
  "Techcombank",
  "BIDV",
  "Agribank",
  "Vietinbank",
  "MB Bank",
  "ACB",
  "TPBank",
];

export function CashoutRequestForm({ availablePoints, onSubmit, onCancel }: CashoutRequestFormProps) {
  const [points, setPoints] = useState<number>(Math.min(1000, availablePoints));
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState(BANK_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const pointsStr = points === 0 ? "" : points.toString();
  const vndEquivalent = points * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (points <= 0) {
      toast.error("Please enter a positive amount of points.");
      return;
    }
    if (points > availablePoints) {
      toast.error("Withdrawal amount exceeds your available points balance.");
      return;
    }
    if (points < 500) {
      toast.error("Minimum withdrawal amount is 500 reward points (50,000 VND).");
      return;
    }
    if (!bankAccount.trim()) {
      toast.error("Please enter your bank account number.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    onSubmit(points, bankAccount, bankName);
    toast.success(`Cashout request for ${points.toLocaleString()} points submitted! Pending Admin approval.`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
          <Banknote className="size-4" /> Point Redemption Form
        </p>
        <h2 className="mt-1 text-2xl font-black uppercase text-white">
          Request Cashout
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Convert your loyalty reward points to real currency. Admin reviews and payouts take up to 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Available Points Display */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Available Ledger Points
          </span>
          <span className="font-mono text-xl font-black text-emerald-400">
            {availablePoints.toLocaleString()} pts
          </span>
        </div>

        {/* Amount to Withdraw in Points */}
        <div className="space-y-2">
          <label htmlFor="points-input" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            Amount to Redeem (points)
          </label>
          <div className="relative">
            <input
              id="points-input"
              type="number"
              min={500}
              max={availablePoints}
              value={pointsStr}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                setPoints(isNaN(val) ? 0 : val);
              }}
              required
              className="h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 font-mono font-black text-white placeholder:text-white/20 outline-none focus:border-primary"
              placeholder="Min 500 points"
            />
            <button
              type="button"
              onClick={() => setPoints(availablePoints)}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded bg-primary/20 hover:bg-primary/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary cursor-pointer"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Real Cash Equiv */}
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-500/80">
            VND Received (1 point = 100 VND)
          </span>
          <span className="font-mono text-xl font-black text-emerald-400">
            {vndEquivalent.toLocaleString()} VND
          </span>
        </div>

        {/* Bank Selection */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="bank-select" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Receiving Bank
            </label>
            <div className="relative">
              <Landmark className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40" />
              <select
                id="bank-select"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-black/35 pl-11 pr-4 text-sm text-white outline-none focus:border-primary appearance-none cursor-pointer"
              >
                {BANK_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#1C1C25] text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bank-account" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Bank Account Number
            </label>
            <input
              id="bank-account"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="e.g. 1029384756"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value.replace(/[^0-9]/g, ""))}
              required
              className="h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 font-mono text-sm text-white outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Disclaimers & Checks */}
        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Points will be locked in escrow immediately when submitting request and cannot be used.</span>
          </p>
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <ShieldCheck className="size-3.5 text-primary shrink-0 mt-0.5" />
            <span>Redemption requests are logged in the secure Ledger for auditing purposes.</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 flex-1 rounded-full border-white/10 text-white bg-transparent hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || points <= 0 || points > availablePoints}
            className="h-12 flex-1 rounded-full font-black uppercase tracking-wider text-white bg-primary hover:bg-[#B80500] shadow-[0_4px_16px_rgba(225,6,0,0.35)]"
          >
            {isLoading ? "Submitting..." : "Submit Withdrawal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
