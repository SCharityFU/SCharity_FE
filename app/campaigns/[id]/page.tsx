"use client";
import { useParams } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useGetCampaignDetailQuery } from "@/lib/store/features/home/homeApi";
import { CampaignHeader } from "@/components/campaign/detail/CampaignHeader";
import { CampaignStory } from "@/components/campaign/detail/CampaignStory";
import { CampaignUpdates } from "@/components/campaign/detail/CampaignUpdates";
import { CampaignComments } from "@/components/campaign/detail/CampaignComments";
import { CampaignSidebar } from "@/components/campaign/detail/CampaignSidebar";

export default function CampaignDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: campaign, isLoading, isError } = useGetCampaignDetailQuery(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-rose-500" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 text-black/50">
        <AlertTriangle className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-bold">Không tìm thấy chiến dịch</h2>
        <Link href="/campaigns" className="underline hover:text-rose-500">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <CampaignHeader campaign={campaign} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-10">
            <CampaignStory campaign={campaign} />
            <CampaignUpdates campaign={campaign} />
            <CampaignComments campaign={campaign} />
          </div>

          {/* Right Sidebar */}
          <CampaignSidebar campaign={campaign} />
        </div>
      </div>
    </div>
  );
}
