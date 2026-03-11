"use client";
import Link from "next/link";
import { Heart, Users, Clock } from "lucide-react";
import { NumberCounter } from "@/components/ui/number-counter";
import { HighlightText } from "@/components/ui/highlight-text";
import { useState } from "react";
import type { CampaignDto } from "@/dtos/campaign";
import { CampaignCategory } from "@/dtos/enums";

const mapCategoryToVietnamese = (category: string) => {
  switch (category) {
    case CampaignCategory.EDUCATION: return "Giáo Dục";
    case CampaignCategory.MEDICAL: return "Y Tế";
    case CampaignCategory.ENVIRONMENT: return "Môi Trường";
    case CampaignCategory.DISASTER: return "Cứu Trợ";
    case CampaignCategory.COMMUNITY: return "Xã Hội";
    default: return "Khác";
  }
};

export function CampaignCard({ campaign }: { campaign: CampaignDto }) {
  const goalAmount = campaign.goalAmount || 1;
  const progress = campaign.progressPercent ?? Math.min((campaign.raisedAmount / goalAmount) * 100, 100);
  const [liked, setLiked] = useState(false);

  // Default fallback if no thumbnailUrl
  const hasImage = !!campaign.thumbnailUrl;
  const defaultEmoji = "🌍";
  
  const displayCategory = campaign.category ? mapCategoryToVietnamese(campaign.category) : "Chiến Dịch";
  
  // Calculate days left
  const daysLeft = campaign.deadline 
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
    
  // Format to millions
  const raisedMillions = (campaign.raisedAmount || 0) / 1_000_000;
  const goalMillions = (campaign.goalAmount || 0) / 1_000_000;

  return (
    <Link href={`/campaigns/${campaign.id}`} className="block group">
      <div className="glass-card rounded-2xl overflow-hidden hover:border-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
        {/* Image area */}
        <div className={`h-48 relative flex items-center justify-center overflow-hidden ${!hasImage ? "bg-gradient-to-br from-rose-500/20 to-violet-500/20" : "bg-black/5"}`}>
          {hasImage ? (
            <img src={campaign.thumbnailUrl!} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <span className="text-6xl z-10">{defaultEmoji}</span>
          )}
          <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0" />
          
          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium glass text-black backdrop-blur-md">
            {displayCategory}
          </span>
          
          {/* Like button */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-black/20 transition-colors backdrop-blur-md"
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
            }}
            aria-label="Like campaign"
          >
            <Heart className={`w-4 h-4 transition-colors ${liked ? "text-rose-500 fill-rose-500" : "text-black"}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-base text-black mb-2 line-clamp-2 group-hover:text-rose-500 transition-colors">
            <HighlightText variant="underline" color="primary" animate className="text-black group-hover:text-rose-500">
              {campaign.title}
            </HighlightText>
          </h3>
          <p className="text-sm text-black/50 line-clamp-2 mb-4">{campaign.story}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-black/60">Đã quyên góp</span>
              <span className="text-xs font-semibold text-rose-500">{progress.toFixed(0)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-black/50">
            <div className="flex items-center gap-1">
              <span className="font-bold text-black text-sm">
                <NumberCounter value={raisedMillions} prefix="₫" suffix="tr" duration={1.5} />
              </span>
              <span>/ {goalMillions}tr</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{campaign.donorCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{daysLeft}d</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
