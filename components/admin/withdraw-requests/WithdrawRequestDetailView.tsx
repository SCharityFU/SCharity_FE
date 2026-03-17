'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AdminWithdrawRequestItemDto, ProcessWithdrawRequestDto } from '@/dtos/admin';
import { WithdrawStatus } from '@/dtos';
import { useVietQRBanks } from '@/hooks/useVietQRBanks';
import {
  formatDateTimeVN,
  formatVND,
  withdrawStatusClassName,
  withdrawStatusLabel,
} from '@/components/admin/withdraw-requests/withdrawRequestsUtils';

interface WithdrawRequestDetailViewProps {
  detail: AdminWithdrawRequestItemDto;
  submitting: boolean;
  onProcess: (payload: ProcessWithdrawRequestDto) => Promise<void>;
}

export function WithdrawRequestDetailView({ detail, submitting, onProcess }: WithdrawRequestDetailViewProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [localError, setLocalError] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const { bankList } = useVietQRBanks();

  const canProcess = detail.status === WithdrawStatus.PENDING;
  const transferReference = `WR-${detail.id.slice(0, 8).toUpperCase()}`;
  const bankNameNormalized = detail.bankInfo.bankName.trim().toLowerCase();
  const matchedBank = bankList.find((bank) => {
    const shortName = bank.shortName.trim().toLowerCase();
    const name = bank.name.trim().toLowerCase();
    return (
      shortName === bankNameNormalized ||
      name === bankNameNormalized ||
      shortName.includes(bankNameNormalized) ||
      name.includes(bankNameNormalized) ||
      bankNameNormalized.includes(shortName)
    );
  });

  const qrImageUrl = matchedBank
    ? `https://img.vietqr.io/image/${matchedBank.bin}-${detail.bankInfo.accountNumber}-compact2.png?amount=${detail.amount}&addInfo=${encodeURIComponent(transferReference)}&accountName=${encodeURIComponent(detail.bankInfo.accountHolderName)}`
    : null;

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Đã sao chép ${label}`);
    } catch {
      toast.error(`Không thể sao chép ${label}`);
    }
  };

  const handleReject = async () => {
    const trimmedReason = rejectReason.trim();
    if (trimmedReason.length < 10) {
      setLocalError('Lý do từ chối phải có ít nhất 10 ký tự.');
      return;
    }

    setLocalError('');
    await onProcess({ action: 'reject', rejectReason: trimmedReason });
  };

  const handleApprove = async () => {
    try {
      await onProcess({ action: 'approve' });
    } finally {
      setApproveDialogOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <Link href="/admin/withdraw-requests" className="inline-flex text-sm text-rose-600 hover:underline">
        Quay lại danh sách
      </Link>

      {localError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{localError}</div>
      )}

      <div className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-base md:text-lg font-semibold text-black">Chi tiết yêu cầu rút tiền</h1>
          <span
            className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold ${withdrawStatusClassName(detail.status)}`}
          >
            {withdrawStatusLabel(detail.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p className="text-black/60">
            Mã request: <span className="font-semibold text-black">{detail.id}</span>
          </p>
          <p className="text-black/60">
            Mã chiến dịch: <span className="font-semibold text-black">{detail.campaignId}</span>
          </p>
          <p className="text-black/60">
            Tên chiến dịch: <span className="font-semibold text-black">{detail.campaign?.title || '-'}</span>
          </p>
          <p className="text-black/60">
            Số tiền rút: <span className="font-semibold text-black">{formatVND(detail.amount)}</span>
          </p>
          <p className="text-black/60">
            Thời gian tạo: <span className="font-semibold text-black">{formatDateTimeVN(detail.createdAt)}</span>
          </p>
          <p className="text-black/60">
            Cập nhật: <span className="font-semibold text-black">{formatDateTimeVN(detail.updatedAt)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <section className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-2">
          <h2 className="text-sm font-semibold text-black">Thông tin người yêu cầu</h2>
          <p className="text-sm text-black/60">
            ID: <span className="text-black">{detail.requesterId}</span>
          </p>
          <p className="text-sm text-black/60">
            Tên: <span className="text-black">{detail.requester?.fullName || '-'}</span>
          </p>
          <p className="text-sm text-black/60">
            Email: <span className="text-black">{detail.requester?.email || '-'}</span>
          </p>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-2">
          <h2 className="text-sm font-semibold text-black">Thông tin ngân hàng</h2>
          <p className="text-sm text-black/60">
            Ngân hàng: <span className="text-black">{detail.bankInfo.bankName}</span>
          </p>
          <p className="text-sm text-black/60">
            Số tài khoản: <span className="text-black">{detail.bankInfo.accountNumber}</span>
          </p>
          <p className="text-sm text-black/60">
            Chủ tài khoản: <span className="text-black">{detail.bankInfo.accountHolderName}</span>
          </p>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-3 md:p-4 space-y-2">
          <h2 className="text-sm font-semibold text-black">Xử lý</h2>
          <p className="text-sm text-black/60">
            Người xử lý:{' '}
            <span className="text-black">{detail.processedBy?.fullName || detail.processedById || '-'}</span>
          </p>
          <p className="text-sm text-black/60">
            Thời gian xử lý: <span className="text-black">{formatDateTimeVN(detail.processedAt)}</span>
          </p>
          <p className="text-sm text-black/60">
            Lý do từ chối: <span className="text-black">{detail.rejectReason || '-'}</span>
          </p>

          {canProcess && (
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-violet-600" />
                <p className="text-xs font-semibold text-violet-800">QR chuyển khoản tham khảo</p>
              </div>

              {qrImageUrl ? (
                <div className="bg-white rounded-md border border-violet-100 p-2 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrImageUrl} alt="QR chuyển khoản" className="w-44 h-44 object-contain" />
                </div>
              ) : (
                <p className="text-[11px] text-violet-700">
                  Không map được mã ngân hàng từ dữ liệu hiện tại, vui lòng dùng thông tin copy bên dưới để chuyển khoản
                  thủ công.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopy(detail.bankInfo.bankName, 'tên ngân hàng')}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Bank
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopy(detail.bankInfo.accountNumber, 'số tài khoản')}
                >
                  <Copy className="w-3.5 h-3.5" />
                  STK
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopy(detail.bankInfo.accountHolderName, 'chủ tài khoản')}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Chủ TK
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopy(String(detail.amount), 'số tiền')}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Số tiền
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="col-span-2"
                  onClick={() => void handleCopy(transferReference, 'nội dung chuyển khoản')}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Nội dung: {transferReference}
                </Button>
              </div>
            </div>
          )}

          <div className="border-t border-black/10 pt-3 space-y-2">
            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button className="w-full" disabled={!canProcess || submitting}>
                  Duyệt chuyển tiền
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận duyệt yêu cầu rút tiền</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sau khi xác nhận, yêu cầu sẽ được xử lý và trạng thái có thể chuyển sang hoàn tất.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={submitting}
                    onClick={(e) => {
                      e.preventDefault();
                      void handleApprove();
                    }}
                  >
                    Xác nhận duyệt
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="space-y-2">
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)"
                className="min-h-20 bg-white"
                disabled={!canProcess || submitting}
              />
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                disabled={!canProcess || submitting}
                onClick={() => {
                  void handleReject();
                }}
              >
                Từ chối yêu cầu
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
