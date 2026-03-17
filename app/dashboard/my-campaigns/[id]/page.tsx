'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Calendar,
  Edit2,
  BarChart3,
  Eye,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RichTextContent } from '@/components/ui/rich-text-content';
import {
  useGetMyCampaignsQuery,
  useGetCampaignUpdatesQuery,
  useDeleteCampaignUpdateMutation,
  useGetCampaignWithdrawalsQuery,
} from '@/lib/store/features/campaign/campaignApi';
import { WithdrawRequestModal } from '@/components/campaign/detail/WithdrawRequestModal';
import { CampaignEditModal, UpdatesList, UpdateDetailModal, UpdateEditModal } from '@/components/campaign/my-campaign';
import type { CampaignDto, CampaignUpdateResponseDto } from '@/dtos/campaign';
import { CampaignStatus, WithdrawStatus } from '@/dtos/enums';
import { CampaignImageSlider } from '@/components/campaign/detail/CampaignImageSlider';
import { MyCampaignHeader } from '@/components/campaign/my-campaign/MyCampaignHeader';
import { formatDate, formatVND } from '@/lib/utils';

// ── Skeleton Loader ────────────────────────────────────────────────────────────

function Bone({ className = '' }: { className?: string }) {
  return <div className={`rounded-xl bg-black/[0.06] animate-pulse ${className}`} />;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [updateFilter, setUpdateFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCampaignEditOpen, setIsCampaignEditOpen] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<CampaignUpdateResponseDto | null>(null);
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [selectedUpdateForView, setSelectedUpdateForView] = useState<CampaignUpdateResponseDto | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawHistoryOpen, setIsWithdrawHistoryOpen] = useState(false);

  const [deleteUpdate] = useDeleteCampaignUpdateMutation();

  // Fetch campaign from my campaigns list
  const { data: campaignsData, isLoading: isLoadingCampaign } = useGetMyCampaignsQuery({
    page: 1,
    limit: 100,
  });

  const campaign = campaignsData?.data?.find((c) => c.id === campaignId) as CampaignDto | undefined;

  // Map filter value to API status param
  const statusParam = updateFilter === 'all' ? undefined : updateFilter;

  const { data: updatesData, isLoading: isLoadingUpdates } = useGetCampaignUpdatesQuery({
    campaignId,
    page: 1,
    limit: 20,
    status: statusParam,
  });

  const updates: CampaignUpdateResponseDto[] = updatesData?.data ?? [];
  const { data: withdrawRequests = [] } = useGetCampaignWithdrawalsQuery(campaignId, { skip: !campaignId });

  const handleDeleteUpdate = async (updateId: string) => {
    try {
      await deleteUpdate({
        campaignId,
        updateId,
      }).unwrap();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete update:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setUpdateToEdit(null);
    setIsUpdateModalOpen(true);
  };

  const handleOpenEditModal = (update: CampaignUpdateResponseDto) => {
    setUpdateToEdit(update);
    setIsUpdateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpdateModalOpen(false);
    setUpdateToEdit(null);
  };

  const handleViewDetail = (update: CampaignUpdateResponseDto) => {
    setSelectedUpdateForView(update);
    setIsViewDetailOpen(true);
  };

  const completedWithdrawCount = withdrawRequests.filter((item) => item.status === WithdrawStatus.COMPLETED).length;
  const hasPendingWithdraw = withdrawRequests.some((item) => item.status === WithdrawStatus.PENDING);
  const totalCompletedWithdrawAmount = withdrawRequests
    .filter((item) => item.status === WithdrawStatus.COMPLETED)
    .reduce((sum, item) => {
      const amount = typeof item.amount === 'number' ? item.amount : Number(item.amount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  const availableToWithdraw = Math.max(0, (campaign?.raisedAmount ?? 0) - totalCompletedWithdrawAmount);
  const hasValidGoalAmount = Boolean(campaign && campaign.goalAmount > 0);
  const resolvedProgressPercent = campaign
    ? (campaign.progressPercent ?? (campaign.goalAmount > 0 ? (campaign.raisedAmount / campaign.goalAmount) * 100 : 0))
    : 0;
  const progressBarPercent = Math.max(0, Math.min(resolvedProgressPercent, 100));
  const metProgressThreshold = resolvedProgressPercent >= 50;
  const canWithdrawByStatus = campaign
    ? [CampaignStatus.ACTIVE, CampaignStatus.COMPLETED].includes(campaign.status)
    : false;
  const maxAllowedWithdrawAttempts = 3;
  const remainingWithdrawAttempts = Math.max(0, maxAllowedWithdrawAttempts - completedWithdrawCount);
  const reachedWithdrawLimit = completedWithdrawCount >= maxAllowedWithdrawAttempts;
  const canOpenWithdrawModal =
    Boolean(campaign) &&
    canWithdrawByStatus &&
    hasValidGoalAmount &&
    metProgressThreshold &&
    !reachedWithdrawLimit &&
    !hasPendingWithdraw &&
    availableToWithdraw > 0;

  const withdrawBlockedReason = !campaign
    ? 'Không thể xác định chiến dịch.'
    : !canWithdrawByStatus
      ? 'Chỉ có thể yêu cầu rút tiền từ chiến dịch đang hoạt động hoặc đã hoàn thành.'
      : !hasValidGoalAmount
        ? 'Mục tiêu chiến dịch không hợp lệ.'
        : !metProgressThreshold
          ? `Chiến dịch cần đạt tối thiểu 50% mục tiêu để mở rút tiền (hiện tại ${resolvedProgressPercent.toFixed(1)}%).`
          : reachedWithdrawLimit
            ? 'Đã đạt giới hạn tối đa 3 yêu cầu rút tiền cho chiến dịch này.'
            : hasPendingWithdraw
              ? 'Đã có yêu cầu rút tiền đang chờ admin xử lý.'
              : availableToWithdraw <= 0
                ? 'Không còn số tiền nào để rút từ chiến dịch này.'
                : null;

  if (isLoadingCampaign) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <Bone className="h-3 w-36 mb-7" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Thumbnail */}
              <Bone className="aspect-video rounded-2xl" />

              {/* Title area */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Bone className="h-5 w-24 rounded-full" />
                  <Bone className="h-5 w-20 rounded-full" />
                </div>
                <Bone className="h-8 w-full" />
                <Bone className="h-8 w-3/4" />
              </div>

              {/* Story */}
              <Bone className="h-52 rounded-2xl" />

              {/* Updates */}
              <Bone className="h-48 rounded-2xl" />
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <Bone className="h-72 rounded-2xl" />
              <Bone className="h-56 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-6 px-4">
        <div className="text-center">
          <h2 className="text-xl font-black text-black mb-2">Chiến dịch không tìm thấy</h2>
          <p className="text-sm text-black/45 mb-6 max-w-xs mx-auto">
            Chiến dịch không tồn tại hoặc bạn không có quyền truy cập.
          </p>
        </div>

        <Link
          href="/dashboard/my-campaigns"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black hover:bg-black/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }
  const images = [campaign!.thumbnailUrl, ...(campaign!.mediaUrls ?? [])].filter((u): u is string => !!u);
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <Link
          href="/dashboard/my-campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-black/40 hover:text-black/70 transition-colors mb-7 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Chiến dịch của tôi
        </Link>

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <CampaignImageSlider images={images} />
            <MyCampaignHeader campaign={campaign} setIsCampaignEditOpen={setIsCampaignEditOpen} />
            {/* 3. Story Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-black/10 rounded-2xl p-8 hover:border-black/20 transition-colors"
            >
              <h3 className="text-lg font-semibold text-black mb-4">Câu chuyện</h3>
              <RichTextContent content={campaign.story} />
              {campaign.mediaUrls && campaign.mediaUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {campaign.mediaUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`media-${i}`}
                      className="w-full h-48 object-cover rounded-xl shadow-sm border border-black/5"
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* 4. Campaign Updates */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-black/10 rounded-2xl p-8 hover:border-black/20 transition-colors"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Cập nhật tiến độ
                </h3>
                <Button onClick={handleOpenCreateModal} size="sm" className="bg-black hover:bg-black/90">
                  <Send className="w-3.5 h-3.5" />
                  Thêm cập nhật
                </Button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 mb-6 border-b">
                {[
                  { value: 'all' as const, label: 'Tất cả' },
                  { value: 'published' as const, label: 'Đã công bố' },
                  { value: 'draft' as const, label: 'Dự thảo' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setUpdateFilter(tab.value)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${
                      updateFilter === tab.value
                        ? 'border-black text-black'
                        : 'border-transparent text-black/50 hover:text-black/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Updates List Component */}
              <UpdatesList
                updates={updates}
                isLoading={isLoadingUpdates}
                updateFilter={updateFilter}
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteUpdate}
                onViewDetail={handleViewDetail}
              />
            </motion.div>
          </div>

          {/* ── Right column (sticky sidebar) ─────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border border-black/10 rounded-2xl p-4 space-y-3.5 hover:border-black/20 transition-colors"
            >
              <h3 className="font-semibold text-black text-base">Thông tin chiến dịch</h3>

              {/* Key Stats Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                {/* Mục tiêu */}
                <motion.div
                  whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(244, 63, 94, 0.15)' }}
                  className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-3 border border-rose-200/50 hover:border-rose-300/75 transition-all duration-300 cursor-default"
                >
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-rose-300/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-rose-700 tracking-wide">MỤC TIÊU</p>
                      <Target className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="font-black text-sm text-rose-700">{formatVND(campaign.goalAmount)}</p>
                  </div>
                </motion.div>

                {/* Đã quyên góp */}
                <motion.div
                  whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(34, 197, 94, 0.15)' }}
                  className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-200/50 hover:border-emerald-300/75 transition-all duration-300 cursor-default"
                >
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-emerald-300/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-emerald-700 tracking-wide">QUYÊN GÓP</p>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="font-black text-sm text-emerald-700">{formatVND(campaign.raisedAmount)}</p>
                  </div>
                </motion.div>

                {/* Nhà hảo tâm */}
                <motion.div
                  whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(59, 130, 246, 0.15)' }}
                  className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-200/50 hover:border-blue-300/75 transition-all duration-300 cursor-default"
                >
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-blue-300/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-blue-700 tracking-wide">NHÀ HẢO TÂM</p>
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="font-black text-sm text-blue-700">{campaign.donorCount || 0} người</p>
                  </div>
                </motion.div>

                {/* Tiến độ */}
                <motion.div
                  whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(168, 85, 247, 0.15)' }}
                  className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-3 border border-violet-200/50 hover:border-violet-300/75 transition-all duration-300 cursor-default"
                >
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-violet-300/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-violet-700 tracking-wide">TIẾN ĐỘ</p>
                      <Zap className="w-4 h-4 text-violet-500" />
                    </div>
                    <p className="font-black text-base text-violet-700">{resolvedProgressPercent.toFixed(0)}%</p>
                  </div>
                </motion.div>
              </div>

              {/* Còn cần quyên góp */}
              {campaign.raisedAmount < campaign.goalAmount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200/50 hover:border-amber-300/75 transition-all duration-300"
                >
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-amber-300/10 rounded-full blur-2xl" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-700 tracking-wide mb-1">CÒN CẦN QUYÊN GÓP</p>
                      <p className="font-black text-sm text-amber-700">
                        {formatVND(campaign.goalAmount - campaign.raisedAmount)}
                      </p>
                    </div>
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  </div>
                </motion.div>
              )}

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="pt-2 border-t border-black/10 space-y-2"
              >
                <Link href={`/dashboard/my-campaigns/${campaign.id}/analytics`} className="block">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs hover:bg-black/5 active:scale-95">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Xem thống kê
                    </Button>
                  </motion.div>
                </Link>

                <motion.div
                  whileHover={{ scale: canOpenWithdrawModal ? 1.02 : 1 }}
                  whileTap={{ scale: canOpenWithdrawModal ? 0.98 : 1 }}
                >
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    disabled={!canOpenWithdrawModal}
                    title={
                      !canOpenWithdrawModal
                        ? (withdrawBlockedReason ?? 'Chưa thể rút tiền ở thời điểm này.')
                        : undefined
                    }
                    onClick={() => setIsWithdrawModalOpen(true)}
                  >
                    Rút tiền ({remainingWithdrawAttempts}/{maxAllowedWithdrawAttempts} lượt)
                  </Button>
                </motion.div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={() => setIsWithdrawHistoryOpen(true)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem lịch sử rút tiền
                </Button>

                {withdrawBlockedReason && !canOpenWithdrawModal && (
                  <p className="text-[11px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 font-medium">
                    {withdrawBlockedReason}
                  </p>
                )}
              </motion.div>

              {/* Progress Bar with animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-3 border border-rose-200/50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold tracking-widest text-rose-700">TIẾN ĐỘ QUYÊN GÓP</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-600">{resolvedProgressPercent.toFixed(1)}%</span>
                    {progressBarPercent >= 100 && (
                      <span className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-bold">
                        ✓ Hoàn thành
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-rose-200/30 relative">
                  <motion.div
                    key={progressBarPercent}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressBarPercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 shadow-lg relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </motion.div>
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[11px] text-black/50">
                  <span>{formatVND(campaign.raisedAmount)}</span>
                  <span>{formatVND(campaign.goalAmount)}</span>
                </div>
              </motion.div>

              {/* Dates */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="space-y-1.5 text-sm border-t border-black/10 pt-2"
              >
                <div className="flex items-center gap-3 text-black/60 hover:text-black/80 transition-colors group cursor-default">
                  <Calendar className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span className="truncate text-xs">
                    Hạn: <span className="font-semibold text-black">{formatDate(campaign.deadline)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-black/60 hover:text-black/80 transition-colors group cursor-default">
                  <Calendar className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span className="truncate text-xs">
                    Tạo: <span className="font-semibold text-black">{formatDate(campaign.createdAt)}</span>
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <UpdateEditModal
        campaignId={campaignId}
        isOpen={isUpdateModalOpen}
        onClose={handleCloseModal}
        updateToEdit={updateToEdit}
      />

      {/* Campaign Edit Modal */}
      <CampaignEditModal campaign={campaign} isOpen={isCampaignEditOpen} onClose={() => setIsCampaignEditOpen(false)} />

      {/* Update Detail Modal */}
      <UpdateDetailModal
        isOpen={isViewDetailOpen}
        update={selectedUpdateForView}
        onClose={() => {
          setIsViewDetailOpen(false);
          setSelectedUpdateForView(null);
        }}
        formatDate={formatDate}
      />

      {campaign && (
        <WithdrawRequestModal
          open={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          campaign={campaign}
        />
      )}

      <Dialog open={isWithdrawHistoryOpen} onOpenChange={setIsWithdrawHistoryOpen}>
        <DialogContent className="max-w-2xl" overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Lịch sử yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Giúp bạn theo dõi trạng thái từng yêu cầu và lý do đang bị khóa rút tiền (nếu có).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {withdrawBlockedReason && (
              <p className="text-[11px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 font-medium">
                Lý do hiện tại chưa thể rút: {withdrawBlockedReason}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg border border-black/10 bg-black/[0.02] px-2.5 py-2">
                <p className="text-black/50">Đã hoàn thành</p>
                <p className="text-sm font-bold text-black">{completedWithdrawCount}</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-black/[0.02] px-2.5 py-2">
                <p className="text-black/50">Đang chờ xử lý</p>
                <p className="text-sm font-bold text-black">{hasPendingWithdraw ? 1 : 0}</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-black/[0.02] px-2.5 py-2">
                <p className="text-black/50">Còn có thể rút</p>
                <p className="text-sm font-bold text-black">{formatVND(availableToWithdraw)}</p>
              </div>
            </div>

            {withdrawRequests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/20 bg-black/[0.02] px-3 py-6 text-center">
                <p className="text-sm font-medium text-black/70">Chưa có yêu cầu rút tiền nào</p>
                <p className="text-xs text-black/45 mt-1">Bạn có thể tạo yêu cầu khi đáp ứng đủ điều kiện.</p>
              </div>
            ) : (
              withdrawRequests.map((request) => {
                const amount = typeof request.amount === 'number' ? request.amount : Number(request.amount);
                const safeAmount = Number.isFinite(amount) ? amount : 0;
                const statusClassName =
                  request.status === WithdrawStatus.COMPLETED
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : request.status === WithdrawStatus.PENDING
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : request.status === WithdrawStatus.REJECTED
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200';
                const statusText =
                  request.status === WithdrawStatus.COMPLETED
                    ? 'Hoàn thành'
                    : request.status === WithdrawStatus.PENDING
                      ? 'Đang chờ'
                      : request.status === WithdrawStatus.REJECTED
                        ? 'Bị từ chối'
                        : 'Đã duyệt';

                return (
                  <div key={request.id} className="rounded-lg border border-black/10 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-black">{formatVND(safeAmount)}</p>
                        <p className="text-[11px] text-black/50">Yêu cầu lúc {formatDate(request.createdAt)}</p>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold ${statusClassName}`}>
                        {statusText}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-black/65">
                      <p>Ngân hàng: {request.bankInfo.bankName}</p>
                      <p>STK: {request.bankInfo.accountNumber}</p>
                      <p>Chủ TK: {request.bankInfo.accountHolderName}</p>
                      <p>Xử lý lúc: {request.processedAt ? formatDate(request.processedAt) : 'Chưa xử lý'}</p>
                    </div>

                    {request.rejectReason && (
                      <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1.5">
                        Lý do từ chối: {request.rejectReason}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
