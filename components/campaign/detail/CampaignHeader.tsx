import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HighlightText } from "@/components/ui/highlight-text";
import { mapCategoryToVietnamese } from "@/lib/utils";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";

export function CampaignHeader({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const hasImage = !!campaign.thumbnailUrl;

  return (
    <div className="mb-6">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại danh sách
      </Link>

      <h1 className="text-3xl md:text-5xl font-black text-black mb-4 leading-tight">
        <HighlightText variant="underline" color="primary">
          {campaign.title}
        </HighlightText>
      </h1>
      <div className="flex items-center gap-4 text-black/60 text-sm flex-wrap">
        {hasImage && campaign.creator?.avatarUrl && (
          <img
            src={campaign.creator.avatarUrl}
            alt={campaign.creator.fullName}
            className="w-8 h-8 rounded-full border border-black/10"
          />
        )}
        {!campaign.creator?.avatarUrl && (
          <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold border border-rose-500/20 text-xs">
            {campaign.creator?.fullName?.charAt(0) || "U"}
          </div>
        )}
        <p>
          Chiến dịch được tổ chức bởi{" "}
          <span className="text-black font-semibold">
            {campaign.creator?.fullName || "Người dùng ẩn danh"}
          </span>
        </p>
        <span className="w-1 h-1 bg-black/30 rounded-full" />
        <span className="px-2.5 py-1 rounded-full glass border border-black/5 text-black/70 font-medium">
          {mapCategoryToVietnamese(campaign.category)}
        </span>
      </div>
    </div>
  );
}
