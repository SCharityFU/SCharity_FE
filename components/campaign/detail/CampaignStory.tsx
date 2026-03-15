"use client";

import { useMemo, useState } from "react";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";
import { RichTextContent } from "@/components/ui/rich-text-content";

export function CampaignStory({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const plainTextLength = useMemo(() => {
    if (!campaign.story) return 0;
    if (typeof window === "undefined") {
      return campaign.story
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim().length;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(campaign.story, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim().length;
  }, [campaign.story]);

  const showReadMore = plainTextLength > 500;

  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
          Câu Chuyện Của Chúng Tôi
        </h2>
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div
            className={`rounded-xl border border-black/5 bg-white/30 transition-all duration-300 ${
              isExpanded ? "max-h-[70vh] overflow-y-auto p-4" : "max-h-72 overflow-hidden p-4"
            }`}
          >
            <RichTextContent content={campaign.story} />
          </div>

          {showReadMore && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline transition-colors"
              >
                {isExpanded ? "Thu gọn" : "Đọc thêm"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
