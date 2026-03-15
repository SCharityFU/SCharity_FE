"use client";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useGetCampaignDetailQuery } from "@/lib/store/features/home/homeApi";
import { CampaignImageSlider } from "@/components/campaign/detail/CampaignImageSlider";
import { CampaignHeader } from "@/components/campaign/detail/CampaignHeader";
import { CampaignStory } from "@/components/campaign/detail/CampaignStory";
import { CampaignMediaSection } from "@/components/campaign/detail/CampaignMediaSection";
import { CampaignUpdates } from "@/components/campaign/detail/CampaignUpdates";
import { CampaignComments } from "@/components/campaign/detail/CampaignComments";
import { CampaignSidebar } from "@/components/campaign/detail/CampaignSidebar";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-black/[0.06] animate-pulse ${className}`} />;
}

function CampaignDetailSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Bone className="h-3 w-36 mb-7" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Slider placeholder */}
            <Bone className="aspect-video rounded-2xl" />

            {/* Title area */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Bone className="h-5 w-24 rounded-full" />
                <Bone className="h-5 w-20 rounded-full" />
              </div>
              <Bone className="h-8 w-full" />
              <Bone className="h-8 w-3/4" />
              <div className="flex items-center gap-2.5 pt-1">
                <Bone className="h-7 w-7 rounded-full" />
                <Bone className="h-4 w-44" />
              </div>
            </div>

            {/* Story */}
            <Bone className="h-52 rounded-2xl" />

            {/* Updates */}
            <Bone className="h-48 rounded-2xl" />

            {/* Comments */}
            <Bone className="h-40 rounded-2xl" />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <Bone className="h-72 rounded-2xl" />
            <Bone className="h-56 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: campaign, isLoading, isError } = useGetCampaignDetailQuery(id);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) return <CampaignDetailSkeleton />;

  // ── Error ────────────────────────────────────────────────────────────────────
  if (isError || !campaign) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-6 px-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl scale-150 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-rose-500/8 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-black text-black">Không tìm thấy chiến dịch</h2>
          <p className="text-sm text-black/45 mt-1 max-w-xs mx-auto">
            Chiến dịch không tồn tại hoặc đường dẫn không hợp lệ.
          </p>
        </div>

        <Link
          href="/campaigns"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-black/10 text-sm font-medium text-black hover:bg-black/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // Build unified image list: thumbnailUrl first, then mediaUrls
  const images = [campaign.thumbnailUrl, ...(campaign.mediaUrls ?? [])].filter(
    (u): u is string => !!u,
  );

  // ── Render ───────────────────────────────────────────────────────────────────
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
