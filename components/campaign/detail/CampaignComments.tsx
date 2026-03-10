import { Heart } from "lucide-react";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";
import { formatDateOnly, formatVND } from "@/lib/utils";

export function CampaignComments({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  if (!campaign.comments || campaign.comments.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-black mb-4">Lời Chúc & Động Viên</h2>
      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        {campaign.comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex flex-shrink-0 items-center justify-center text-rose-500 font-semibold border border-rose-500/20">
              {comment.emoji || <Heart className="w-4 h-4 fill-current" />}
            </div>
            <div className="bg-black/5 rounded-2xl rounded-tl-none p-4 flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">
                  {comment.isAnonymous
                    ? "Nhà hảo tâm ẩn danh"
                    : comment.donor?.fullName || "Khách"}
                </p>
                <span className="text-xs text-black/40">
                  {formatDateOnly(comment.createdAt)}
                </span>
              </div>
              {comment.donation && (
                <p className="text-xs font-semibold text-rose-500 mb-2">
                  Đã ủng hộ {formatVND(comment.donation.amount)}
                </p>
              )}
              <p className="text-sm text-black/70">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
