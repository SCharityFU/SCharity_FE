import { AlertTriangle, CheckCircle2, Landmark, Send } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CampaignCategory } from "@/dtos/enums";
import type { VietQRBank } from "@/hooks/useVietQRBanks";

interface SubmitConfirmDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  onSubmit: () => void;
  title: string;
  goalAmount: number;
  deadline: string;
  category: CampaignCategory | "";
  categoryLabels: Record<CampaignCategory, string>;
  selectedBank: VietQRBank | null;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  formatDateVN: (value: string) => string;
  formatVND: (value: number) => string;
}

export function SubmitConfirmDialog({
  open,
  setOpen,
  isLoading,
  onSubmit,
  title,
  goalAmount,
  deadline,
  category,
  categoryLabels,
  selectedBank,
  bankName,
  accountNumber,
  accountHolderName,
  formatDateVN,
  formatVND,
}: SubmitConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isLoading) return;
        setOpen(nextOpen);
      }}
    >
      <AlertDialogContent size="default" className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-rose-100">
            <Send className="w-6 h-6 text-rose-500" />
          </AlertDialogMedia>
          <AlertDialogTitle>Xác nhận gửi duyệt</AlertDialogTitle>
          <AlertDialogDescription>Bạn có chắc chắn muốn gửi chiến dịch này để duyệt?</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-start">
            <span className="text-black/50">Tiêu đề:</span>
            <span className="font-semibold text-right max-w-[60%]">{title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/50">Mục tiêu:</span>
            <span className="font-semibold text-rose-600">{formatVND(goalAmount)}₫</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/50">Hạn chót:</span>
            <span className="font-semibold">{formatDateVN(deadline)}</span>
          </div>
          {category && (
            <div className="flex justify-between">
              <span className="text-black/50">Danh mục:</span>
              <span className="font-semibold">{categoryLabels[category]}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5" />
            Thông tin ngân hàng nhận tiền
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              {selectedBank?.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedBank.logo}
                  alt={bankName}
                  className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-black/5 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-black/80 truncate">{bankName || "Chưa chọn"}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/50 text-xs">Số tài khoản:</span>
              <span className="font-mono font-semibold tracking-wider text-black/80">{accountNumber || "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/50 text-xs">Chủ tài khoản:</span>
              <span className="font-semibold uppercase text-black/80">{accountHolderName || "-"}</span>
            </div>
          </div>
          <p className="text-[10px] text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Vui lòng kiểm tra kỹ thông tin trước khi gửi
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Quay lại</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} variant="default" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang gửi...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận gửi
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
