'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LegacyBankInfoPage() {
  const params = useParams<{ id: string }>();
  const requestId = params.id;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/dashboard/my-requests"
          className="inline-flex items-center gap-1 text-sm text-black/50 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại yêu cầu của tôi
        </Link>

        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Tính năng đang được nâng cấp</p>
              <p className="text-sm text-amber-800 mt-1">
                Luồng cập nhật ngân hàng theo yêu cầu chiến dịch đã được thay đổi. Trang này chỉ còn để tương thích
                đường dẫn cũ và không thực hiện cập nhật qua endpoint cũ nữa.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white/70 p-3 text-sm text-amber-900">
            <p>
              Mã yêu cầu: <span className="font-semibold">{requestId}</span>
            </p>
            <p className="mt-1">
              Nếu cần cập nhật thông tin ngân hàng, vui lòng chỉnh sửa trực tiếp trong thông tin chiến dịch trước khi
              gửi yêu cầu mới.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/dashboard/my-requests" className="flex-1">
              <Button className="w-full">Về danh sách yêu cầu</Button>
            </Link>
            <Link href="/dashboard/my-campaigns" className="flex-1">
              <Button variant="outline" className="w-full">
                Quản lý chiến dịch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
