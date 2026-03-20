'use client';

import {
  Heart,
  Users,
  Clock,
  Share2,
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
  Flag,
  SquareChartGantt,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { PublicCampaignDetailResponseDto } from '@/dtos/campaign';
import type { DonationResponseDto } from '@/dtos/donation';
import { formatDateOnly, formatCampaignProgressPercent, resolveCampaignProgressPercent } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { WithdrawRequestModal } from '@/components/campaign/detail/WithdrawRequestModal';
import { useAuth } from '@/hooks/useAuth';
import { useGetCampaignWithdrawalsQuery } from '@/lib/store/features/campaign/campaignApi';
import { cn } from '@/lib/utils';
import { useCreateDonationMutation } from '@/lib/store/features/donation/donationApi';
import { toast } from 'sonner';
import { getSafeApiErrorMessage } from '@/lib/api-error';
import ReportCampaignModal from '@/components/campaigns/ReportCampaignModal';
import { Button } from '@/components/ui/button';
import { MIN_DONATION_AMOUNT, MAX_DONATION_AMOUNT, DONOR_PREVIEW } from '@/components/campaign/create/constants';
import { formatVND, formatVNDInput, parseVNDInputToNumber } from '@/lib/money';

// ── Constants ─────────────────────────────────────────────────────────────────

const SUCCESS_DONATION_STATUSES = new Set(['success', 'completed', 'paid']);

const DONOR_GRADIENTS = [
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-400',
  'from-cyan-500 to-sky-500',
  'from-fuchsia-500 to-pink-400',
];

function donorGradient(seed: string) {
  const sum = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DONOR_GRADIENTS[sum % DONOR_GRADIENTS.length];
}

// ── Animated progress bar ─────────────────────────────────────────────────────

function ProgressBar({ progress, reached }: { progress: number; reached: boolean }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const targetWidth = Math.max(0, Math.min(progress, 100));
    const id = requestAnimationFrame(() => setWidth(targetWidth));
    return () => cancelAnimationFrame(id);
  }, [progress]);

  return (
    <div className="relative h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          reached ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-violet-500',
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
      <Icon className={cn('w-4 h-4', urgent ? 'text-rose-500' : 'text-black')} />
      <span className={cn('text-base font-black tabular-nums leading-none', urgent ? 'text-rose-500' : 'text-black')}>
        {value}
      </span>
      <span className="text-[11px] text-black font-medium">{label}</span>
    </div>
  );
}

// ── Donor row ─────────────────────────────────────────────────────────────────

function DonorRow({ donation }: { donation: DonationResponseDto }) {
  const name = donation.donorDisplayName ?? 'Nhà hảo tâm ẩn danh';
  const gradient = donorGradient(name);
  const initial = name.charAt(0).toUpperCase();
  const avatarUrl = !donation.isAnonymous ? (donation.donor?.avatarUrl ?? undefined) : undefined;

  return (
    <div className="flex items-center gap-3">
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
            'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
            'text-white text-xs font-bold shadow-sm',
            gradient,
          )}
        >
          {donation.isAnonymous ? <Heart className="w-3.5 h-3.5 fill-white/70 text-white" /> : initial}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-black truncate leading-tight">{name}</p>
        <p className="text-[11px] text-black mt-px">{formatDateOnly(donation.createdAt)}</p>
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
  if (latestWithdraw.status === 'pending') {
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
          Yêu cầu rút <span className="font-semibold text-black/60">{formatVND(latestWithdraw.amount)}</span> đang chờ
          Admin duyệt.
        </p>
      </div>
    );
  }

  // Approved → show success state
  if (latestWithdraw.status === 'approved') {
    return (
      <div className="mt-2.5 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-800">Yêu cầu rút tiền đã được duyệt</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Số tiền <span className="font-semibold">{formatVND(latestWithdraw.amount)}</span> sẽ được chuyển vào tài
            khoản.
          </p>
        </div>
      </div>
    );
  }

  // Completed → show completed
  if (latestWithdraw.status === 'completed') {
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
  if (latestWithdraw.status === 'rejected') {
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
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // ── Donate modal state ────────────────────────────────────────────────────
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState<number | ''>('');
  const [donateMessage, setDonateMessage] = useState('');
  const [donateAnonymous, setDonateAnonymous] = useState(false);
  const [createDonation, { isLoading: isDonating }] = useCreateDonationMutation();

  useEffect(() => {
    if (donateModalOpen && !user) {
      setDonateAnonymous(true);
    }
  }, [donateModalOpen, user]);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateAmount || donateAmount < MIN_DONATION_AMOUNT || donateAmount > MAX_DONATION_AMOUNT) return;
    try {
      const res = await createDonation({
        campaignId: campaign.id,
        amount: Number(donateAmount),
        message: donateMessage || undefined,
        isAnonymous: user ? donateAnonymous : true,
      }).unwrap();
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err: unknown) {
      toast.error(getSafeApiErrorMessage(err, 'Đã xảy ra lỗi khi tạo thanh toán'));
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const goal = campaign.goalAmount || 1;
  const raised = campaign.raisedAmount ?? 0;
  const progress = resolveCampaignProgressPercent({
    progressPercent: campaign.progressPercent,
    raisedAmount: raised,
    goalAmount: goal,
  });
  const reached = progress >= 100;
  const remaining = Math.max(0, goal - raised);

  const daysLeft = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const normalizedCampaignStatus = String(campaign.status ?? '').toLowerCase();
  const isUrgent = daysLeft > 0 && daysLeft <= 7 && normalizedCampaignStatus === 'active';
  const isActive = normalizedCampaignStatus === 'active';
  const isClosed = normalizedCampaignStatus === 'closed';
  const isSuspended = normalizedCampaignStatus === 'suspended';
  const isCompleted = normalizedCampaignStatus === 'completed';
  const isWithdrawn = normalizedCampaignStatus === 'withdrawn';
  const isRejected = normalizedCampaignStatus === 'rejected';

  const canDonate = isActive;

  const donateButtonLabel = canDonate
    ? 'Quyên Góp Ngay'
    : isWithdrawn
      ? 'Đã giải ngân'
      : isCompleted
        ? 'Đã kết thúc quyên góp'
        : isSuspended
          ? 'Đang tạm ngưng'
          : isRejected
            ? 'Chưa được phê duyệt'
            : 'Chiến dịch đã đóng';

  const successDonations = (campaign.donations ?? []).filter((d) => {
    // Campaign detail payload may omit donation status; in that case, keep item visible.
    if (d.status == null) return true;
    const normalizedStatus = String(d.status).trim().toLowerCase();
    return SUCCESS_DONATION_STATUSES.has(normalizedStatus);
  });
  const previewDonors = successDonations.slice(0, DONOR_PREVIEW);
  const hasMoreDonors = successDonations.length > DONOR_PREVIEW;

  // ── Owner logic ────────────────────────────────────────────────────────────
  const isOwner = user?.id === campaign.creatorId;

  // ── Share handler ──────────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareQuote = `Hãy cùng tôi chung tay ủng hộ chiến dịch "${campaign.title}" trên FCam!`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareQuote)}`;

    // Open Facebook share dialog
    window.open(facebookShareUrl, '_blank', 'width=600,height=400');
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
                {daysLeft === 1 ? 'Chỉ còn 1 ngày cuối cùng!' : `Còn ${daysLeft} ngày nữa!`} Hãy ủng hộ ngay.
              </p>
            </div>
          )}

          {/* Suspended notice */}
          {/* {isSuspended && (
            <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-red-500/8 border border-red-500/20">
              <AlertOctagon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-red-700">Chiến dịch đang tạm ngưng, không nhận quyên góp.</p>
            </div>
          )} */}

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
            <p className="text-xs text-black mt-0.5">
              đã đạt được trong tổng mục tiêu{' '}
              <span className="font-semibold text-black">{formatVND(campaign.goalAmount)}</span>
            </p>
          </div>

          {/* ── Progress bar (one place only) ─────────────────────────────── */}
          <div className="my-3">
            <ProgressBar progress={progress} reached={reached} />
          </div>

          {/* Progress label row */}
          <div className="flex items-center justify-between mb-4">
            <span className={cn('text-xs font-bold tabular-nums', reached ? 'text-emerald-600' : 'text-rose-500')}>
              {formatCampaignProgressPercent(progress)}
            </span>
            {!reached && <span className="text-[11px] text-black">còn thiếu {formatVND(remaining)}</span>}
          </div>

          {/* ── Stat chips ────────────────────────────────────────────────── */}
          <div className="flex gap-2.5 mb-5">
            <StatChip icon={Users} label="Lượt ủng hộ" value={campaign.donorCount} />
            <StatChip
              icon={Clock}
              label={daysLeft === 0 ? 'Hết hạn' : 'Ngày còn lại'}
              value={daysLeft === 0 ? '—' : daysLeft}
              urgent={isUrgent}
            />
          </div>

          {/* ── Donate button ─────────────────────────────────────────────── */}
          <button
            onClick={() => setDonateModalOpen(true)}
            disabled={!canDonate}
            className={cn(
              'w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200',
              canDonate
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 hover:from-rose-600 hover:to-rose-700 hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-black/6 text-black/60 cursor-not-allowed',
            )}
          >
            <Heart className={cn('w-4 h-4', canDonate ? 'fill-white/80 text-white' : 'text-black/60')} />
            {donateButtonLabel}
          </button>

          {/* ── Share button ───────────────────────────────────────────────── */}
          <div className="mt-2.5 flex items-center gap-2">
            <Button onClick={handleShare} variant={'outline'} className="flex-1 w-full">
              <Share2 className="w-3.5 h-3.5" />
              Chia sẻ chiến dịch
            </Button>

            <button
              type="button"
              aria-label="Báo cáo chiến dịch"
              title="Báo cáo chiến dịch"
              onClick={() => setReportModalOpen(true)}
              className="w-10 h-10 rounded-xl border border-red-500/25 bg-red-500/8 text-red-600 hover:bg-red-500/15 hover:border-red-500/35 transition-colors flex items-center justify-center"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {isOwner && (
            <Link href={`/dashboard/my-campaigns/${campaign.id}`} className="block mt-2.5">
              <Button variant="outline" className="w-full">
                <SquareChartGantt className="w-4 h-4" />
                Quản lý chiến dịch này
              </Button>
            </Link>
          )}

          {/* ── Owner: Withdraw request button (after close) ──────────────── */}
          {isOwner && isClosed && (
            <WithdrawButtonSection campaign={campaign} onOpenModal={() => setWithdrawModalOpen(true)} />
          )}

          {/* ── Deadline footnote ─────────────────────────────────────────── */}
          {campaign.deadline && (
            <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-black/70">
              <CalendarDays className="w-3 h-3" />
              <span>
                Hạn chót:{' '}
                <span className={cn('font-semibold', isUrgent ? 'text-rose-500' : 'text-black')}>
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
              <span className="text-[11px] text-black/70 font-medium">{successDonations.length} lượt</span>
            </div>

            {/* List */}
            <div className="px-5 py-4 space-y-3.5">
              {previewDonors.map((d) => (
                <DonorRow key={d.id} donation={d} />
              ))}
            </div>

            {/* View all */}
            {hasMoreDonors && (
              <button
                onClick={() => setDonorModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-black/5 text-[11px] font-semibold text-black/70 hover:text-black hover:bg-black/[0.02] transition-colors"
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
              <p className="text-xs font-semibold text-black">Chưa có ai quyên góp</p>
              <p className="text-[11px] text-black/70 mt-0.5">Hãy là người đầu tiên ủng hộ!</p>
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
          {successDonations.map((d) => (
            <DonorRow key={d.id} donation={d} />
          ))}
        </div>
      </Modal>

      <WithdrawRequestModal open={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} campaign={campaign} />

      <ReportCampaignModal campaignId={campaign.id} open={reportModalOpen} onOpenChange={setReportModalOpen} />

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
                type="text"
                required
                inputMode="numeric"
                value={donateAmount === '' ? '' : formatVNDInput(Number(donateAmount))}
                onChange={(e) => {
                  const parsed = parseVNDInputToNumber(e.target.value);
                  if (!parsed) {
                    setDonateAmount('');
                    return;
                  }
                  const clamped = Math.min(parsed, MAX_DONATION_AMOUNT);
                  setDonateAmount(clamped);
                }}
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-black font-semibold pr-12 transition-colors"
                placeholder="Ví dụ: 50000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 font-semibold">₫</span>
            </div>
            <p className="text-[11px] text-black/40 mt-1">Tối thiểu 10,000 VNĐ · Tối đa 1,000,000,000 VNĐ</p>
            {/* Quick amount buttons */}
            <div className="flex gap-2 mt-2">
              {[50000, 100000, 200000, 500000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDonateAmount(v)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                    donateAmount === v
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'border-black/10 text-black/50 hover:border-rose-500/30 hover:text-rose-500',
                  )}
                >
                  {formatVND(v)}
                </button>
              ))}
            </div>
          </div>

          {/* Message (becomes Comment.content + Donation.message) */}
          <div>
            <label className="text-sm font-semibold text-black mb-1.5 block">Lời nhắn / Động viên</label>
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
              onChange={(e) => {
                if (!user) return;
                setDonateAnonymous(e.target.checked);
              }}
              disabled={!user}
              className="w-4 h-4 rounded border-black/20 text-rose-500 focus:ring-rose-500"
            />
            <span className="text-sm text-black/60">Ủng hộ ẩn danh{!user ? ' (bắt buộc khi chưa đăng nhập)' : ''}</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isDonating || !donateAmount || donateAmount < MIN_DONATION_AMOUNT || donateAmount > MAX_DONATION_AMOUNT
            }
            className={cn(
              'w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200',
              'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25',
              'hover:shadow-rose-500/40 hover:from-rose-600 hover:to-rose-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isDonating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white/80" />
                {donateAmount && donateAmount >= MIN_DONATION_AMOUNT && donateAmount <= MAX_DONATION_AMOUNT
                  ? `Tiếp tục thanh toán (${formatVND(Number(donateAmount))})`
                  : 'Nhập số tiền để tiếp tục'}
              </>
            )}
          </button>
        </form>
      </Modal>
    </>
  );
}
