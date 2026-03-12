import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignDetailHeaderProps {
  title?: string;
  creatorName?: string;
  publicCampaignId?: string;
  activeTab: "basic" | "analytics" | "transactions";
  onTabChange: (tab: "basic" | "analytics" | "transactions") => void;
  onOpenPublicView: (campaignId: string) => void;
}

const tabs = [
  { key: "basic", label: "Thông tin" },
  { key: "analytics", label: "Phân tích" },
  { key: "transactions", label: "Giao dịch" },
] as const;

export function CampaignDetailHeader({
  title,
  creatorName,
  publicCampaignId,
  activeTab,
  onTabChange,
  onOpenPublicView,
}: CampaignDetailHeaderProps) {
  return (
    <>
      <Link href="/admin/campaigns" className="inline-flex items-center gap-1 text-xs text-black/50 hover:text-black/70">
        <ArrowLeft className="w-3.5 h-3.5" /> Danh sách chiến dịch
      </Link>

      <div className="rounded-xl border border-black/10 bg-white p-3 md:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base md:text-lg font-semibold text-black">{title || "Chi tiết chiến dịch"}</h1>
            <p className="text-xs md:text-sm text-black/50">
              {creatorName ? `Người tạo: ${creatorName}` : "Đang tải dữ liệu..."}
            </p>
          </div>
          {publicCampaignId && (
            <Button variant="outline" size="sm" onClick={() => onOpenPublicView(publicCampaignId)}>
              Xem trang công khai
            </Button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.key ? "bg-rose-500 text-white" : "bg-black/[0.04] text-black/65 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
