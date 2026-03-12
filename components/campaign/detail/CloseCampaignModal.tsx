"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Loader2, Lock } from "lucide-react";
import { useCloseCampaignMutation } from "@/lib/store/features/campaign/campaignApi";
import { homeApi } from "@/lib/store/features/home/homeApi";
import { useAppDispatch } from "@/lib/store/hooks";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";
import { formatVND } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CloseCampaignModalProps {
  open: boolean;
  onClose: () => void;
  campaign: PublicCampaignDetailResponseDto;
}

export function CloseCampaignModal({ open, onClose, campaign }: CloseCampaignModalProps) {
  const dispatch = useAppDispatch();
  const [closeCampaign, { isLoading }] = useCloseCampaignMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Dismiss on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, isLoading]);

  const raised = campaign.raisedAmount ?? 0;
  const goal = campaign.goalAmount || 1;
  const progress = campaign.progressPercent ?? Math.min((raised / goal) * 100, 100);

  const handleClose = async () => {
    setError(null);
    try {
      await closeCampaign(campaign.id).unwrap();
      setSuccess(true);
      // Refetch the campaign detail so the page re-renders instantly
      dispatch(
        homeApi.endpoints.getCampaignDetail.initiate(campaign.id, {
          forceRefetch: true,
        }),
      );
      // Auto-close modal after brief success message
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setError(err?.data?.message || "Không thể đóng chiến dịch. Vui lòng thử lại.");
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full sm:max-w-md",
          "bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-black/10",
          "flex flex-col overflow-hidden",
          "animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 fade-in duration-300",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-black">Xác nhận kết thúc chiến dịch?</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-gray-100 border border-black/8 flex items-center justify-center text-black/40 hover:text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-black">Chiến dịch đã đóng thành công!</p>
              <p className="text-xs text-black/40 mt-1">Bạn có thể gửi yêu cầu rút tiền ngay bây giờ.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                <p className="text-sm text-black/70">
                  Bạn có chắc chắn muốn đóng chiến dịch{" "}
                  <span className="font-bold text-black">&ldquo;{campaign.title}&rdquo;</span> không?
                </p>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <Lock className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Hành động này <span className="font-bold">không thể hoàn tác</span>. Người dùng
                    sẽ không thể quyên góp thêm cho chiến dịch này.
                  </p>
                </div>
              </div>

              {/* Summary card */}
              <div className="bg-gray-50 rounded-xl p-4 border border-black/5">
                <p className="text-[11px] text-black/40 font-medium uppercase tracking-wider mb-2">
                  Thống kê hiện tại
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-black tabular-nums">
                    {formatVND(raised)}
                  </span>
                  <span className="text-xs text-black/40">/ {formatVND(goal)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-violet-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-rose-500 tabular-nums">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <p className="text-[11px] text-red-700">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex gap-3 px-5 py-4 border-t border-black/5">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/50 hover:text-black/70 hover:bg-black/[0.02] transition-all disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đồng ý đóng"
              )}
            </button>
          </div>
        )}

        {/* Drag handle (mobile) */}
        <div className="sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black/15" />
      </div>
    </div>,
    document.body,
  );
}

