import { Metadata, ResolvingMetadata } from 'next';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CampaignDetailClient } from './CampaignDetailClient';
import type { PublicCampaignDetailResponseDto } from '@/dtos/campaign';

// Force dynamic rendering để lúc nào cũng fetch data mới
export const dynamic = 'force-dynamic';

type Props = {
  params: { id: string };
};

// ── Data Fetching ─────────────────────────────────────────────────────────────
async function getCampaign(id: string): Promise<PublicCampaignDetailResponseDto | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  try {
    const res = await fetch(`${apiUrl}/campaigns/${id}`, {
      cache: 'no-store', 
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as PublicCampaignDetailResponseDto;
  } catch (error) {
    console.error('Error fetching campaign detail:', error);
    return null;
  }
}

// ── Dynamic Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const campaign = await getCampaign(params.id);

  if (!campaign) {
    return {
      title: 'Không tìm thấy chiến dịch',
    };
  }

  const images = [...(campaign.mediaUrls ?? []), campaign.thumbnailUrl].filter(
    (u): u is string => !!u,
  );
  
  // Truncate and strip HTML from story for description
  const cleanDescription = (campaign.story || '')
    .replace(/<[^>]*>?/gm, '') // Strip HTML
    .replace(/\s+/g, ' ')      // Collapse multiple spaces/newlines
    .trim()
    .slice(0, 150);

  return {
    title: `${campaign.title} - FCam`,
    description: cleanDescription,
    openGraph: {
      title: campaign.title,
      description: cleanDescription,
      siteName: 'FCam',
      locale: 'vi_VN',
      images: images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description: cleanDescription,
      images: images,
    },
  };
}

// ── Server Component ──────────────────────────────────────────────────────────
export default async function CampaignDetailPage({ params }: Props) {
  const campaign = await getCampaign(params.id);

  // ── Error / Not Found ────────────────────────────────────────────────────────
  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-6 px-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl scale-150 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-rose-500/8 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-black text-black">Không tìm thấy chiến dịch</h2>
          <p className="text-sm text-black/45 mt-1 max-w-xs mx-auto">
            Chiến dịch không tồn tại hoặc đường dẫn không hợp lệ.
          </p>
        </div>

        <Link
          href="/campaigns"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-black/10 text-sm font-medium text-black hover:bg-black/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // ── Render Client UI ─────────────────────────────────────────────────────────
  return <CampaignDetailClient campaign={campaign} />;
}
