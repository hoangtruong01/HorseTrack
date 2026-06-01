"use client";

import { AlertCircle, CheckCircle, CreditCard, Landmark } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CashoutRequest } from "../mock-wallet";

export type CashoutApprovalQueueProps = {
  requests: CashoutRequest[];
  onAction: (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => void;
};

export function CashoutApprovalQueue({ requests, onAction }: CashoutApprovalQueueProps) {
  const [selectedRequest, setSelectedRequest] = useState<CashoutRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => {
    setIsProcessing(`${id}-${action}`);
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    onAction(id, action, reason);
    setIsProcessing(null);
    setShowRejectDialog(false);
    setRejectReason("");
    setSelectedRequest(null);
  };

  const activeRequests = requests.filter((r) => r.status === "PENDING" || r.status === "APPROVED");
  const completedRequests = requests.filter((r) => r.status === "PAID" || r.status === "REJECTED");

  return (
    <section className="space-y-6">
      {/* Pending Queue Card */}
      <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
            Admin queue
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">
            Cashout Requests
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Approve point exchanges, trigger bank wire paid confirmations, or reject fraudulent/incorrect entries.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          {activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle className="size-12 text-emerald-500 animate-bounce" />
              <p className="mt-4 text-sm font-black uppercase tracking-wider text-white">
                Queue Empty!
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                All point redemption requests are currently fully processed.
              </p>
            </div>
          ) : (
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">User Details</th>
                  <th className="px-4 py-3.5">Bank Information</th>
                  <th className="px-4 py-3.5 text-right">Points</th>
                  <th className="px-4 py-3.5 text-right">Amount (VND)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-black/10">
                {activeRequests.map((req) => (
                  <tr key={req.id} className="transition hover:bg-white/[0.02]">
                    {/* User */}
                    <td className="px-4 py-4.5">
                      <p className="font-black uppercase tracking-wider text-white">
                        {req.userFullName}
                      </p>
                      <p className="text-[10px] text-primary font-black uppercase mt-0.5 tracking-widest">
                        {req.userRole}
                      </p>
                    </td>

                    {/* Bank */}
                    <td className="px-4 py-4.5 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <Landmark className="size-3.5 text-white/40" />
                        {req.bankName}
                      </div>
                      <div className="text-muted-foreground mt-1">
                        Acc: {req.bankAccount}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-4 py-4.5 text-right font-mono font-black text-white">
                      {req.points.toLocaleString()}
                    </td>

                    {/* VND */}
                    <td className="px-4 py-4.5 text-right font-mono font-black text-emerald-400">
                      {req.amountVnd.toLocaleString()} VND
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4.5">
                      <StatusBadge
                        label={req.status}
                        tone={req.status === "APPROVED" ? "green" : "slate"}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "PENDING" && (
                          <>
                            <Button
                              onClick={() => handleAction(req.id, "APPROVED")}
                              disabled={isProcessing !== null}
                              size="sm"
                              className="h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 font-bold text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowRejectDialog(true);
                              }}
                              disabled={isProcessing !== null}
                              variant="destructive"
                              size="sm"
                              className="h-9 rounded-full font-bold text-xs"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {req.status === "APPROVED" && (
                          <>
                            <Button
                              onClick={() => handleAction(req.id, "PAID")}
                              disabled={isProcessing !== null}
                              size="sm"
                              className="h-9 rounded-full bg-primary hover:bg-[#B80500] font-black uppercase text-xs shadow-[0_4px_12px_rgba(225,6,0,0.25)]"
                            >
                              <CreditCard className="mr-1.5 size-3.5" /> Pay Wire
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowRejectDialog(true);
                              }}
                              disabled={isProcessing !== null}
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-full font-bold text-xs border-white/10 text-white hover:bg-white/5"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Processed History Card */}
      <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div>
          <h3 className="text-lg font-black uppercase text-white">
            Processed Cashouts History
          </h3>
          <p className="text-xs text-muted-foreground">
            Audit logs for completed payouts or rejected transactions.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          {completedRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No historical request entries found.
            </div>
          ) : (
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3 text-right">Points</th>
                  <th className="px-4 py-3 text-right">VND Value</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-black/5">
                {completedRequests.map((req) => (
                  <tr key={req.id} className="opacity-70 transition hover:opacity-100 hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white">{req.userFullName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{req.userRole}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-white/70">
                      {req.bankName} Acc: {req.bankAccount}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-white/90">
                      {req.points.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-white/70">
                      {req.amountVnd.toLocaleString()} VND
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/60 font-mono">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <StatusBadge
                          label={req.status}
                          tone={req.status === "PAID" ? "teal" : "red"}
                        />
                        {req.rejectReason && (
                          <p className="text-[10px] text-primary max-w-xs leading-4">
                            Reason: {req.rejectReason}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reject Reason Dialog */}
      {showRejectDialog && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1C1C25] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
            <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" /> Reject Request
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to reject cashout for <strong className="text-white">{selectedRequest.userFullName}</strong> ({selectedRequest.points} points)?
            </p>
            <div className="mt-4 space-y-2">
              <label htmlFor="reason" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Rejection Reason (Required)
              </label>
              <textarea
                id="reason"
                required
                rows={3}
                placeholder="e.g. Bank details do not match profile..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-primary"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
                className="h-11 rounded-full border-white/10 text-white"
              >
                Cancel
              </Button>
              <Button
                disabled={!rejectReason.trim()}
                onClick={() => handleAction(selectedRequest.id, "REJECTED", rejectReason)}
                variant="destructive"
                className="h-11 rounded-full font-black uppercase tracking-wide px-5"
              >
                Reject Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
