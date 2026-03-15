"use client";

import { useMemo, useState } from "react";
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
import { RichTextContent } from "@/components/ui/rich-text-content";
import type { AdminCampaignRequestItemDto, ReviewCampaignRequestDto } from "@/dtos/admin";
import { CampaignRequestStatus } from "@/dtos";
import {
  formatDateTimeVN,
  formatVND,
  requestStatusClassName,
  requestStatusLabel,
} from "@/components/admin/campaign-requests/campaignRequestsUtils";
import { mapCategoryToVietnamese } from "@/lib/utils";

interface CampaignRequestDetailViewProps {
  detail: AdminCampaignRequestItemDto;
  submitting: boolean;
  onReview: (payload: ReviewCampaignRequestDto) => Promise<void>;
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url);
}

export function CampaignRequestDetailView({
  detail,
  submitting,
  onReview,
}: CampaignRequestDetailViewProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [localError, setLocalError] = useState<string>("");

  const canReview = detail.status === CampaignRequestStatus.PENDING;

  const mediaLinks = useMemo(() => {
    const links = [detail.thumbnailUrl, ...(detail.mediaUrls || []), ...(detail.proofDocuments || [])]
      .filter(Boolean) as string[];
    return Array.from(new Set(links));
  }, [detail.thumbnailUrl, detail.mediaUrls, detail.proofDocuments]);

  const handleReject = async () => {
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      setLocalError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setLocalError("");
    await onReview({ action: "reject", rejectReason: trimmedReason });
  };

  const getCategoryLabel = (category: string) => {
    return mapCategoryToVietnamese(category);
  }

  return (
    <div className="space-y-3">
      <Link href="/admin/campaign-requests" className="inline-flex text-sm text-rose-600 hover:underline">
        Quay lại danh sách
      </Link>

      {localError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {localError}
        </div>
      )}

      <div className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-base md:text-lg font-semibold text-black">{detail.title}</h1>
          <span className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold ${requestStatusClassName(detail.status)}`}>
            {requestStatusLabel(detail.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p className="text-black/60">Danh mục: <span className="font-semibold text-black">{getCategoryLabel(detail.category)}</span></p>
          <p className="text-black/60">Deadline: <span className="font-semibold text-black">{formatDateTimeVN(detail.deadline)}</span></p>
          <p className="text-black/60">Mục tiêu: <span className="font-semibold text-black">{formatVND(detail.goalAmount)}</span></p>
          <p className="text-black/60">Thời gian gửi: <span className="font-semibold text-black">{formatDateTimeVN(detail.createdAt)}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <section className="lg:col-span-2 rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-3">
          <h2 className="text-sm font-semibold text-black">Nội dung mô tả</h2>
          <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3">
            <RichTextContent content={detail.story} />
          </div>

          <h3 className="text-sm font-semibold text-black">Tài liệu minh chứng</h3>
          {mediaLinks.length === 0 && <p className="text-sm text-black/45">Không có tài liệu.</p>}
          {mediaLinks.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {mediaLinks.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-black/10 overflow-hidden bg-white hover:border-rose-300 transition-colors"
                >
                  {isImageUrl(url) ? (
                    <img src={url} alt="Tài liệu" className="w-full h-28 object-cover" />
                  ) : (
                    <div className="h-28 px-2 py-2 text-xs text-black/60 break-all flex items-center">
                      {url}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-3">
          <h2 className="text-sm font-semibold text-black">Thông tin người tạo</h2>
          <div className="flex items-center gap-2">
            <img
              src={detail.requester.avatarUrl || "https://placehold.co/64x64?text=U"}
              alt={detail.requester.fullName}
              className="w-10 h-10 rounded-full object-cover border border-black/10"
            />
            <div>
              <p className="text-sm font-semibold text-black">{detail.requester.fullName}</p>
              <p className="text-xs text-black/55">{detail.requester.email}</p>
            </div>
          </div>
          <p className="text-sm text-black/60">Điện thoại: <span className="text-black">{detail.requester.phoneNumber || "-"}</span></p>
          <p className="text-sm text-black/60">KYC: <span className="text-black">{detail.requester.isKycVerified ? "Đã xác minh" : "Chưa xác minh"}</span></p>

          <h3 className="text-sm font-semibold text-black mt-2">Thông tin ngân hàng</h3>
          <p className="text-sm text-black/60">Ngân hàng: <span className="text-black">{detail.bankInfo.bankName}</span></p>
          <p className="text-sm text-black/60">Số tài khoản: <span className="text-black">{detail.bankInfo.accountNumber}</span></p>
          <p className="text-sm text-black/60">Chủ tài khoản: <span className="text-black">{detail.bankInfo.accountHolderName}</span></p>

          <h3 className="text-sm font-semibold text-black mt-2">Trạng thái xử lý</h3>
          <p className="text-sm text-black/60">Reviewer: <span className="text-black">{detail.reviewedBy?.fullName || "-"}</span></p>
          <p className="text-sm text-black/60">Reviewed at: <span className="text-black">{formatDateTimeVN(detail.reviewedAt)}</span></p>
          <p className="text-sm text-black/60">Lý do từ chối: <span className="text-black">{detail.rejectReason || "-"}</span></p>

          <div className="border-t border-black/10 pt-3 space-y-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" disabled={!canReview || submitting}>Duyệt yêu cầu</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận duyệt yêu cầu</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này sẽ tạo campaign mới và liên kết với request này.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={submitting}
                    onClick={(e) => {
                      e.preventDefault();
                      void onReview({ action: "approve" });
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
                placeholder="Nhập lý do từ chối"
                className="min-h-20 bg-white"
                disabled={!canReview || submitting}
              />
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                disabled={!canReview || submitting}
                onClick={() => {
                  void handleReject();
                }}
              >
                Từ chối yêu cầu
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
