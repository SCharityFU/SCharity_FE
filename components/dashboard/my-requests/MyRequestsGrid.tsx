import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Eye, Landmark, Tag, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextContent } from '@/components/ui/rich-text-content';
import { CampaignRequestStatus } from '@/dtos/enums';
import type { CampaignRequestResponseDto } from '@/dtos/campaign';
import { CATEGORY_LABELS, STATUS_CONFIG, fmtDate, fmtVND } from '@/components/dashboard/my-requests/constants';

interface MyRequestsGridProps {
  requests: CampaignRequestResponseDto[];
  activeReqId: string | null;
  page: number;
  totalPages: number;
  isFetching: boolean;
  onOpenDetail: (req: CampaignRequestResponseDto) => void;
  onPageChange: (nextPage: number) => void;
}

export function MyRequestsGrid({
  requests,
  activeReqId,
  page,
  totalPages,
  isFetching,
  onOpenDetail,
  onPageChange,
}: MyRequestsGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {requests.map((req: CampaignRequestResponseDto, i: number) => {
            const statusCfg = STATUS_CONFIG[req.status as CampaignRequestStatus];
            const StatusIcon = statusCfg.icon;
            const isActive = activeReqId === req.id;

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col ${
                  isActive ? 'ring-2 ring-rose-400 shadow-lg shadow-rose-500/10' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                  {req.category && (
                    <span className="text-[11px] text-black/40 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {CATEGORY_LABELS[req.category] ?? req.category}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-black text-[15px] leading-snug mb-2 line-clamp-2">{req.title}</h3>

                <div className="text-xs text-black/50 leading-relaxed mb-3 flex-1 max-h-20 overflow-hidden">
                  <RichTextContent
                    content={req.story}
                    className="!text-xs [&_*]:text-xs [&_*]:leading-relaxed"
                    emptyText="Chưa có mô tả"
                  />
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-black/60">
                    <Target className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="font-semibold">{fmtVND(req.goalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/50">
                    <CalendarDays className="w-3 h-3 text-violet-400 shrink-0" />
                    <span>Hạn: {fmtDate(req.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/40">
                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Gửi: {fmtDate(req.createdAt)}</span>
                  </div>
                </div>

                {req.bankInfo && (
                  <div className="flex items-center gap-1.5 text-[11px] text-black/35 mb-3 px-2 py-1.5 rounded-lg bg-black/[0.03]">
                    <Landmark className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {req.bankInfo.bankName} - ****{req.bankInfo.accountNumber.slice(-4)}
                    </span>
                  </div>
                )}

                {req.rejectReason && (
                  <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 mb-3">
                    <p className="text-[11px] text-rose-500 line-clamp-2">
                      <strong>Từ chối:</strong> {req.rejectReason}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 pt-3 border-t border-black/5 mt-auto">
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onOpenDetail(req)}>
                    <Eye className="w-3 h-3" />
                    Xem Chi Tiết
                  </Button>
                  {req.campaignId && (
                    <Link href={`/campaigns/${req.campaignId}`} className="w-full">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        <Eye className="w-3 h-3" />
                        Xem CD
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-black/50">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );
}
