'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimatedToast } from '@/components/ui/animated-toast';
import { useAppSelector } from '@/lib/store/hooks';
import { UserRole } from '@/dtos';
import {
  useGetAdminCampaignRequestDetailQuery,
  useReviewAdminCampaignRequestMutation,
} from '@/lib/store/features/admin/adminApi';
import type { ReviewCampaignRequestDto } from '@/dtos/admin';
import { CampaignRequestDetailView } from '@/components/admin/campaign-requests/CampaignRequestDetailView';

export default function AdminCampaignRequestDetailPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;

  const router = useRouter();
  const params = useParams<{ id: string }>();
  const requestId = params.id;
  const { addToast } = useAnimatedToast();
  const loadErrorToastRef = useRef<string | null>(null);

  const { data, isFetching, isError, error, refetch } = useGetAdminCampaignRequestDetailQuery(requestId, {
    skip: !isAdmin,
  });

  const [reviewRequest, { isLoading: isSubmitting }] = useReviewAdminCampaignRequestMutation();

  const statusCode = (error as { status?: number } | undefined)?.status;

  useEffect(() => {
    if (!isError) {
      loadErrorToastRef.current = null;
      return;
    }

    if (statusCode === 401) {
      router.replace('/login');
      return;
    }

    if (statusCode === 403 || statusCode === 404) {
      return;
    }

    const message = 'Không thể tải chi tiết yêu cầu.';
    if (loadErrorToastRef.current === message) return;
    loadErrorToastRef.current = message;

    addToast({
      type: 'error',
      title: 'Lỗi tải dữ liệu',
      message,
      action: {
        label: 'Thử lại',
        onClick: () => {
          void refetch();
        },
      },
    });
  }, [isError, statusCode, router, addToast, refetch]);

  const handleReview = async (payload: ReviewCampaignRequestDto) => {
    try {
      await reviewRequest({ requestId, payload }).unwrap();
      addToast({
        type: 'success',
        title: 'Thành công',
        message: payload.action === 'approve' ? 'Đã duyệt yêu cầu tạo campaign.' : 'Đã từ chối yêu cầu tạo campaign.',
      });
      await refetch();
    } catch (err) {
      const requestError = err as {
        status?: number;
        data?: { message?: string; errors?: Array<{ field?: string; message?: string }> };
      };
      const errorStatus = requestError?.status;

      if (errorStatus === 409) {
        addToast({
          type: 'warning',
          title: 'Xung đột trạng thái',
          message: 'Request đã được xử lý bởi admin khác. Đang tải dữ liệu mới nhất...',
        });
        await refetch();
        return;
      }

      if (errorStatus === 400 && requestError.data?.errors?.length) {
        const first = requestError.data.errors[0];
        addToast({
          type: 'error',
          title: 'Dữ liệu chưa hợp lệ',
          message: first?.message || 'Dữ liệu gửi lên chưa hợp lệ.',
        });
        return;
      }

      addToast({
        type: 'error',
        title: 'Xử lý thất bại',
        message: requestError.data?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-3 md:p-4">
        <h1 className="text-base md:text-lg font-semibold text-black">Chi tiết yêu cầu tạo campaign</h1>
        <p className="mt-2 text-sm text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  if (isError && statusCode === 404) {
    return (
      <div className="rounded-lg border border-black/10 bg-white p-4 space-y-2">
        <p className="text-base font-semibold text-black">Request not found</p>
        <p className="text-sm text-black/55">Yêu cầu tạo campaign không tồn tại hoặc đã bị xóa.</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/campaign-requests')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  if (isError && statusCode === 403) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
        Bạn không có quyền truy cập yêu cầu này.
      </div>
    );
  }

  const detail = data?.data;

  return (
    <div className="space-y-3 p-1">
      {isError && statusCode !== 401 && statusCode !== 403 && statusCode !== 404 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCw className="w-3.5 h-3.5" />
            Thử lại
          </Button>
        </div>
      )}

      {isFetching && !detail && (
        <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black/60">
          Đang tải chi tiết yêu cầu...
        </div>
      )}

      {detail && <CampaignRequestDetailView detail={detail} submitting={isSubmitting} onReview={handleReview} />}
    </div>
  );
}
