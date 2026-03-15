"use client";
import { useState } from "react";
import {
  CalendarDays,
  TrendingUp,
  DollarSign,
  Heart,
  Sparkles,
  RotateCcw,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import type { PublicCampaignDetailResponseDto, CampaignUpdateResponseDto } from "@/dtos/campaign";
import { UpdateCategory } from "@/dtos/enums";
import { formatDateOnly } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { RichTextContent } from "@/components/ui/rich-text-content";

// ── Category config ───────────────────────────────────────────────────────────

interface CatConfig {
  label: string;
  Icon: React.ElementType;
  pill: string;
  dot: string;
  dotIcon: string;
}

const CAT: Record<string, CatConfig> = {
  [UpdateCategory.PROGRESS]: {
    label: "Tiến Độ",
    Icon: TrendingUp,
    pill: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    dot: "border-blue-300 bg-blue-50",
    dotIcon: "text-blue-500",
  },
  [UpdateCategory.FINANCIAL]: {
    label: "Tài Chính",
    Icon: DollarSign,
    pill: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    dot: "border-emerald-300 bg-emerald-50",
    dotIcon: "text-emerald-500",
  },
  [UpdateCategory.THANK_YOU]: {
    label: "Cảm Ơn",
    Icon: Heart,
    pill: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    dot: "border-rose-300 bg-rose-50",
    dotIcon: "text-rose-500",
  },
  [UpdateCategory.COMPLETION]: {
    label: "Hoàn Thành",
    Icon: Sparkles,
    pill: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    dot: "border-violet-300 bg-violet-50",
    dotIcon: "text-violet-500",
  },
  [UpdateCategory.AFTER_CAMPAIGN]: {
    label: "Sau Chiến Dịch",
    Icon: RotateCcw,
    pill: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    dot: "border-amber-300 bg-amber-50",
    dotIcon: "text-amber-500",
  },
  [UpdateCategory.OTHER]: {
    label: "Khác",
    Icon: MoreHorizontal,
    pill: "bg-black/5 text-black/55 border-black/10",
    dot: "border-black/15 bg-white",
    dotIcon: "text-black/35",
  },
};

function getCat(category: string): CatConfig {
  return CAT[category] ?? CAT[UpdateCategory.OTHER];
}

// ── Single update row (timeline item) ────────────────────────────────────────

function UpdateRow({ update, isLast }: { update: CampaignUpdateResponseDto; isLast: boolean }) {
  const cat = getCat(update.category);
  const CatIcon = cat.Icon;
  const hasMedia = !!update.mediaUrls && update.mediaUrls.length > 0;

  return (
    <div className="flex gap-4">
      {/* ── Timeline column ──────────────────────────────────────────────── */}
      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
        <div
          className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10", cat.dot)}
        >
          <CatIcon className={cn("w-3.5 h-3.5", cat.dotIcon)} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1.5 mb-0 min-h-[20px] bg-gradient-to-b from-black/10 to-transparent" />
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className={cn("flex-1 min-w-0", !isLast && "pb-7")}>
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
              cat.pill,
            )}
          >
            <CatIcon className="w-2.5 h-2.5" />
            {cat.label}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-black/35">
            <CalendarDays className="w-3 h-3" />
            {formatDateOnly(update.createdAt)}
          </div>
          {update.isEdited && <span className="text-[11px] text-black/25 italic">· đã sửa</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-black leading-snug mb-1.5">{update.title}</h3>

        {/* Body */}
        <p className="text-sm text-black/60 leading-relaxed whitespace-pre-wrap">
         <RichTextContent content={update.content} /></p>

        {/* Media thumbnails */}
        {hasMedia && (
          <div className={cn("flex gap-2 mt-3 flex-wrap")}>
            {update.mediaUrls!.slice(0, 4).map((url, i) => (
              <div key={i} className="relative overflow-hidden rounded-lg group w-20 h-20 flex-shrink-0">
                <img
                  src={url}
                  alt={`update-media-${i}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* "+N more" overlay on the 4th if there are more */}
                {i === 3 && update.mediaUrls!.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+{update.mediaUrls!.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 5;

export function CampaignUpdates({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!campaign.updates || campaign.updates.length === 0) return null;

  const updates = [...campaign.updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const preview = updates.slice(0, PREVIEW_COUNT);
  const hasMore = updates.length > PREVIEW_COUNT;

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* ── Section header ──────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <h2 className="text-sm font-bold text-black">Cập Nhật Chiến Dịch</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/25">
            {updates.length}
          </span>
        </div>

        {/* ── Timeline list ───────────────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-4">
          {preview.map((update, i) => (
            <UpdateRow key={update.id} update={update} isLast={i === preview.length - 1} />
          ))}
        </div>

        {/* ── View all button ─────────────────────────────────────────────── */}
        {hasMore && (
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-3.5 border-t border-black/5 text-xs font-semibold text-black/50 hover:text-black/75 hover:bg-black/[0.02] transition-colors"
          >
            Xem tất cả {updates.length} cập nhật
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tất Cả Cập Nhật"
        subtitle={`${updates.length} cập nhật · mới nhất trước`}
      >
        <div className="pt-1">
          {updates.map((update, i) => (
            <UpdateRow key={update.id} update={update} isLast={i === updates.length - 1} />
          ))}
        </div>
      </Modal>
    </>
  );
}
