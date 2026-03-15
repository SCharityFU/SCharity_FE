import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { FeedbackMessage } from "@/components/campaign/create/types";

interface CreateCampaignFeedbackProps {
  feedbackMsg: FeedbackMessage | null;
  onClose: () => void;
}

export function CreateCampaignFeedback({ feedbackMsg, onClose }: CreateCampaignFeedbackProps) {
  return (
    <AnimatePresence>
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          {feedbackMsg.text}
          <button
            title="Đóng thông báo"
            onClick={onClose}
            className="ml-auto hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
