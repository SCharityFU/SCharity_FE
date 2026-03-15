"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSuspendCampaignMutation } from "@/lib/store/features/admin/adminApi";
import { toast } from "sonner";
import { getSafeApiErrorMessage } from "@/lib/api-error";

interface SuspendCampaignModalProps {
  campaignId: string | null;
  campaignTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SuspendCampaignModal({
  campaignId,
  campaignTitle,
  open,
  onOpenChange,
  onSuccess,
}: SuspendCampaignModalProps) {
  const [reason, setReason] = useState("");
  const [suspend, { isLoading }] = useSuspendCampaignMutation();

  const canSubmit = reason.trim().length >= 10;

  const handleSubmit = async () => {
    if (!campaignId || !canSubmit) return;
    try {
      await suspend({ campaignId, body: { reason: reason.trim() } }).unwrap();
      setReason("");
      onOpenChange(false);
      toast.success("Đã tạm dừng chiến dịch thành công");
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(getSafeApiErrorMessage(err, "Tạm dừng chiến dịch thất bại"));
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setReason("");
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạm dừng chiến dịch</DialogTitle>
          <DialogDescription>
            Chiến dịch <strong className="text-black">{campaignTitle}</strong>{" "}
            sẽ bị tạm dừng. Người dùng không thể quyên góp và các yêu cầu rút
            tiền đang chờ sẽ bị từ chối.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          <Label htmlFor="suspend-reason">
            Lý do tạm dừng <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="suspend-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do tạm dừng chiến dịch (tối thiểu 10 ký tự)..."
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-black/40">
            {reason.trim().length}/10 ký tự tối thiểu
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận tạm dừng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
