import { Heart, AlertTriangle } from "lucide-react";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";

export function CampaignStory({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const hasImage = !!campaign.thumbnailUrl;

  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">Câu Chuyện Của Chúng Tôi</h2>
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="prose prose-sm md:prose-base text-black/75 max-w-none whitespace-pre-wrap leading-relaxed">
            {campaign.story}
          </div>

          {campaign.mediaUrls && campaign.mediaUrls.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {campaign.mediaUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`media-${i}`}
                  className="w-full h-48 object-cover rounded-xl shadow-sm border border-black/5"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
