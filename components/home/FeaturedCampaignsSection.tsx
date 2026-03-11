"use client";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";
import { CampaignCard } from "@/components/CampaignCard";
import { useGetCampaignsQuery } from "@/lib/store/features/home/homeApi";

export function FeaturedCampaignsSection() {
  const { data: campaigns, isLoading } = useGetCampaignsQuery({ limit: 6, sortBy: 'raisedAmount', sortOrder: 'DESC' });
  
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              Chiến Dịch{" "}
              <HighlightText variant="underline" color="accent" className="text-black">
                Nổi Bật
              </HighlightText>
            </h2>
            <p className="text-black/50">Những chiến dịch đang cần sự hỗ trợ của bạn</p>
          </div>
          <Link
            href="/campaigns"
            className="hidden md:flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-black/50">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : (!campaigns || campaigns.length === 0) ? (
          <div className="text-center py-20 text-black/40">
            Hiện chưa có chiến dịch nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Magnetic intensity={0.3} range={60}>
            <Link href="/campaigns">
              <RainbowButton
                colors={["#f43f5e", "#8b5cf6", "#22c55e", "#f43f5e"]}
                duration={3}
                borderWidth={2}
              >
                Xem Tất Cả Chiến Dịch
                <ArrowRight className="w-4 h-4" />
              </RainbowButton>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
