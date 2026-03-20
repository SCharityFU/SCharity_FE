import { Clock, Flame, CheckCircle2, Lock, AlertOctagon, BadgeCheck, CalendarDays, Edit2, Eye } from 'lucide-react';
import { mapCategoryToVietnamese, formatDateOnly } from '@/lib/utils';
import type { CampaignDto } from '@/dtos/campaign';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// ── Status config ─────────────────────────────────────────────────────────────

type StatusKey = 'active' | 'closed' | 'suspended' | 'completed' | 'withdrawn' | 'pending';

interface StatusConfig {
  label: string;
  Icon: React.ElementType;
  pill: string;
  pulse?: boolean;
}

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  active: {
    label: 'Đang hoạt động',
    Icon: CheckCircle2,
    pill: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/25',
    pulse: true,
  },
  closed: {
    label: 'Đã đóng',
    Icon: Lock,
    pill: 'bg-amber-500/10 text-amber-700 border border-amber-500/25',
  },
  suspended: {
    label: 'Tạm ngưng',
    Icon: AlertOctagon,
    pill: 'bg-red-500/10 text-red-700 border border-red-500/25',
  },
  completed: {
    label: 'Hoàn thành',
    Icon: BadgeCheck,
    pill: 'bg-blue-500/10 text-blue-700 border border-blue-500/25',
  },
  withdrawn: {
    label: 'Đã thanh toán',
    Icon: BadgeCheck,
    pill: 'bg-violet-500/10 text-violet-700 border border-violet-500/25',
  },
  pending: {
    label: 'Chờ duyệt',
    Icon: Clock,
    pill: 'bg-black/5 text-black/50 border border-black/10',
  },
};

// ── Avatar gradient ───────────────────────────────────────────────────────────

const GRADIENTS = [
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
];

function avatarGradient(name: string) {
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MyCampaignHeader({
  campaign,
  setIsCampaignEditOpen,
}: {
  campaign: CampaignDto;
  setIsCampaignEditOpen: (value: boolean) => void;
}) {
  const statusKey = campaign.status in STATUS_CONFIG ? (campaign.status as StatusKey) : 'pending';
  const status = STATUS_CONFIG[statusKey];
  const StatusIcon = status.Icon;

  const daysLeft = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isUrgent = daysLeft > 0 && daysLeft <= 7 && campaign.status === 'active';

  const creatorName = campaign.creator?.fullName ?? 'Người dùng ẩn danh';
  const creatorAvatar = campaign.creator?.avatarUrl;
  const creatorInitial = creatorName.charAt(0).toUpperCase();
  const gradient = avatarGradient(creatorName);

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left: Badges, Title, Creator */}
      <div className="space-y-3 flex-1">
        {/* ── Badges row ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.pill}`}
          >
            {status.pulse ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <StatusIcon className="w-3 h-3" />
            )}
            {status.label}
          </span>

          {/* Category */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium glass border border-black/8 text-black/55">
            {mapCategoryToVietnamese(campaign.category)}
          </span>

          {/* Urgency */}
          {isUrgent && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 border border-rose-500/25">
              <Flame className="w-3 h-3" />
              Còn {daysLeft} ngày!
            </span>
          )}

          {/* Deadline (non-urgent) */}
          {!isUrgent && campaign.deadline && campaign.status === 'active' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-black/40 glass border border-black/8">
              <CalendarDays className="w-3 h-3" />
              {formatDateOnly(campaign.deadline)}
            </span>
          )}
        </div>

        {/* ── Title ──────────────────────────────────────────────────────────── */}
        <h1 className="text-2xl sm:text-3xl font-black text-black leading-tight tracking-tight">{campaign.title}</h1>

        {/* ── Creator row ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 pt-1">
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="w-7 h-7 rounded-full object-cover border border-black/10 shadow-sm flex-shrink-0"
            />
          ) : (
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}
            >
              {creatorInitial}
            </div>
          )}
          <p className="text-sm text-black/50">
            Tổ chức bởi <span className="font-semibold text-black/75">{creatorName}</span>
          </p>

          {/* Suspended reason inline notice */}
          {campaign.status === 'suspended' && campaign.suspendReason && (
            <>
              <span className="w-1 h-1 rounded-full bg-black/20 mx-1" />
              <span className="text-xs text-red-600 font-medium truncate max-w-[200px]">{campaign.suspendReason}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="flex flex-col gap-2 shrink-0">
        <Link href={`/campaigns/${campaign.id}`}>
          <Button variant="outline" size="sm" className="hover:bg-black/5">
            <Eye className="w-4 h-4" />
            Xem công khai
          </Button>
        </Link>
        <Button onClick={() => setIsCampaignEditOpen(true)} size="sm" className="bg-black hover:bg-black/90">
          <Edit2 className="w-4 h-4" />
          Sửa chiến dịch
        </Button>
      </div>
    </div>
  );
}
