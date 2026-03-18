"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CampaignImageSlider } from "@/components/campaign/detail/CampaignImageSlider";
import { CampaignHeader } from "@/components/campaign/detail/CampaignHeader";
import { CampaignStory } from "@/components/campaign/detail/CampaignStory";
import { CampaignMediaSection } from "@/components/campaign/detail/CampaignMediaSection";
import { CampaignUpdates } from "@/components/campaign/detail/CampaignUpdates";
import { CampaignComments } from "@/components/campaign/detail/CampaignComments";
import { CampaignSidebar } from "@/components/campaign/detail/CampaignSidebar";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";

interface CampaignDetailClientProps {
  campaign: PublicCampaignDetailResponseDto;
}

export function CampaignDetailClient({ campaign }: CampaignDetailClientProps) {
  // Build unified image list: thumbnailUrl first, then mediaUrls
  const images = [campaign.thumbnailUrl, ...(campaign.mediaUrls ?? [])].filter(
    (u): u is string => !!u,
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-black/40 hover:text-black/70 transition-colors mb-7 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Danh sách chiến dịch
        </Link>

        {/* ── Main grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* ── Left column ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Image slider */}
            <CampaignImageSlider images={images} />

            {/* 2. Title + meta (compact) */}
            <CampaignHeader campaign={campaign} />

            {/* 3. Story */}
            <CampaignStory campaign={campaign} />

            {/* 4. Related media */}
            <CampaignMediaSection mediaUrls={images} />

            {/* 5. Updates */}
            <CampaignUpdates campaign={campaign} />

            {/* 6. Comments */}
            <CampaignComments campaign={campaign} />
          </div>

          {/* ── Right column (sticky) ─────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CampaignSidebar campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
  );
}
