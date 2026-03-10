import { Loader2 } from "lucide-react";
import { CampaignCard } from "../CampaignCard";
import type { CampaignDto } from "@/dtos/campaign";

export default function CampaignGrid({
  campaigns,
  isLoading,
}: {
  campaigns?: CampaignDto[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-black/50">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return <div className="text-center py-20 text-black/40">Không tìm thấy chiến dịch nào.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}
