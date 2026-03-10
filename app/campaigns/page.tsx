"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { VercelTabs } from "@/components/ui/vercel-tabs";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";
import { CampaignCard, type Campaign } from "@/components/campaigns/CampaignCard";

const allCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Xây Trường Học Vùng Cao Hà Giang",
    description: "Giúp 300 trẻ em có nơi học tập an toàn.",
    category: "Giáo Dục",
    raised: 180,
    goal: 300,
    donors: 1240,
    daysLeft: 15,
    imageGradient: "bg-gradient-to-br from-blue-600 to-indigo-800",
    emoji: "🏫",
    highlight: "underline",
  },
  {
    id: "2",
    title: "Phẫu Thuật Tim Cho Trẻ Em",
    description: "Hỗ trợ 50 ca phẫu thuật tim bẩm sinh.",
    category: "Y Tế",
    raised: 420,
    goal: 500,
    donors: 3890,
    daysLeft: 8,
    imageGradient: "bg-gradient-to-br from-rose-600 to-pink-800",
    emoji: "❤️‍🩹",
    highlight: "circle",
  },
  {
    id: "3",
    title: "Phủ Xanh 1000 Hecta Rừng",
    description: "Trồng cây phục hồi rừng đầu nguồn.",
    category: "Môi Trường",
    raised: 95,
    goal: 200,
    donors: 672,
    daysLeft: 30,
    imageGradient: "bg-gradient-to-br from-green-600 to-emerald-800",
    emoji: "🌳",
    highlight: "underline",
  },
  {
    id: "4",
    title: "Cứu Trợ Lũ Lụt Miền Trung",
    description: "Hỗ trợ khẩn cấp lương thực, nước sạch.",
    category: "Cứu Trợ",
    raised: 750,
    goal: 800,
    donors: 8920,
    daysLeft: 3,
    imageGradient: "bg-gradient-to-br from-amber-500 to-orange-700",
    emoji: "🆘",
    highlight: "marker",
  },
  {
    id: "5",
    title: "Học Bổng Sinh Viên Nghèo",
    description: "200 suất học bổng cho sinh viên vượt khó.",
    category: "Giáo Dục",
    raised: 130,
    goal: 250,
    donors: 945,
    daysLeft: 20,
    imageGradient: "bg-gradient-to-br from-violet-600 to-purple-800",
    emoji: "🎓",
    highlight: "underline",
  },
  {
    id: "6",
    title: "Nhà Tình Thương TP.HCM",
    description: "20 căn nhà cho người vô gia cư.",
    category: "Xã Hội",
    raised: 310,
    goal: 400,
    donors: 2150,
    daysLeft: 12,
    imageGradient: "bg-gradient-to-br from-teal-600 to-cyan-800",
    emoji: "🏠",
    highlight: "circle",
  },
  {
    id: "7",
    title: "Sữa Cho Bé Vùng Khó Khăn",
    description: "Cung cấp dinh dưỡng cho 500 trẻ dưới 5 tuổi.",
    category: "Y Tế",
    raised: 65,
    goal: 150,
    donors: 430,
    daysLeft: 25,
    imageGradient: "bg-gradient-to-br from-pink-500 to-rose-700",
    emoji: "🍼",
    highlight: "underline",
  },
  {
    id: "8",
    title: "Sạch Hoá Đại Dương Việt Nam",
    description: "Thu gom 10 tấn rác thải nhựa trên biển.",
    category: "Môi Trường",
    raised: 45,
    goal: 120,
    donors: 280,
    daysLeft: 40,
    imageGradient: "bg-gradient-to-br from-cyan-500 to-blue-700",
    emoji: "🌊",
    highlight: "circle",
  },
  {
    id: "9",
    title: "Máy Tính Cho Em Vùng Sâu",
    description: "Tặng 200 laptop cho học sinh nghèo.",
    category: "Giáo Dục",
    raised: 240,
    goal: 350,
    donors: 1680,
    daysLeft: 18,
    imageGradient: "bg-gradient-to-br from-indigo-500 to-violet-700",
    emoji: "💻",
    highlight: "marker",
  },
];

const categories = ["Tất Cả", "Giáo Dục", "Y Tế", "Môi Trường", "Cứu Trợ", "Xã Hội"];

function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}

export default function CampaignsPage() {
  const [search, setSearch] = useState("");

  const filteredBySearch = (list: Campaign[]) =>
    list.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()),
    );

  const tabs = categories.map((cat) => ({
    label: cat,
    value: cat,
    content: (
      <div>
        {filteredBySearch(
          cat === "Tất Cả" ? allCampaigns : allCampaigns.filter((c) => c.category === cat),
        ).length === 0 ? (
          <div className="text-center py-20 text-black/40">Không tìm thấy chiến dịch nào.</div>
        ) : (
          <CampaignGrid
            campaigns={filteredBySearch(
              cat === "Tất Cả" ? allCampaigns : allCampaigns.filter((c) => c.category === cat),
            )}
          />
        )}
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
        <VercelTabs tabs={tabs} defaultTab="Tất Cả" />

        {/* Load More */}
        <div className="text-center mt-12">
          <Magnetic intensity={0.3} range={60}>
            <RainbowButton
              colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
              duration={3}
              borderWidth={2}
            >
              Tải Thêm Chiến Dịch
              <ArrowRight className="w-4 h-4" />
            </RainbowButton>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}
