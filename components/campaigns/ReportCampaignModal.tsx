'use client';

import { useState, useRef } from 'react';
import { Flag, Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { ReportReason } from '@/dtos/enums';
import { useReportCampaignMutation } from '@/lib/store/features/report/reportApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getSafeApiErrorMessage } from '@/lib/api-error';

const REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.FALSE_INFORMATION]: 'Thông tin sai sự thật',
  [ReportReason.FAKE_IMAGE]: 'Hình ảnh giả mạo',
  [ReportReason.NO_UPDATE]: 'Creator không cập nhật tiến độ',
  [ReportReason.FRAUD]: 'Lừa đảo',
  [ReportReason.OTHER]: 'Khác',
};

const REPORT_OVERLAY_CLASS = 'bg-black/50 supports-backdrop-filter:backdrop-blur-sm';

function getReportErrorMessage(error: unknown): string {
  const apiError = error as { data?: { code?: string; message?: string } } | undefined;

  if (apiError?.data?.code === 'CONFLICT') {
    return apiError.data.message || 'Bạn đã báo cáo chiến dịch này rồi.';
  }

  return getSafeApiErrorMessage(error, 'Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại.');
}

interface ReportCampaignModalProps {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReportCampaignModal({ campaignId, open, onOpenChange }: ReportCampaignModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reportCampaign, { isLoading }] = useReportCampaignMutation();

  const resetForm = () => {
    setReason('');
    setDescription('');
    setFiles([]);
    setSubmitError(null);
    setIsSubmitting(false);
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
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await reportCampaign({
        campaignId,
        reason: reason as ReportReason,
        description: description || undefined,
        files: files.length > 0 ? files : undefined,
      }).unwrap();
      handleOpenChange(false);
    } catch (error: unknown) {
      setSubmitError(getReportErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = reason !== '';

  return (
    <>
      <Dialog open={open && !isSubmitting} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px]" showCloseButton={false} overlayClassName={REPORT_OVERLAY_CLASS}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Báo cáo chiến dịch
            </DialogTitle>
            <DialogDescription>Vui lòng chọn lý do và cung cấp thông tin chi tiết để Admin xem xét.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="report-reason">
                Lý do báo cáo <span className="text-red-500">*</span>
              </Label>
              <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
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
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
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
            {submitError && <p className="text-sm text-red-500">{submitError}</p>}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Hủy
              </Button>
              <Button variant="destructive" disabled={!isValid || isLoading || isSubmitting} onClick={handleSubmit}>
                Gửi báo cáo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open && isSubmitting} onOpenChange={() => undefined}>
        <DialogContent className="sm:max-w-[420px]" showCloseButton={false} overlayClassName={REPORT_OVERLAY_CLASS}>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <h3 className="text-base font-semibold text-black">Đang gửi báo cáo...</h3>
            <p className="text-sm text-black/55">Vui lòng chờ trong giây lát.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
