import { CalendarDays } from "lucide-react";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";
import { formatDateOnly } from "@/lib/utils";

export function CampaignUpdates({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  if (!campaign.updates || campaign.updates.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
        Cập Nhật Sự Kiện{" "}
        <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
          {campaign.updates.length}
        </span>
      </h2>
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="space-y-8">
          {campaign.updates.map((update) => (
            <div
              key={update.id}
              className="pb-6 border-b border-black/10 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-black">{update.title}</p>
                  <p className="text-xs text-black/50">
                    {formatDateOnly(update.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-black/75 whitespace-pre-wrap pl-11">
                {update.content}
              </p>
              {update.mediaUrls && update.mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pl-11">
                  {update.mediaUrls.map((u) => (
                    <img
                      src={u}
                      key={u}
                      className="h-24 w-full object-cover rounded-lg border border-black/5"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
