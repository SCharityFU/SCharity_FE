'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Calendar,
  Filter,
  X,
  ExternalLink,
  Loader2,
  ArrowUpDown,
} from 'lucide-react';
import { useGetMyDonationHistoryQuery } from '@/lib/store/features/donation/donationApi';
import type { DonationResponseDto } from '@/dtos/donation';
import { formatVND, formatDateOnly } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  success: {
    label: 'Thành công',
    className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  },
  pending: {
    label: 'Đang xử lý',
    className: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  },
  failed: {
    label: 'Thất bại',
    className: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    className: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/8 border border-rose-500/15 flex items-center justify-center mb-5">
        <Heart className="w-8 h-8 text-rose-400" />
      </div>
      <h3 className="text-lg font-bold text-black mb-1.5">Bạn chưa thực hiện quyên góp nào</h3>
      <p className="text-sm text-black/40 max-w-xs mb-6">
        Hãy bắt đầu hành trình lan tỏa yêu thương bằng những đóng góp nhỏ nhưng ý nghĩa.
      </p>
      <Link href="/campaigns">
        <button className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 hover:from-rose-600 hover:to-rose-700 transition-all flex items-center gap-2">
          <Heart className="w-4 h-4 fill-white/80" />
          Khám phá các chiến dịch ngay
        </button>
      </Link>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({
  donation,
  open,
  onClose,
}: {
  donation: DonationResponseDto | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!donation) return null;

  const rows = [
    { label: 'Mã giao dịch', value: donation.transactionRef || '—' },
    { label: 'Số tiền', value: formatVND(donation.amount) },
    { label: 'Ngày giao dịch', value: formatDateOnly(donation.createdAt) },
    { label: 'Trạng thái', value: null, badge: donation.status },
    { label: 'Hình thức', value: donation.isAnonymous ? 'Ẩn danh' : 'Công khai' },
    { label: 'Lời nhắn', value: donation.message || '—' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Chi Tiết Giao Dịch" subtitle={donation.campaign?.title}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between py-2 border-b border-black/5 last:border-0">
            <span className="text-sm text-black/50 font-medium">{row.label}</span>
            {row.badge ? (
              <StatusBadge status={row.badge} />
            ) : (
              <span className="text-sm text-black font-semibold text-right max-w-[60%]">{row.value}</span>
            )}
          </div>
        ))}

        {/* Campaign link */}
        {donation.campaign && (
          <Link
            href={`/campaigns/${donation.campaignId}`}
            className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-black/10 text-sm font-semibold text-black/60 hover:text-black/80 hover:border-black/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Xem trang chiến dịch
          </Link>
        )}
      </div>
    </Modal>
  );
}

// ── PDF Receipt ───────────────────────────────────────────────────────────────

function downloadReceipt(donation: DonationResponseDto) {
  const campaignTitle = donation.campaign?.title ?? 'Chiến dịch';
  const date = formatDateOnly(donation.createdAt);
  const amount = formatVND(donation.amount);
  const ref = donation.transactionRef ?? 'N/A';

  // Simple HTML → PDF via print
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Biên Lai Quyên Góp</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { padding: 48px; color: #111; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 22px; color: #e11d48; margin-bottom: 4px; }
        .header p { font-size: 13px; color: #666; }
        .divider { border: none; border-top: 2px solid #f1f1f1; margin: 24px 0; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
        .row .label { color: #666; font-size: 14px; }
        .row .value { font-weight: 600; font-size: 14px; text-align: right; max-width: 60%; }
        .amount { color: #e11d48; font-size: 20px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-failed { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>❤️ FCam</h1>
        <p>Biên Lai Xác Nhận Quyên Góp</p>
      </div>
      <hr class="divider" />
      <div class="row"><span class="label">Chiến dịch</span><span class="value">${campaignTitle}</span></div>
      <div class="row"><span class="label">Mã giao dịch</span><span class="value">${ref}</span></div>
      <div class="row"><span class="label">Ngày giao dịch</span><span class="value">${date}</span></div>
      <div class="row"><span class="label">Số tiền</span><span class="value amount">${amount}</span></div>
      <div class="row"><span class="label">Trạng thái</span><span class="value"><span class="badge badge-${donation.status}">${STATUS_MAP[donation.status]?.label ?? donation.status}</span></span></div>
      <div class="row"><span class="label">Hình thức</span><span class="value">${donation.isAnonymous ? 'Ẩn danh' : 'Công khai'}</span></div>
      ${donation.message ? `<div class="row"><span class="label">Lời nhắn</span><span class="value">${donation.message}</span></div>` : ''}
      <hr class="divider" />
      <div class="footer">
        <p>Cảm ơn bạn đã đóng góp cho cộng đồng! 💛</p>
        <p style="margin-top: 4px;">FCam — Nền tảng quyên góp từ thiện</p>
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=600,height=800');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.print();
  };
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-black/8 text-black/40 hover:text-black/70 hover:border-black/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} className="px-2 text-black/30 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-semibold transition-all',
              p === page ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25' : 'text-black/50 hover:bg-black/5',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-black/8 text-black/40 hover:text-black/70 hover:border-black/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Donation Row ──────────────────────────────────────────────────────────────

function DonationRow({
  donation,
  onViewDetail,
}: {
  donation: DonationResponseDto;
  onViewDetail: (d: DonationResponseDto) => void;
}) {
  const thumbnailUrl = (donation.campaign as any)?.thumbnailUrl;

  return (
    <div className="group flex items-center gap-4 px-5 py-4 border-b border-black/5 last:border-0 hover:bg-black/[0.015] transition-colors">
      {/* Campaign thumb + name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-black/5 flex-shrink-0 overflow-hidden border border-black/8">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-black/20" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-black truncate">{donation.campaign?.title ?? 'Chiến dịch'}</p>
          <p className="text-[11px] text-black/35 mt-0.5">{donation.isAnonymous ? 'Ẩn danh' : 'Công khai'}</p>
        </div>
      </div>

      {/* Date */}
      <div className="hidden sm:block w-28 text-center">
        <p className="text-sm text-black/60">{formatDateOnly(donation.createdAt)}</p>
      </div>

      {/* Amount */}
      <div className="w-28 text-right">
        <p className="text-sm font-bold text-black">{formatVND(donation.amount)}</p>
      </div>

      {/* Status */}
      <div className="hidden md:flex w-28 justify-center">
        <StatusBadge status={donation.status} />
      </div>

      {/* Actions — fixed width to match header */}
      <div className="w-[72px] flex items-center justify-end gap-1">
        <button
          onClick={() => onViewDetail(donation)}
          className="p-2 rounded-lg text-black/30 hover:text-black/70 hover:bg-black/5 transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4" />
        </button>
        {donation.status === 'success' ? (
          <button
            onClick={() => downloadReceipt(donation)}
            className="p-2 rounded-lg text-black/30 hover:text-rose-500 hover:bg-rose-500/5 transition-colors"
            title="Tải biên lai"
          >
            <Download className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" /> /* Spacer to keep alignment */
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export default function DonationHistory() {
  // Filters
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  //Detail modal
  const [selectedDonation, setSelectedDonation] = useState<DonationResponseDto | null>(null);

  // Build query
  const queryParams = {
    page,
    limit: ITEMS_PER_PAGE,
    ...(statusFilter && { status: statusFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data, isLoading, isFetching } = useGetMyDonationHistoryQuery(queryParams, {
    pollingInterval: 15000, // Real-time: poll every 15s
  });

  const donations = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const hasFilters = !!statusFilter || !!startDate || !!endDate;
  const clearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-black">Lịch Sử Quyên Góp</h1>
        <p className="text-sm text-black/40 mt-1">Theo dõi tất cả khoản quyên góp của bạn</p>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-black/10 text-sm bg-white outline-none appearance-none cursor-pointer hover:border-black/20 focus:border-rose-500 transition-colors min-w-[150px]"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm bg-white outline-none hover:border-black/20 focus:border-rose-500 transition-colors"
                placeholder="Từ ngày"
              />
            </div>
            <span className="text-black/20 text-sm">→</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm bg-white outline-none hover:border-black/20 focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Xóa bộ lọc
            </button>
          )}

          {/* Result count */}
          <div className="ml-auto text-xs text-black/35 font-medium">
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : `${total} kết quả`}
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-black/8 bg-black/[0.02]">
          <div className="flex-1 text-[11px] font-semibold text-black/40 uppercase tracking-wider">Chiến dịch</div>
          <div className="hidden sm:block w-28 text-center text-[11px] font-semibold text-black/40 uppercase tracking-wider">
            Ngày
          </div>
          <div className="w-28 text-right text-[11px] font-semibold text-black/40 uppercase tracking-wider">
            Số tiền
          </div>
          <div className="hidden md:flex w-28 justify-center text-[11px] font-semibold text-black/40 uppercase tracking-wider">
            Trạng thái
          </div>
          <div className="w-[72px]" />
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-sm text-black/40">Đang tải dữ liệu...</p>
          </div>
        ) : donations.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {donations.map((donation: DonationResponseDto) => (
              <DonationRow key={donation.id} donation={donation} onViewDetail={(d) => setSelectedDonation(d)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────── */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <DetailModal donation={selectedDonation} open={!!selectedDonation} onClose={() => setSelectedDonation(null)} />
    </div>
  );
}
