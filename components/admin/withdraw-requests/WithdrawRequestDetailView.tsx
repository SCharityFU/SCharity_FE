"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AdminWithdrawRequestItemDto, ProcessWithdrawRequestDto } from "@/dtos/admin";
import { WithdrawStatus } from "@/dtos";
import {
  formatDateTimeVN,
  formatVND,
  withdrawStatusClassName,
  withdrawStatusLabel,
} from "@/components/admin/withdraw-requests/withdrawRequestsUtils";

interface WithdrawRequestDetailViewProps {
  detail: AdminWithdrawRequestItemDto;
  submitting: boolean;
  onProcess: (payload: ProcessWithdrawRequestDto) => Promise<void>;
}

export function WithdrawRequestDetailView({
  detail,
  submitting,
  onProcess,
}: WithdrawRequestDetailViewProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [localError, setLocalError] = useState("");

  const canProcess = detail.status === WithdrawStatus.PENDING;

  const handleReject = async () => {
    const trimmedReason = rejectReason.trim();
    if (trimmedReason.length < 10) {
      setLocalError("Lý do từ chối phải có ít nhất 10 ký tự.");
      return;
    }

    setLocalError("");
    await onProcess({ action: "reject", rejectReason: trimmedReason });
  };

  return (
    <div className="space-y-3">
      <Link href="/admin/withdraw-requests" className="inline-flex text-sm text-rose-600 hover:underline">
        Quay lại danh sách
      </Link>

      {localError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {localError}
        </div>
      )}

      <div className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-base md:text-lg font-semibold text-black">Chi tiết yêu cầu rút tiền</h1>
          <span className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold ${withdrawStatusClassName(detail.status)}`}>
            {withdrawStatusLabel(detail.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p className="text-black/60">Mã request: <span className="font-semibold text-black">{detail.id}</span></p>
          <p className="text-black/60">Mã chiến dịch: <span className="font-semibold text-black">{detail.campaignId}</span></p>
          <p className="text-black/60">Tên chiến dịch: <span className="font-semibold text-black">{detail.campaign?.title || "-"}</span></p>
          <p className="text-black/60">Số tiền rút: <span className="font-semibold text-black">{formatVND(detail.amount)}</span></p>
          <p className="text-black/60">Thời gian tạo: <span className="font-semibold text-black">{formatDateTimeVN(detail.createdAt)}</span></p>
          <p className="text-black/60">Cập nhật: <span className="font-semibold text-black">{formatDateTimeVN(detail.updatedAt)}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <section className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-2">
          <h2 className="text-sm font-semibold text-black">Thông tin người yêu cầu</h2>
          <p className="text-sm text-black/60">ID: <span className="text-black">{detail.requesterId}</span></p>
          <p className="text-sm text-black/60">Tên: <span className="text-black">{detail.requester?.fullName || "-"}</span></p>
          <p className="text-sm text-black/60">Email: <span className="text-black">{detail.requester?.email || "-"}</span></p>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-2">
          <h2 className="text-sm font-semibold text-black">Thông tin ngân hàng</h2>
          <p className="text-sm text-black/60">Ngân hàng: <span className="text-black">{detail.bankInfo.bankName}</span></p>
          <p className="text-sm text-black/60">Số tài khoản: <span className="text-black">{detail.bankInfo.accountNumber}</span></p>
          <p className="text-sm text-black/60">Chủ tài khoản: <span className="text-black">{detail.bankInfo.accountHolderName}</span></p>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-2">
          <h2 className="text-sm font-semibold text-black">Xử lý</h2>
          <p className="text-sm text-black/60">Người xử lý: <span className="text-black">{detail.processedBy?.fullName || detail.processedById || "-"}</span></p>
          <p className="text-sm text-black/60">Thời gian xử lý: <span className="text-black">{formatDateTimeVN(detail.processedAt)}</span></p>
          <p className="text-sm text-black/60">Lý do từ chối: <span className="text-black">{detail.rejectReason || "-"}</span></p>

          <div className="border-t border-black/10 pt-3 space-y-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" disabled={!canProcess || submitting}>Duyệt chuyển tiền</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận duyệt yêu cầu rút tiền</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sau khi xác nhận, yêu cầu sẽ được xử lý và trạng thái có thể chuyển sang hoàn tất.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={submitting}
                    onClick={(e) => {
                      e.preventDefault();
                      void onProcess({ action: "approve" });
                    }}
                  >
                    Xác nhận duyệt
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="space-y-2">
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)"
                className="min-h-20 bg-white"
                disabled={!canProcess || submitting}
              />
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                disabled={!canProcess || submitting}
                onClick={() => {
                  void handleReject();
                }}
              >
                Từ chối yêu cầu
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
