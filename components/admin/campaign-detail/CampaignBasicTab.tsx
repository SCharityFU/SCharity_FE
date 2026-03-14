import { RichTextContent } from "@/components/ui/rich-text-content";
import type { AdminCampaignDetailDto } from "@/dtos/admin";
import { CampaignStatus } from "@/dtos";
import { formatDateTimeVN, formatVND, statusClassName, statusLabel } from "@/components/admin/campaign-detail/campaignDetailUtils";
import { ShieldAlert } from "lucide-react";

export function CampaignBasicTab({ detail }: { detail: AdminCampaignDetailDto }) {
  return (
    <div className="space-y-3">
      {/* Suspend banner */}
      {detail.status === CampaignStatus.SUSPENDED && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 md:p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-700">Chiến dịch đang bị tạm dừng</p>
            {detail.suspendReason && (
              <p className="text-sm text-orange-600 mt-1">Lý do: {detail.suspendReason}</p>
            )}
            {detail.suspendedAt && (
              <p className="text-xs text-orange-500 mt-1">Tạm dừng lúc: {formatDateTimeVN(detail.suspendedAt)}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex rounded-md px-1.5 py-0.5 font-semibold ${statusClassName(detail.status)}`}>
            {statusLabel(detail.status)}
          </span>
          <span className="text-black/50">Danh mục: {detail.category}</span>
          <span className="text-black/50">Tạo lúc: {formatDateTimeVN(detail.createdAt)}</span>
        </div>

        <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3">
          <RichTextContent content={detail.story} />
        </div>

        {detail.mediaUrls && detail.mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {detail.mediaUrls.map((url, index) => (
              <img key={`${url}-${index}`} src={url} alt={`media-${index + 1}`} className="w-full h-28 object-cover rounded-lg border border-black/10" />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-2 text-sm">
        <p className="text-black/60">Tiến độ: <span className="font-semibold text-black">{detail.progressPercent.toFixed(1)}%</span></p>
        <p className="text-black/60">Gây quỹ: <span className="font-semibold text-black">{formatVND(detail.raisedAmount)}</span></p>
        <p className="text-black/60">Mục tiêu: <span className="font-semibold text-black">{formatVND(detail.goalAmount)}</span></p>
        <p className="text-black/60">Nhà hảo tâm: <span className="font-semibold text-black">{detail.donorCount}</span></p>
        <p className="text-black/60">Lượt bị báo cáo: <span className="font-semibold text-black">{detail.reportCount}</span></p>
        <p className="text-black/60">Hạn chót: <span className="font-semibold text-black">{formatDateTimeVN(detail.deadline)}</span></p>
        {detail.suspendReason && detail.status !== CampaignStatus.SUSPENDED && (
          <p className="text-red-600">Lý do tạm dừng: {detail.suspendReason}</p>
        )}
      </div>
    </div>
    </div>
  );
}
