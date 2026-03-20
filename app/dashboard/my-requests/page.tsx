'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CampaignRequestResponseDto } from '@/dtos/campaign';
import { useGetMyRequestsQuery } from '@/lib/store/features/campaign/campaignApi';
import { MyRequestsHeader } from '@/components/dashboard/my-requests/MyRequestsHeader';
import { MyRequestsEmptyState, MyRequestsLoadingGrid } from '@/components/dashboard/my-requests/MyRequestsStates';
import { MyRequestsGrid } from '@/components/dashboard/my-requests/MyRequestsGrid';
import { RequestDetailModal } from '@/components/dashboard/my-requests/RequestDetailModal';

/* ═══════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function MyRequestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching } = useGetMyRequestsQuery({ page, limit });

  const requests = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  /* Detail modal */
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<CampaignRequestResponseDto | null>(null);

  /* Bank modal */
  const openDetail = (req: CampaignRequestResponseDto) => {
    setSelectedReq(req);
    setDetailOpen(true);
  };

  /* Which request is "active" (has a modal open) — for border highlight */
  const activeReqId = detailOpen ? (selectedReq?.id ?? null) : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <MyRequestsHeader onBackToDashboard={() => router.push('/dashboard')} />

        {/* Loading skeleton */}
        {isLoading && <MyRequestsLoadingGrid />}

        {/* Empty */}
        {!isLoading && requests.length === 0 && <MyRequestsEmptyState />}

        {/* Request Cards — Portrait Grid */}
        {!isLoading && requests.length > 0 && (
          <MyRequestsGrid
            requests={requests}
            activeReqId={activeReqId}
            page={page}
            totalPages={totalPages}
            isFetching={isFetching}
            onOpenDetail={openDetail}
            onPageChange={setPage}
          />
        )}
      </div>

      <RequestDetailModal open={detailOpen} onOpenChange={setDetailOpen} request={selectedReq} />
    </div>
  );
}
