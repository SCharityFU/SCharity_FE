"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useUnsuspendCampaignMutation } from "@/lib/store/features/admin/adminApi";
import { toast } from "sonner";

interface UnsuspendConfirmDialogProps {
  campaignId: string | null;
  campaignTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UnsuspendConfirmDialog({
  campaignId,
  campaignTitle,
  open,
  onOpenChange,
  onSuccess,
}: UnsuspendConfirmDialogProps) {
  const [unsuspend, { isLoading }] = useUnsuspendCampaignMutation();

  const handleConfirm = async () => {
    if (!campaignId) return;
    try {
      await unsuspend(campaignId).unwrap();
      onOpenChange(false);
      toast.success("Đã gỡ tạm dừng chiến dịch thành công");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Gỡ tạm dừng chiến dịch thất bại");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Gỡ tạm dừng chiến dịch</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn gỡ tạm dừng chiến dịch{" "}
            <strong className="text-black">{campaignTitle}</strong>? Chiến dịch
            sẽ được khôi phục và người dùng có thể tiếp tục quyên góp (nếu chưa
            hết hạn).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận gỡ tạm dừng"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
