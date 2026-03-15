import { ArrowLeft, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateCampaignActionsProps {
  isValid: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onOpenConfirm: () => void;
}

export function CreateCampaignActions({
  isValid,
  isSubmitting,
  onCancel,
  onSaveDraft,
  onOpenConfirm,
}: CreateCampaignActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 pt-6 border-t border-black/5">
      <Button variant="destructive" onClick={onCancel} className="order-3 sm:order-1" disabled={isSubmitting}>
        <ArrowLeft className="w-4 h-4" />
        Hủy
      </Button>

      <div className="flex-1" />

      <Button variant="outline" onClick={onSaveDraft} className="order-2" disabled={isSubmitting}>
        <Save className="w-4 h-4" />
        Lưu Nháp
      </Button>

      <Button
        onClick={onOpenConfirm}
        disabled={!isValid || isSubmitting}
        variant={"default"}
        className={!isValid || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? "Đang gửi..." : "Gửi Duyệt"}
      </Button>
    </div>
  );
}
