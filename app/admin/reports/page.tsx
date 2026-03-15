'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/store/hooks';
import { ReportStatus, UserRole } from '@/dtos';
import { useGetAdminReportsQuery, useResolveReportMutation } from '@/lib/store/features/admin/adminApi';
import type { AdminReportResponseDto } from '@/dtos/admin';
import { ReportsFilters } from '@/components/admin/reports/ReportsFilters';
import { ReportsTable } from '@/components/admin/reports/ReportsTable';
import { ReportDetailModal } from '@/components/admin/reports/ReportDetailModal';
import { SuspendCampaignModal } from '@/components/admin/campaigns/SuspendCampaignModal';

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export default function AdminReportsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(() => parsePositiveInt(searchParams.get('page'), 1));
  const [limit, setLimit] = useState(() => Math.min(parsePositiveInt(searchParams.get('limit'), 10), 100));
  const [status, setStatus] = useState(() => searchParams.get('status') ?? 'all');

  const isAdmin = user?.role === UserRole.ADMIN;

  // Detail modal
  const [selectedReport, setSelectedReport] = useState<AdminReportResponseDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Suspend modal
  const [suspendTarget, setSuspendTarget] = useState<{
    campaignId: string;
    title: string;
  } | null>(null);

  // Resolve
  const [resolveReport, { isLoading: isResolving }] = useResolveReportMutation();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status !== 'all') params.set('status', status);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, page, limit, status]);

  const { data, isFetching, isError, error, refetch } = useGetAdminReportsQuery(
    {
      page,
      limit,
      status: status !== 'all' ? (status as ReportStatus) : undefined,
    },
    { skip: !isAdmin },
  );

  const latestRowsRef = useRef<AdminReportResponseDto[]>([]);
  if (data?.data) {
    latestRowsRef.current = data.data;
  }

  const rows = data?.data ?? latestRowsRef.current;
  const pagination = data?.pagination;
  const hasActiveFilters = status !== 'all';

  useEffect(() => {
    if (!isError) return;
    const statusCode = (error as { status?: number })?.status;
    if (statusCode === 401) {
      router.replace('/login');
    }
  }, [isError, error, router]);

  const handleResolve = async (reportId: string) => {
    setResolvingId(reportId);
    try {
      await resolveReport(reportId).unwrap();
    } catch {
      // handled by RTK Query
    } finally {
      setResolvingId(null);
    }
  };

  const handleViewDetail = (report: AdminReportResponseDto) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };

  const handleSuspendCampaign = (campaignId: string, campaignTitle: string) => {
    setDetailOpen(false);
    setSuspendTarget({ campaignId, title: campaignTitle });
  };

  if (!isAdmin) {
    return (
      <div className="p-3 md:p-4">
        <h1 className="text-base md:text-lg font-semibold text-black">Quản lý báo cáo</h1>
        <p className="mt-2 text-sm text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  const statusCode = (error as { status?: number })?.status;

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-base md:text-lg font-semibold text-black">Quản lý báo cáo</h1>
          <p className="text-xs md:text-sm text-black/50">Xem xét và xử lý các báo cáo vi phạm từ người dùng.</p>
        </div>
      </div>

      <ReportsFilters status={status} onStatusChange={setStatus} />

      {isError && statusCode !== 401 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Lỗi hệ thống khi tải danh sách báo cáo. Vui lòng thử lại.
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCw className="w-3.5 h-3.5" />
            Thử lại
          </Button>
        </div>
      )}

      <ReportsTable
        rows={rows}
        loading={isFetching && rows.length === 0}
        page={pagination?.page ?? page}
        limit={pagination?.limit ?? limit}
        totalItems={pagination?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setStatus('all');
          setPage(1);
        }}
        onViewDetail={handleViewDetail}
        onResolve={handleResolve}
        resolvingId={resolvingId}
      />

      {isFetching && rows.length > 0 && <p className="text-xs text-black/40">Đang cập nhật dữ liệu...</p>}

      {/* Report detail modal */}
      <ReportDetailModal
        report={selectedReport}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onResolve={handleResolve}
        onSuspendCampaign={handleSuspendCampaign}
        resolving={isResolving && resolvingId === selectedReport?.id}
      />

      {/* Suspend campaign modal */}
      <SuspendCampaignModal
        campaignId={suspendTarget?.campaignId ?? null}
        campaignTitle={suspendTarget?.title ?? ''}
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) setSuspendTarget(null);
        }}
      />
    </div>
  );
}
