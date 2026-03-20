'use client';

import { AlertTriangle, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import { CampaignImageSlider } from '@/components/campaign/detail/CampaignImageSlider';
import { CampaignHeader } from '@/components/campaign/detail/CampaignHeader';
import { CampaignStory } from '@/components/campaign/detail/CampaignStory';
import { CampaignMediaSection } from '@/components/campaign/detail/CampaignMediaSection';
import { CampaignUpdates } from '@/components/campaign/detail/CampaignUpdates';
import { CampaignComments } from '@/components/campaign/detail/CampaignComments';
import { CampaignSidebar } from '@/components/campaign/detail/CampaignSidebar';
import type { PublicCampaignDetailResponseDto } from '@/dtos/campaign';

interface CampaignDetailClientProps {
  campaign: PublicCampaignDetailResponseDto;
}

export function CampaignDetailClient({ campaign }: CampaignDetailClientProps) {
  // Build unified image list: thumbnailUrl first, then mediaUrls
  const images = [campaign.thumbnailUrl, ...(campaign.mediaUrls ?? [])].filter((u): u is string => !!u);

  const normalizedStatus = String(campaign.status ?? '')
    .trim()
    .toLowerCase();

  const statusBannerMap: Record<
    string,
    {
      title: string;
      message: string;
      className: string;
      icon: React.ElementType;
      linkLabel?: string;
      linkHref?: string;
    }
  > = {
    completed: {
      title: 'Chiến dịch đã hoàn tất thời gian quyên góp',
      message:
        'Chiến dịch đã kết thúc thời gian quyên góp. Ban tổ chức đang thực hiện các thủ tục xác minh và chuẩn bị giải ngân nguồn hỗ trợ.',
      className: 'border-blue-200 bg-blue-50 text-blue-800',
      icon: Info,
    },
    withdrawn: {
      title: 'Dự án đã giải ngân thành công',
      message:
        'Những yêu thương đã được trao đi! Dự án này đã kết thúc tốt đẹp và toàn bộ kinh phí đã được giải ngân thành công.',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      icon: CheckCircle2,
      // linkLabel: 'Xem lịch sử giải ngân',
      // linkHref: `/campaigns/${campaign.id}#campaign-updates`,
    },
    suspended: {
      title: 'Chiến dịch đang tạm dừng',
      message: 'Chiến dịch tạm dừng để xác minh thêm thông tin. Mong quý vị thông cảm.',
      className: 'border-amber-200 bg-amber-50 text-amber-800',
      icon: AlertTriangle,
    },
    rejected: {
      title: 'Chiến dịch chưa được phê duyệt',
      message: 'Chiến dịch chưa được phê duyệt do không đáp ứng đủ tiêu chuẩn cộng đồng.',
      className: 'border-rose-200 bg-rose-50 text-rose-800',
      icon: AlertTriangle,
    },
  };

  const statusBanner = statusBannerMap[normalizedStatus];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-black/40 hover:text-black/70 transition-colors mb-7 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Danh sách chiến dịch
        </Link>

        {statusBanner && (
          <div className={`mb-6 rounded-2xl border px-4 py-3.5 md:px-5 md:py-4 ${statusBanner.className}`}>
            <div className="flex items-start gap-3">
              <statusBanner.icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h2 className="text-sm md:text-base font-bold leading-tight">{statusBanner.title}</h2>
                <p className="mt-1 text-xs md:text-sm opacity-90 leading-relaxed">{statusBanner.message}</p>
                {statusBanner.linkHref && statusBanner.linkLabel && (
                  <Link href={statusBanner.linkHref} className="mt-2 inline-block text-xs font-semibold underline">
                    {statusBanner.linkLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Main grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* ── Left column ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Image slider */}
            <CampaignImageSlider images={images} />

            {/* 2. Title + meta (compact) */}
            <CampaignHeader campaign={campaign} />

            {/* 3. Story */}
            <CampaignStory campaign={campaign} />

            {/* 4. Related media */}
            <CampaignMediaSection mediaUrls={images} />

            {/* 5. Updates */}
            <CampaignUpdates campaign={campaign} />

            {/* 6. Comments */}
            <CampaignComments campaign={campaign} />
          </div>

          {/* ── Right column (sticky) ─────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CampaignSidebar campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
  );
}
