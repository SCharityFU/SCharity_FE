import { Heart, AlertTriangle } from "lucide-react";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";

export function CampaignStory({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const hasImage = !!campaign.thumbnailUrl;

  return (
    <>
      <div
        className={`h-[300px] md:h-[450px] rounded-3xl relative overflow-hidden bg-black/5 shadow-inner`}
      >
        {hasImage ? (
          <img
            src={campaign.thumbnailUrl!}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-500/20 to-violet-500/20 flex flex-col items-center justify-center">
            <Heart className="w-24 h-24 text-rose-500/30" />
          </div>
        )}
      </div>

      {campaign.status !== "active" && (
        <div className="p-4 rounded-xl glass border border-amber-500/20 bg-amber-500/5 text-amber-900 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">
              Tình trạng: {campaign.status.toUpperCase()}
            </h3>
            {campaign.suspendReason && (
              <p className="text-xs mt-1">{campaign.suspendReason}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
          Câu Chuyện Của Chúng Tôi
        </h2>
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
