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
  XCircle,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { PublicCampaignDetailResponseDto } from "@/dtos/campaign";
import type { DonationResponseDto } from "@/dtos/donation";
import { formatVND, formatDateOnly } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { CloseCampaignModal } from "@/components/campaign/detail/CloseCampaignModal";
import { WithdrawRequestModal } from "@/components/campaign/detail/WithdrawRequestModal";
import { useAuth } from "@/hooks/useAuth";
import { useGetCampaignWithdrawalsQuery } from "@/lib/store/features/campaign/campaignApi";
import { cn } from "@/lib/utils";

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
        {donation.message ? (
          <p className="text-[11px] text-black/35 italic truncate mt-px">"{donation.message}"</p>
        ) : (
          <p className="text-[11px] text-black/30 mt-px">{formatDateOnly(donation.createdAt)}</p>
        )}
      </div>

      {/* Amount */}
      <span className="text-xs font-black text-rose-500 flex-shrink-0 tabular-nums">{formatVND(donation.amount)}</span>
    </div>
  );
}

// ── Withdraw button with status checking ──────────────────────────────────────

function WithdrawButtonSection({
  campaign,
  onOpenModal,
}: {
  campaign: PublicCampaignDetailResponseDto;
  onOpenModal: () => void;
}) {
  const { data: withdrawals, isLoading } = useGetCampaignWithdrawalsQuery(campaign.id);

  // Find the most recent withdrawal
  const latestWithdraw = withdrawals?.[0] ?? null;

  if (isLoading) {
    return (
      <div className="w-full mt-2.5 py-3.5 rounded-xl bg-gray-100 border border-black/5 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-black/30" />
        <span className="text-xs text-black/40">Đang kiểm tra...</span>
      </div>
    );
  }

  // No withdrawal exists → show the normal button
  if (!latestWithdraw) {
    return (
      <button
        onClick={onOpenModal}
        className="w-full mt-2.5 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-600 hover:to-violet-700 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
      >
        <Wallet className="w-4 h-4" />
        Yêu cầu rút tiền
      </button>
    );
  }

  // Pending → show waiting button
  if (latestWithdraw.status === "pending") {
    return (
      <div className="mt-2.5 space-y-2">
        <button
          disabled
          className="w-full py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Đợi duyệt rút tiền
        </button>
        <p className="text-[11px] text-black/40 text-center">
          Yêu cầu rút <span className="font-semibold text-black/60">{formatVND(latestWithdraw.amount)}</span> đang chờ Admin duyệt.
        </p>
      </div>
    );
  }

  // Approved → show success state
  if (latestWithdraw.status === "approved") {
    return (
      <div className="mt-2.5 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-800">Yêu cầu rút tiền đã được duyệt</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Số tiền <span className="font-semibold">{formatVND(latestWithdraw.amount)}</span> sẽ được chuyển vào tài khoản.
          </p>
        </div>
      </div>
    );
  }

  // Completed → show completed
  if (latestWithdraw.status === "completed") {
    return (
      <div className="mt-2.5 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-800">Đã rút tiền thành công</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Số tiền <span className="font-semibold">{formatVND(latestWithdraw.amount)}</span> đã được chuyển.
          </p>
        </div>
      </div>
    );
  }

  // Rejected → show error + allow retry
  if (latestWithdraw.status === "rejected") {
    return (
      <div className="mt-2.5 space-y-2">
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-red-800">Yêu cầu rút tiền bị từ chối</p>
            {latestWithdraw.rejectReason && (
              <p className="text-[11px] text-red-700 mt-0.5">{latestWithdraw.rejectReason}</p>
            )}
          </div>
        </div>
        <button
          onClick={onOpenModal}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-600 hover:to-violet-700 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          <Wallet className="w-4 h-4" />
          Gửi lại yêu cầu rút tiền
        </button>
      </div>
    );
  }

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export function CampaignSidebar({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

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
  const isClosed = campaign.status === "closed";
  const isSuspended = campaign.status === "suspended";

  const successDonations = (campaign.donations ?? []).filter((d) => d.status === "success");
  const previewDonors = successDonations.slice(0, DONOR_PREVIEW);
  const hasMoreDonors = successDonations.length > DONOR_PREVIEW;

  // ── Owner logic ────────────────────────────────────────────────────────────
  const isOwner = user?.id === campaign.creatorId;
  const deadlineReached = campaign.deadline ? new Date(campaign.deadline) <= new Date() : false;
  const canClose = isOwner && isActive && (progress >= 50 || deadlineReached);
  const cannotCloseReason =
    isOwner && isActive && !canClose
      ? "Bạn chỉ có thể đóng chiến dịch khi đạt tối thiểu 50% mục tiêu hoặc khi hết thời hạn."
      : null;

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

          {/* Closed notice */}
          {isClosed && (
            <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-gray-500/8 border border-gray-500/20">
              <XCircle className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-gray-700">Chiến dịch đã kết thúc gây quỹ.</p>
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
          {!isClosed && (
            <button
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
          )}

          {/* ── Owner: Close campaign button ──────────────────────────────── */}
          {isOwner && isActive && (
            <div className="relative group mt-2.5">
              <button
                onClick={() => canClose && setCloseModalOpen(true)}
                disabled={!canClose}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 border",
                  canClose
                    ? "border-red-500/30 bg-red-500/8 text-red-600 hover:bg-red-500/15 hover:border-red-500/40"
                    : "border-black/8 bg-black/[0.03] text-black/25 cursor-not-allowed",
                )}
              >
                <XCircle className="w-4 h-4" />
                Kết thúc gây quỹ
              </button>
              {/* Tooltip for disabled state */}
              {cannotCloseReason && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-black/80 text-white text-[11px] leading-relaxed max-w-[260px] text-center opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20">
                  {cannotCloseReason}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
                </div>
              )}
            </div>
          )}

          {/* ── Owner: Withdraw request button (after close) ──────────────── */}
          {isOwner && isClosed && (
            <WithdrawButtonSection campaign={campaign} onOpenModal={() => setWithdrawModalOpen(true)} />
          )}

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

      <CloseCampaignModal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        campaign={campaign}
      />

      <WithdrawRequestModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        campaign={campaign}
      />
    </>
  );
}
