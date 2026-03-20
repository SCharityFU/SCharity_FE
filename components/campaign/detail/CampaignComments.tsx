'use client';
import { useState } from 'react';
import { Heart, MessageCircle, ChevronRight } from 'lucide-react';
import type { PublicCampaignDetailResponseDto } from '@/dtos/campaign';
import type { CampaignCommentResponseDto } from '@/dtos/campaign';
import { formatDateOnly } from '@/lib/utils';
import { formatVND } from '@/lib/money';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { useGetCommentReactionsQuery, useReactToCommentMutation, useCancelCommentReactionMutation } from '@/lib/store/features/commentreaction/commentReactionApi';
import { toast } from 'sonner';

// ── Avatar gradients ──────────────────────────────────────────────────────────

const GRADIENTS = [
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-400',
  'from-cyan-500 to-sky-500',
  'from-fuchsia-500 to-pink-400',
];

function getGradient(seed: string) {
  const sum = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

// ── Relative time ─────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return formatDateOnly(dateStr);
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/8 border border-rose-500/15 flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-rose-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-black">Chưa có lời chúc nào</p>
        <p className="text-xs text-black mt-0.5">Hãy quyên góp và để lại lời động viên!</p>
      </div>
    </div>
  );
}

// ── Comment card ──────────────────────────────────────────────────────────────

function CommentCard({ comment }: { comment: CampaignCommentResponseDto }) {
  const { data: reactionData } = useGetCommentReactionsQuery(comment.id);
  const [reactToComment, { isLoading: isReacting }] = useReactToCommentMutation();
  const [cancelCommentReaction, { isLoading: isCancelling }] = useCancelCommentReactionMutation();

  const reactions = reactionData?.reactions ?? [];
  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }

  const handleReact = async (type: string) => {
    // Nếu đã thả emotion này rồi, hãy xóa nó. Nếu chưa, hãy thả
    const hasReacted = counts[type] > 0;
    
    try {
      if (hasReacted) {
        // Cancel reaction
        await cancelCommentReaction({ commentId: comment.id }).unwrap();
      } else {
        // React to comment
        await reactToComment({ commentId: comment.id, type }).unwrap();
      }
    } catch (err: any) {
      if (err.status === 401) {
        toast.error('Vui lòng đăng nhập để thả cảm xúc');
      } else {
        toast.error('Không thể xử lý cảm xúc lúc này');
      }
    }
  };

  const hasDonorProfile = Boolean(comment.donor?.fullName);
  const displayName = comment.isAnonymous ? 'Nhà hảo tâm ẩn danh' : (comment.donor?.fullName ?? 'Khách vãng lai');

  const gradient = getGradient(displayName);
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = !comment.isAnonymous && hasDonorProfile ? (comment.donor?.avatarUrl ?? undefined) : undefined;

  return (
    <div className="flex gap-3 group">
      {/* ── Avatar ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover border border-black/8 shadow-sm"
          />
        ) : (
          <div
            className={cn(
              'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center',
              'text-white shadow-sm flex-shrink-0',
              gradient,
            )}
          >
            {comment.emoji ? (
              <span className="text-sm leading-none">{comment.emoji}</span>
            ) : comment.isAnonymous ? (
              <Heart className="w-3.5 h-3.5 fill-white/70 text-white" />
            ) : (
              <span className="text-xs font-bold">{initial}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Bubble ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'glass border border-black/5 rounded-2xl rounded-tl-sm px-3.5 py-2.5',
            'transition-all duration-200 group-hover:border-black/10',
          )}
        >
          {/* Header & Content combined to align with reactions */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-black leading-tight block mb-1">{displayName}</span>
              
              {/* Donation pill */}
              {comment.donation && (
                <div className="inline-flex items-center gap-1 mb-2 text-[10px] font-semibold text-rose-600 bg-rose-500/8 px-1.5 py-0.5 rounded-full border border-rose-500/15">
                  <Heart className="w-2 h-2 fill-rose-500 text-rose-500" />
                  Đã ủng hộ {formatVND(comment.donation.amount)}
                </div>
              )}

              {/* Text - now aligned with the right side icons */}
              <p className="text-[14px] sm:text-base text-black/90 leading-tight">
                {comment.content}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[11px] text-black/40 whitespace-nowrap">
                {relativeTime(comment.createdAt)}
              </span>
              
              {/* Reactions aligned to the right of the content */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={isReacting || isCancelling}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200 border",
                    "bg-white border-black/5 hover:border-blue-500/30 hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:opacity-50",
                    counts['like'] > 0 && "border-blue-500/20 bg-blue-50/50 text-blue-600"
                  )}
                  onClick={() => handleReact('like')}
                >
                  <span>👍</span>
                  <span className="tabular-nums">{counts['like'] || 0}</span>
                </button>

                <button
                  disabled={isReacting || isCancelling}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200 border",
                    "bg-white border-black/5 hover:border-rose-500/30 hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:opacity-50",
                    counts['heart'] > 0 && "border-rose-500/20 bg-rose-50/50 text-rose-600"
                  )}
                  onClick={() => handleReact('heart')}
                >
                  <Heart className={cn("w-3 h-3", counts['heart'] > 0 ? "fill-rose-500 text-rose-500" : "text-black/40")} />
                  <span className="tabular-nums">{counts['heart'] || 0}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emoji at bottom left of bubble if exists */}
          {comment.emoji && (
            <div className="mt-2 text-lg leading-none" title="Cảm xúc của người tặng">
              {comment.emoji}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 5;

export function CampaignComments({ campaign }: { campaign: PublicCampaignDetailResponseDto }) {
  const [modalOpen, setModalOpen] = useState(false);

  const comments = campaign.comments ?? [];
  const preview = comments.slice(0, PREVIEW_COUNT);
  const hasMore = comments.length > PREVIEW_COUNT;
  const donorCommentCount = comments.filter((c) => c.donation).length;

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* ── Section header ───────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black leading-tight">Lời Chúc &amp; Động Viên</h2>
              {donorCommentCount > 0 && (
                <p className="text-[11px] text-black mt-px">
                  {donorCommentCount} trong số {comments.length} người đã quyên góp
                </p>
              )}
            </div>
          </div>

          {comments.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold shadow-sm shadow-rose-500/25">
              {comments.length}
            </span>
          )}
        </div>

        {/* ── Comment list ─────────────────────────────────────────────────── */}
        <div className="px-6 py-5">
          {comments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {preview.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* ── View all button ───────────────────────────────────────────────── */}
        {hasMore && (
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-3.5 border-t border-black/5 text-xs font-semibold text-black hover:text-black/75 hover:bg-black/[0.02] transition-colors"
          >
            Xem tất cả {comments.length} lời chúc
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Lời Chúc & Động Viên"
        subtitle={`${comments.length} lời chúc · mới nhất trước`}
      >
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      </Modal>
    </>
  );
}
