"use client";

import {
  Heart,
  Users,
  Clock,
  Share2,
  Check,
  Trophy,
  Flame,
  ChevronRight,
  CalendarDays,
  Banknote,
  AlertOctagon,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";
import type { DonationResponseDto } from "@/dtos/donation";
import { formatVND, formatDateOnly } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useCreateDonationMutation } from "@/lib/store/features/donation/donationApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const DONOR_PREVIEW = 5;

const DONOR_GRADIENTS = [
  "from-rose-500 to-pink-500",
  "from-violet-500 to-purple-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-400",
  "from-cyan-500 to-sky-500",
  "from-fuchsia-500 to-pink-400",
];

function donorGradient(seed: string) {
  const sum = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return DONOR_GRADIENTS[sum % DONOR_GRADIENTS.length];
}

// ── Animated progress bar ─────────────────────────────────────────────────────

function ProgressBar({ progress, reached }: { progress: number; reached: boolean }) {
  const [width, setWidth] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const id = requestAnimationFrame(() => setWidth(Math.min(progress, 100)));
    return () => cancelAnimationFrame(id);
  }, [progress]);

  return (
    <div className="relative h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          reached ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-rose-500 to-violet-500",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

function StatChip({
  icon: Icon,
  label,
  value,
  urgent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  urgent?: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-3 glass border border-black/5 rounded-xl">
      <Icon className={cn("w-4 h-4", urgent ? "text-rose-500" : "text-black/35")} />
      <span className={cn("text-base font-black tabular-nums leading-none", urgent ? "text-rose-500" : "text-black")}>
        {value}
      </span>
      <span className="text-[11px] text-black/35 font-medium">{label}</span>
    </div>
  );
}

// ── Donor row ─────────────────────────────────────────────────────────────────

function DonorRow({ donation, rank }: { donation: DonationResponseDto; rank: number }) {
  const name = donation.donorDisplayName ?? "Nhà hảo tâm ẩn danh";
  const gradient = donorGradient(name);
  const initial = name.charAt(0).toUpperCase();
  const avatarUrl = !donation.isAnonymous ? (donation.donor?.avatarUrl ?? undefined) : undefined;

  const rankStyles: Record<number, string> = {
    0: "bg-amber-400/20 text-amber-600 border border-amber-400/40",
    1: "bg-black/6 text-black/45 border border-black/10",
    2: "bg-amber-700/10 text-amber-700 border border-amber-600/25",
  };

  return (
    <div className="flex items-center gap-3">
      {/* Rank / index */}
      {rank < 3 ? (
        <div
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0",
            rankStyles[rank],
          )}
        >
          {rank + 1}
        </div>
      ) : (
        <div className="w-5 flex-shrink-0" />
      )}

      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-8 h-8 rounded-full object-cover border border-black/8 shadow-sm flex-shrink-0"
        />
      ) : (
        <div
          className={cn(
            "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0",
            "text-white text-xs font-bold shadow-sm",
            gradient,
          )}
        >
          {donation.isAnonymous ? <Heart className="w-3.5 h-3.5 fill-white/70 text-white" /> : initial}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-black truncate leading-tight">{name}</p>
        <p className="text-[11px] text-black/30 mt-px">{formatDateOnly(donation.createdAt)}</p>
      </div>

      {/* Amount */}
      <span className="text-xs font-black text-rose-500 flex-shrink-0 tabular-nums">{formatVND(donation.amount)}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CampaignSidebar({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const [copied, setCopied] = useState(false);
  const [donorModalOpen, setDonorModalOpen] = useState(false);

  // ── Donate modal state ────────────────────────────────────────────────────
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState<number | "">("");
  const [donateMessage, setDonateMessage] = useState("");
  const [donateAnonymous, setDonateAnonymous] = useState(false);
  const [createDonation, { isLoading: isDonating }] = useCreateDonationMutation();

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateAmount || donateAmount < 10000) return;
    try {
      const res = await createDonation({
        campaignId: campaign.id,
        amount: Number(donateAmount),
        message: donateMessage || undefined,
        isAnonymous: donateAnonymous,
      }).unwrap();
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err: any) {
      alert(err?.data?.message || "Đã xảy ra lỗi khi tạo thanh toán");
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const goal = campaign.goalAmount || 1;
  const raised = campaign.raisedAmount ?? 0;
  const progress = campaign.progressPercent ?? Math.min((raised / goal) * 100, 100);
  const reached = progress >= 100;
  const remaining = Math.max(0, goal - raised);

  const daysLeft = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isUrgent = daysLeft > 0 && daysLeft <= 7 && campaign.status === "active";
  const isActive = campaign.status === "active";
  const isSuspended = campaign.status === "suspended";

  const successDonations = (campaign.donations ?? []).filter((d) => d.status === "success");
  const previewDonors = successDonations.slice(0, DONOR_PREVIEW);
  const hasMoreDonors = successDonations.length > DONOR_PREVIEW;

  // ── Share handler ──────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <div className="space-y-4">
        {/* ── Fundraising card ──────────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-5 border border-black/5 shadow-lg shadow-black/4">
          {/* Goal reached banner */}
          {reached && (
            <div className="flex items-center gap-2.5 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Trophy className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-800 leading-tight">Đã đạt mục tiêu! 🎉</p>
                <p className="text-[11px] text-emerald-700 mt-px">Chiến dịch vẫn tiếp tục nhận quyên góp.</p>
              </div>
            </div>
          )}

          {/* Urgency banner */}
          {isUrgent && !reached && (
            <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-rose-500/8 border border-rose-500/20">
              <Flame className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-rose-700">
                {daysLeft === 1 ? "Chỉ còn 1 ngày cuối cùng!" : `Còn ${daysLeft} ngày nữa!`} Hãy ủng hộ ngay.
              </p>
            </div>
          )}

          {/* Suspended notice */}
          {isSuspended && (
            <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-red-500/8 border border-red-500/20">
              <AlertOctagon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-red-700">Chiến dịch đang tạm ngưng, không nhận quyên góp.</p>
            </div>
          )}

          {/* ── Raised amount ──────────────────────────────────────────────── */}
          <div className="mb-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-black tabular-nums">{formatVND(raised)}</span>
              {reached && <Trophy className="w-4 h-4 text-amber-500 mb-0.5 flex-shrink-0" />}
            </div>
            <p className="text-xs text-black/40 mt-0.5">
              đã đạt được trong tổng mục tiêu{" "}
              <span className="font-semibold text-black/60">{formatVND(campaign.goalAmount)}</span>
            </p>
          </div>

          {/* ── Progress bar (one place only) ─────────────────────────────── */}
          <div className="my-3">
            <ProgressBar progress={progress} reached={reached} />
          </div>

          {/* Progress label row */}
          <div className="flex items-center justify-between mb-4">
            <span className={cn("text-xs font-bold tabular-nums", reached ? "text-emerald-600" : "text-rose-500")}>
              {progress.toFixed(1)}%
            </span>
            {!reached && <span className="text-[11px] text-black/35">còn thiếu {formatVND(remaining)}</span>}
          </div>

          {/* ── Stat chips ────────────────────────────────────────────────── */}
          <div className="flex gap-2.5 mb-5">
            <StatChip icon={Users} label="Lượt ủng hộ" value={campaign.donorCount} />
            <StatChip
              icon={Clock}
              label={daysLeft === 0 ? "Hết hạn" : "Ngày còn lại"}
              value={daysLeft === 0 ? "—" : daysLeft}
              urgent={isUrgent}
            />
          </div>

          {/* ── Donate button ─────────────────────────────────────────────── */}
          <button
            onClick={() => setDonateModalOpen(true)}
            disabled={!isActive}
            className={cn(
              "w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 hover:from-rose-600 hover:to-rose-700 hover:scale-[1.01] active:scale-[0.99]"
                : "bg-black/6 text-black/30 cursor-not-allowed",
            )}
          >
            <Heart className={cn("w-4 h-4", isActive ? "fill-white/80 text-white" : "text-black/25")} />
            {isActive ? "Quyên Góp Ngay" : isSuspended ? "Đang tạm ngưng" : "Chiến dịch đã đóng"}
          </button>

          {/* ── Share button ───────────────────────────────────────────────── */}
          <button
            onClick={handleShare}
            className={cn(
              "w-full mt-2.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200",
              copied
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700"
                : "glass border-black/8 text-black/50 hover:text-black/70 hover:bg-white hover:border-black/12",
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Đã sao chép liên kết
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                Chia sẻ chiến dịch
              </>
            )}
          </button>

          {/* ── Deadline footnote ─────────────────────────────────────────── */}
          {campaign.deadline && (
            <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-black/30">
              <CalendarDays className="w-3 h-3" />
              <span>
                Hạn chót:{" "}
                <span className={cn("font-semibold", isUrgent ? "text-rose-500" : "text-black/45")}>
                  {formatDateOnly(campaign.deadline)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ── Donors card ───────────────────────────────────────────────────── */}
        {successDonations.length > 0 ? (
          <div className="glass-card rounded-2xl overflow-hidden border border-black/5 shadow-md shadow-black/3">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Banknote className="w-3 h-3 text-rose-500" />
                </div>
                <h3 className="text-xs font-bold text-black">Người Ủng Hộ</h3>
              </div>
              <span className="text-[11px] text-black/35 font-medium">{successDonations.length} lượt</span>
            </div>

            {/* List */}
            <div className="px-5 py-4 space-y-3.5">
              {previewDonors.map((d, i) => (
                <DonorRow key={d.id} donation={d} rank={i} />
              ))}
            </div>

            {/* View all */}
            {hasMoreDonors && (
              <button
                onClick={() => setDonorModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-black/5 text-[11px] font-semibold text-black/45 hover:text-black/65 hover:bg-black/[0.02] transition-colors"
              >
                Xem tất cả {successDonations.length} người ủng hộ
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          /* Empty donor state */
          isActive && (
            <div className="glass-card rounded-2xl p-5 border border-black/5 text-center">
              <div className="w-10 h-10 rounded-xl bg-rose-500/8 border border-rose-500/15 flex items-center justify-center mx-auto mb-2.5">
                <Heart className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-xs font-semibold text-black/45">Chưa có ai quyên góp</p>
              <p className="text-[11px] text-black/30 mt-0.5">Hãy là người đầu tiên ủng hộ!</p>
            </div>
          )
        )}
      </div>

      {/* ── Donor modal ──────────────────────────────────────────────────────── */}
      <Modal
        open={donorModalOpen}
        onClose={() => setDonorModalOpen(false)}
        title="Tất Cả Người Ủng Hộ"
        subtitle={`${successDonations.length} lượt quyên góp`}
      >
        <div className="space-y-4">
          {successDonations.map((d, i) => (
            <DonorRow key={d.id} donation={d} rank={i} />
          ))}
        </div>
      </Modal>

      {/* ── Donate modal ──────────────────────────────────────────────────────── */}
      <Modal
        open={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        title="Quyên Góp"
        subtitle={`Ủng hộ chiến dịch "${campaign.title}"`}
      >
        <form onSubmit={handleDonateSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="text-sm font-semibold text-black mb-1.5 block">
              Số tiền (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={10000}
                step={1000}
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-black font-semibold pr-12 transition-colors"
                placeholder="Ví dụ: 50000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 font-semibold">₫</span>
            </div>
            <p className="text-[11px] text-black/40 mt-1">Tối thiểu 10,000 VNĐ</p>
            {/* Quick amount buttons */}
            <div className="flex gap-2 mt-2">
              {[50000, 100000, 200000, 500000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDonateAmount(v)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                    donateAmount === v
                      ? "bg-rose-500 text-white border-rose-500"
                      : "border-black/10 text-black/50 hover:border-rose-500/30 hover:text-rose-500",
                  )}
                >
                  {formatVND(v)}
                </button>
              ))}
            </div>
          </div>

          {/* Message (becomes Comment.content + Donation.message) */}
          <div>
            <label className="text-sm font-semibold text-black mb-1.5 block">
              Lời nhắn / Động viên
            </label>
            <textarea
              value={donateMessage}
              onChange={(e) => setDonateMessage(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-sm resize-none transition-colors"
              placeholder="Gửi gắm lời yêu thương đến chiến dịch..."
            />
            <p className="text-[11px] text-black/30 text-right mt-0.5">{donateMessage.length}/500</p>
          </div>

          {/* Anonymous */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={donateAnonymous}
              onChange={(e) => setDonateAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-black/20 text-rose-500 focus:ring-rose-500"
            />
            <span className="text-sm text-black/60">Ủng hộ ẩn danh</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isDonating || !donateAmount || donateAmount < 10000}
            className={cn(
              "w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200",
              "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25",
              "hover:shadow-rose-500/40 hover:from-rose-600 hover:to-rose-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {isDonating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white/80" />
                {donateAmount && donateAmount >= 10000
                  ? `Tiếp tục thanh toán (${formatVND(Number(donateAmount))})`
                  : "Nhập số tiền để tiếp tục"}
              </>
            )}
          </button>
        </form>
      </Modal>
    </>
  );
}
