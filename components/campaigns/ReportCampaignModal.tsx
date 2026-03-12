"use client";

import { useState, useRef } from "react";
import { Flag, Upload, X, ImageIcon } from "lucide-react";
import { ReportReason } from "@/dtos/enums";
import { useReportCampaignMutation } from "@/lib/store/features/report/reportApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.FALSE_INFORMATION]: "Thông tin sai sự thật",
  [ReportReason.FAKE_IMAGE]: "Hình ảnh giả mạo",
  [ReportReason.NO_UPDATE]: "Creator không cập nhật tiến độ",
  [ReportReason.FRAUD]: "Lừa đảo",
  [ReportReason.OTHER]: "Khác",
};

interface ReportCampaignModalProps {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReportCampaignModal({
  campaignId,
  open,
  onOpenChange,
}: ReportCampaignModalProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reportCampaign, { isLoading }] = useReportCampaignMutation();

  const resetForm = () => {
    setReason("");
    setDescription("");
    setFiles([]);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitClick = () => {
    setSubmitError(null);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    try {
      await reportCampaign({
        campaignId,
        reason: reason as ReportReason,
        description: description || undefined,
        files: files.length > 0 ? files : undefined,
      }).unwrap();
      setSubmitSuccess(true);
    } catch {
      setSubmitError("Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại.");
    }
  };

  const isValid = reason !== "";

  if (submitSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[440px]" showCloseButton={false}>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Flag className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-black">
              Báo cáo đã được gửi
            </h3>
            <p className="text-sm text-black/60">
              Cảm ơn bạn đã gửi báo cáo. Admin sẽ xem xét trong vòng 24h.
            </p>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Báo cáo chiến dịch
            </DialogTitle>
            <DialogDescription>
              Vui lòng chọn lý do và cung cấp thông tin chi tiết để Admin xem
              xét.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="report-reason">
                Lý do báo cáo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as ReportReason)}
              >
                <SelectTrigger id="report-reason" className="w-full">
                  <SelectValue placeholder="Chọn lý do báo cáo" />
                </SelectTrigger>
                <SelectContent className="w-(--radix-select-trigger-width) bg-white shadow-lg border border-black/10">
                  {Object.entries(REASON_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="report-description">Nội dung chi tiết</Label>
              <Textarea
                id="report-description"
                placeholder="Mô tả bằng chứng hoặc nghi vấn của bạn..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Evidence upload */}
            <div className="space-y-2">
              <Label>Đính kèm bằng chứng (không bắt buộc)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-black/20 text-sm text-black/60 hover:border-black/40 hover:text-black/80 transition-colors w-full justify-center"
              >
                <Upload className="w-4 h-4" />
                Tải lên hình ảnh
              </button>

              {/* File previews */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative group w-16 h-16 rounded-lg border border-black/10 overflow-hidden bg-gray-50"
                    >
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-black/30" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                disabled={!isValid || isLoading}
                onClick={handleSubmitClick}
              >
                Gửi báo cáo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn gửi báo cáo này? Admin sẽ xem xét trong
              vòng 24h.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
