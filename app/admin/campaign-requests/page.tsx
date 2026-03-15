'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useAppSelector } from '@/lib/store/hooks';
import { CampaignRequestStatus, UserRole } from '@/dtos';
import { useGetAdminCampaignRequestsQuery } from '@/lib/store/features/admin/adminApi';
import { CampaignRequestsTable } from '@/components/admin/campaign-requests/CampaignRequestsTable';
import { useAnimatedToast } from '@/components/ui/animated-toast';

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseStatus(value: string | null): CampaignRequestStatus {
  if (value === CampaignRequestStatus.APPROVED) return CampaignRequestStatus.APPROVED;
  if (value === CampaignRequestStatus.REJECTED) return CampaignRequestStatus.REJECTED;
  return CampaignRequestStatus.PENDING;
}

const statusTabs: { value: CampaignRequestStatus; label: string }[] = [
  { value: CampaignRequestStatus.PENDING, label: 'Pending' },
  { value: CampaignRequestStatus.APPROVED, label: 'Approved' },
  { value: CampaignRequestStatus.REJECTED, label: 'Rejected' },
];

export default function AdminCampaignRequestsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  const router = useRouter();
  const { addToast } = useAnimatedToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastErrorKeyRef = useRef<string | null>(null);

  const [page, setPage] = useState(() => parsePositiveInt(searchParams.get('page'), 1));
  const [limit, setLimit] = useState(() => Math.min(parsePositiveInt(searchParams.get('limit'), 10), 100));
  const [status, setStatus] = useState<CampaignRequestStatus>(() => parseStatus(searchParams.get('status')));

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    params.set('status', status);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, page, limit, status]);

  const { data, isFetching, isError, error, refetch } = useGetAdminCampaignRequestsQuery(
    { page, limit, status },
    { skip: !isAdmin },
  );

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const statusCode = (error as { status?: number } | undefined)?.status;

  useEffect(() => {
    if (!isError) {
      lastErrorKeyRef.current = null;
      return;
    }

    if (statusCode === 401) {
      router.replace('/login');
      return;
    }

    if (statusCode === 403) {
      return;
    }

    const message =
      statusCode === 404
        ? 'Không tìm thấy endpoint campaign requests (404).'
        : 'Lỗi hệ thống khi tải danh sách yêu cầu. Vui lòng thử lại.';
    const errorKey = `${statusCode ?? 'unknown'}:${message}`;
    if (lastErrorKeyRef.current === errorKey) return;
    lastErrorKeyRef.current = errorKey;

    addToast({
      type: 'error',
      title: 'Lỗi tải danh sách yêu cầu',
      message,
      action: {
        label: 'Thử lại',
        onClick: () => {
          void refetch();
        },
      },
    });
  }, [isError, statusCode, router, addToast, refetch]);

  if (!isAdmin) {
    return (
      <div className="p-3 md:p-4">
        <h1 className="text-base md:text-lg font-semibold text-black">Duyệt yêu cầu tạo campaign</h1>
        <p className="mt-2 text-sm text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      <div>
        <h1 className="text-base md:text-lg font-semibold text-black">Duyệt yêu cầu tạo campaign</h1>
        <p className="text-xs md:text-sm text-black/50">Review các yêu cầu tạo chiến dịch từ người dùng.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === tab.value ? 'bg-rose-500 text-white' : 'bg-black/[0.04] text-black/65 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isError && statusCode === 403 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Bạn không có quyền duyệt yêu cầu tạo campaign.
        </div>
      )}

      <CampaignRequestsTable
        rows={rows}
        loading={isFetching}
        page={pagination?.page ?? page}
        limit={pagination?.limit ?? limit}
        totalItems={pagination?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        onViewDetail={(id) => {
          router.push(`/admin/campaign-requests/${id}`);
        }}
      />
    </div>
  );
}
