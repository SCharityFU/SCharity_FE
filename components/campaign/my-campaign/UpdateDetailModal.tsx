'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichTextContent } from '@/components/ui/rich-text-content';
import type { CampaignUpdateResponseDto } from '@/dtos/campaign';
import { UpdateCategory } from '@/dtos/enums';

const UPDATE_CATEGORY_LABEL: Record<UpdateCategory, string> = {
  [UpdateCategory.PROGRESS]: 'Tiến độ',
  [UpdateCategory.FINANCIAL]: 'Tài chính',
  [UpdateCategory.THANK_YOU]: 'Tri ân',
  [UpdateCategory.OTHER]: 'Khác',
  [UpdateCategory.AFTER_CAMPAIGN]: 'Sau chiến dịch',
  [UpdateCategory.COMPLETION]: 'Hoàn thành',
};

const UPDATE_CATEGORY_STYLE: Record<UpdateCategory, string> = {
  [UpdateCategory.PROGRESS]: 'bg-blue-500/15 text-blue-700 border-blue-500/25',
  [UpdateCategory.FINANCIAL]: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25',
  [UpdateCategory.THANK_YOU]: 'bg-rose-500/15 text-rose-700 border-rose-500/25',
  [UpdateCategory.OTHER]: 'bg-black/5 text-black/60 border-black/15',
  [UpdateCategory.AFTER_CAMPAIGN]: 'bg-amber-500/15 text-amber-700 border-amber-500/25',
  [UpdateCategory.COMPLETION]: 'bg-violet-500/15 text-violet-700 border-violet-500/25',
};

function normalizeUpdateCategory(category: unknown): UpdateCategory {
  if (typeof category === 'string' && Object.values(UpdateCategory).includes(category as UpdateCategory)) {
    return category as UpdateCategory;
  }
  return UpdateCategory.PROGRESS;
}

interface UpdateDetailModalProps {
  isOpen: boolean;
  update: CampaignUpdateResponseDto | null;
  onClose: () => void;
  formatDate: (date: string) => string;
}

export function UpdateDetailModal({ isOpen, update, onClose, formatDate }: UpdateDetailModalProps) {
  if (!update) return null;

  const category = normalizeUpdateCategory(update.category);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-4 top-24 z-50 bg-white rounded-2xl shadow-2xl border border-black/10 flex flex-col"
            style={{ width: 'calc(40% - 1rem)', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-black/10 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-black mb-1 truncate">{update.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${UPDATE_CATEGORY_STYLE[category]}`}
                  >
                    {UPDATE_CATEGORY_LABEL[category]}
                  </span>
                  <p className="text-xs text-black/50">{formatDate(update.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng modal"
                className="p-2 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-black/50" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <RichTextContent content={update.content} className="text-sm md:text-base" />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-3 border-t border-black/10 flex-shrink-0 bg-black/2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors text-black font-medium text-sm"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
