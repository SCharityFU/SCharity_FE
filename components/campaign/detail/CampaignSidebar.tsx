import { Heart, Users, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCounter } from "@/components/ui/number-counter";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";
import { formatVND, formatDateOnly } from "@/lib/utils";

export function CampaignSidebar({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const goalAmount = campaign.goalAmount || 1;
  const progress =
    campaign.progressPercent ?? Math.min((campaign.raisedAmount / goalAmount) * 100, 100);
  const daysLeft = campaign.deadline
    ? Math.max(
        0,
        Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 sticky top-24 shadow-xl shadow-black/5 border border-black/5">
        <div className="mb-6">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-black text-black">
              {formatVND(campaign.raisedAmount)}
            </span>
          </div>
          <div className="text-sm text-black/50">
            ủng hộ trong tổng mục tiêu{" "}
            <span className="font-medium text-black">{formatVND(campaign.goalAmount)}</span>
          </div>
          <div className="mt-3 progress-bar h-2 bg-black/5 rounded-full overflow-hidden">
            <div
              className="progress-fill h-full bg-rose-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass border border-black/5 rounded-xl p-3 text-center">
            <Users className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <StatCounter
              value={campaign.donorCount}
              label="Lượt ủng hộ"
              className="text-sm font-semibold p-0"
            />
          </div>
          <div className="glass border border-black/5 rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <StatCounter
              value={daysLeft}
              label="Ngày còn lại"
              className="text-sm font-semibold p-0"
            />
          </div>
        </div>

        <Button
          variant={"default"}
          className="w-full text-base py-6 shadow-lg shadow-rose-500/20"
        >
          <Heart className="w-4 h-4 fill-current mr-2" />
          Quyên Góp Ngay
        </Button>

        <Button
          variant={"outline"}
          className="w-full mt-3 py-3 rounded-xl glass border border-black/10 text-sm font-medium text-black/70 hover:text-black hover:bg-black/5 transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Chia sẻ ngay
        </Button>

        {/* Recent Donations List */}
        <div className="mt-3">
          {campaign.donations && campaign.donations.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-black/5">
              <h3 className="font-bold text-black mb-4">Mới Ủng Hộ</h3>
              <div className="space-y-4">
                {campaign.donations.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex flex-shrink-0 items-center justify-center text-emerald-600">
                      <Heart className="w-4 h-4 fill-emerald-600/20" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold truncate text-black">
                        {d.donorDisplayName}
                      </p>
                      <div className="flex items-center text-xs text-black/50 gap-2">
                        <span className="font-semibold text-rose-500">
                          {formatVND(d.amount)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-black/20" />
                        <span className="truncate">{formatDateOnly(d.createdAt)}</span>
                      </div>
                      {d.message && (
                        <p className="text-xs text-black/60 truncate mt-0.5 italic">
                          "{d.message}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {campaign.donations.length > 5 && (
                <Button className="w-full mt-4 py-2 rounded-lg border border-black/10 text-xs font-medium text-black/60 hover:text-black transition-colors">
                  Xem tất cả lượt ủng hộ
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
