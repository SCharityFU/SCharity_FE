"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, ArrowRight, Loader2 } from "lucide-react";
import { VercelTabs } from "@/components/ui/vercel-tabs";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";
import { CampaignCard } from "@/components/CampaignCard";
import { useGetCampaignsQuery } from "@/lib/store/features/home/homeApi";
import { CampaignCategory } from "@/dtos/enums";
import type { CampaignDto } from "@/dtos/campaign";
import CampaignGrid from "@/components/campaign/CampaignGrid";

const categories = ["Tất Cả", "Giáo Dục", "Y Tế", "Môi Trường", "Cứu Trợ", "Xã Hội"];

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Tất Cả");
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // Default page size

  // Helper mapping from UI display name to the actual enum
  const resolveCategoryEnum = (cat: string): CampaignCategory | undefined => {
    switch (cat) {
      case "Tất Cả":
        return undefined;
      case "Giáo Dục":
        return CampaignCategory.EDUCATION;
      case "Y Tế":
        return CampaignCategory.MEDICAL;
      case "Môi Trường":
        return CampaignCategory.ENVIRONMENT;
      case "Cứu Trợ":
        return CampaignCategory.DISASTER;
      case "Xã Hội":
        return CampaignCategory.COMMUNITY;
      default:
        return CampaignCategory.OTHER;
    }
  };

  const {
    data: campaigns,
    isLoading,
    isFetching,
  } = useGetCampaignsQuery(
    {
      limit: limit * page, // simple 'load more' technique: keep limit large or load dynamically
      page: 1,
      search: search.length > 2 ? search : undefined, // only search if > 2 chars to save API calls
      category: resolveCategoryEnum(activeCategory),
      sortBy: "createdAt",
      sortOrder: "DESC",
    },
    {
      // Helps avoid aggressive refetching while typing fast
      refetchOnMountOrArgChange: true,
    },
  );

  const handleTabChange = (value: string) => {
    setActiveCategory(value);
    setPage(1); // Reset page on category change
  };

  const tabs = categories.map((cat) => ({
    label: cat,
    value: cat,
    content: (
      <div>
        <CampaignGrid campaigns={campaigns} isLoading={isLoading || isFetching} />
      </div>
    ),
  }));

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Các Chiến Dịch{" "}
            <HighlightText variant="underline" color="primary" className="gradient-text">
              Ý Nghĩa
            </HighlightText>
          </h1>
          <p className="text-black/50 max-w-xl mx-auto">
            Hàng trăm chiến dịch đang cần sự hỗ trợ của bạn. Hãy chọn lĩnh vực bạn quan tâm.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              placeholder="Tìm kiếm chiến dịch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm"
            />
          </div>
          <button className="px-4 py-3 rounded-xl glass border border-black/10 flex items-center gap-2 text-sm text-black/60 hover:text-black hover:bg-black/10 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Bộ Lọc
          </button>
        </div>

        {/* Vercel Tabs */}
        {/* We need to pass down a wrapper or onChange, since VercelTabs might be an internal controlled component */}
        {/* Based on common implementation, we intercept clicks or handle active states if VercelTabs supports standard properties. 
            If VercelTabs does not have an onChange, we rely on the internal mapping. 
            However, our data fetching relies on activeCategory. Let's make sure the VercelTabs acts correctly. */}
        <div
          onClick={(e) => {
            // A hack to capture the tab click if VercelTabs doesn't export an onChange natively
            const target = e.target as HTMLElement;
            const tabButton = target.closest("button");
            if (tabButton && tabButton.textContent) {
              const val = categories.find((c) => c === tabButton.textContent);
              if (val) handleTabChange(val);
            }
          }}
        >
          <VercelTabs tabs={tabs} defaultTab="Tất Cả" />
        </div>

        {/* Load More */}
        {campaigns && campaigns.length >= limit * page && (
          <div className="text-center mt-12">
            <Magnetic intensity={0.3} range={60}>
              <div onClick={() => setPage(page + 1)}>
                <RainbowButton
                  colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
                  duration={3}
                  borderWidth={2}
                >
                  {isFetching ? "Đang tải..." : "Tải Thêm Chiến Dịch"}
                  {!isFetching && <ArrowRight className="w-4 h-4" />}
                </RainbowButton>
              </div>
            </Magnetic>
          </div>
        )}
      </div>
    </div>
  );
}
