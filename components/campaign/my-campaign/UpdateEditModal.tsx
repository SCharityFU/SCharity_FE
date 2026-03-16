'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Send, Eye, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RichTextContent } from '@/components/ui/rich-text-content';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CampaignUpdateResponseDto } from '@/dtos/campaign';
import { UpdateCategory } from '@/dtos/enums';
import {
  useCreateCampaignUpdateMutation,
  useUpdateCampaignUpdateMutation,
} from '@/lib/store/features/campaign/campaignApi';

interface UpdateEditModalProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
  updateToEdit?: CampaignUpdateResponseDto | null;
}

type ValidationField = 'title' | 'content' | 'category';

interface ApiValidationErrorItem {
  field?: string;
  message?: string;
}

const UPDATE_CATEGORY_VALUES = new Set(Object.values(UpdateCategory));
const UPDATE_CATEGORY_LABEL: Record<UpdateCategory, string> = {
  [UpdateCategory.PROGRESS]: 'Tiến độ',
  [UpdateCategory.FINANCIAL]: 'Tài chính',
  [UpdateCategory.THANK_YOU]: 'Tri ân',
  [UpdateCategory.OTHER]: 'Khác',
  [UpdateCategory.AFTER_CAMPAIGN]: 'Sau chiến dịch',
  [UpdateCategory.COMPLETION]: 'Hoàn thành',
};

function isValidUpdateCategory(value: unknown): value is UpdateCategory {
  return typeof value === 'string' && UPDATE_CATEGORY_VALUES.has(value as UpdateCategory);
}

function normalizeUpdateCategory(value: unknown): UpdateCategory {
  return isValidUpdateCategory(value) ? value : UpdateCategory.PROGRESS;
}

function getContentTextLength(html: string): number {
  if (!html) return 0;
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '').trim().length;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return (doc.body.textContent || '').trim().length;
}

function extractApiError(err: unknown): { message: string; fieldErrors: Partial<Record<ValidationField, string>> } {
  const defaultMessage = 'Không thể lưu cập nhật. Vui lòng thử lại.';
  const payload = (err as { data?: { message?: string; errors?: ApiValidationErrorItem[] } })?.data;
  const fieldErrors: Partial<Record<ValidationField, string>> = {};

  if (Array.isArray(payload?.errors)) {
    payload.errors.forEach((item) => {
      if (!item?.field || !item?.message) return;
      if (item.field === 'title' || item.field === 'content' || item.field === 'category') {
        fieldErrors[item.field] = item.message;
      }
    });
  }

  const firstFieldMessage = Object.values(fieldErrors)[0];
  const message = firstFieldMessage || payload?.message || (err as Error)?.message || defaultMessage;

  return {
    message,
    fieldErrors,
  };
}

export function UpdateEditModal({ campaignId, isOpen, onClose, updateToEdit }: UpdateEditModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<UpdateCategory>(UpdateCategory.PROGRESS);
  const [isDraft, setIsDraft] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ValidationField, string>>>({});
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const CATEGORY_OPTIONS: Array<{ value: UpdateCategory; label: string }> = [
    { value: UpdateCategory.PROGRESS, label: 'Tiến độ' },
    { value: UpdateCategory.FINANCIAL, label: 'Tài chính' },
    { value: UpdateCategory.THANK_YOU, label: 'Tri ân' },
    { value: UpdateCategory.AFTER_CAMPAIGN, label: 'Sau chiến dịch' },
    { value: UpdateCategory.COMPLETION, label: 'Hoàn thành' },
    { value: UpdateCategory.OTHER, label: 'Khác' },
  ];

  const [createUpdate, { isLoading: isCreating }] = useCreateCampaignUpdateMutation();
  const [updateUpdate, { isLoading: isUpdating }] = useUpdateCampaignUpdateMutation();

  const isLoading = isCreating || isUpdating;
  const isEditing = !!updateToEdit;
  const contentTextLength = useMemo(() => getContentTextLength(content), [content]);

  const clearFieldError = (field: ValidationField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    if (updateToEdit) {
      setTitle(updateToEdit.title);
      setContent(updateToEdit.content);
      setCategory(normalizeUpdateCategory(updateToEdit.category));
      setIsDraft(updateToEdit.isDraft);
    } else {
      setTitle('');
      setContent('');
      setCategory(UpdateCategory.PROGRESS);
      setIsDraft(true);
    }
    setError(null);
    setFieldErrors({});
    setActiveTab('edit');
  }, [updateToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const nextFieldErrors: Partial<Record<ValidationField, string>> = {};

    if (!trimmedTitle) {
      nextFieldErrors.title = 'Vui lòng nhập tiêu đề cập nhật.';
    }

    if (!isValidUpdateCategory(category)) {
      nextFieldErrors.category = 'Vui lòng chọn danh mục hợp lệ.';
    }

    if (contentTextLength < 50) {
      nextFieldErrors.content = 'Nội dung cần tối thiểu 50 ký tự (không tính thẻ HTML).';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError('Vui lòng kiểm tra lại thông tin trước khi gửi.');
      setActiveTab('edit');
      toast.error('Vui lòng kiểm tra lại thông tin form.');
      return;
    }

    setError(null);
    setFieldErrors({});

    try {
      if (isEditing) {
        await updateUpdate({
          campaignId,
          updateId: updateToEdit.id,
          data: { title: trimmedTitle, content, category: normalizeUpdateCategory(category), isDraft },
        }).unwrap();
      } else {
        await createUpdate({
          campaignId,
          data: { title: trimmedTitle, content, category: normalizeUpdateCategory(category), isDraft },
        }).unwrap();
      }
      toast.success(isEditing ? 'Đã cập nhật bài viết thành công.' : 'Đã tạo cập nhật mới thành công.');
      onClose();
    } catch (err) {
      const extracted = extractApiError(err);
      setError(extracted.message);
      setFieldErrors(extracted.fieldErrors);
      setActiveTab('edit');
      toast.error(extracted.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">{isEditing ? 'Chỉnh sửa cập nhật' : 'Thêm cập nhật mới'}</h2>
          <button
            onClick={onClose}
            aria-label="Đóng modal"
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-[600px]">
          {/* Tab Controls */}
          <div className="flex gap-1 px-6 pt-6 border-b border-black/10 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'edit'
                  ? 'border-black text-black'
                  : 'border-transparent text-black/50 hover:text-black/70'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'preview'
                  ? 'border-black text-black'
                  : 'border-transparent text-black/50 hover:text-black/70'
              }`}
            >
              <Eye className="w-4 h-4" />
              Xem trước
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Error visible in both edit/preview tabs */}
            {error && (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm">
                {error}
              </div>
            )}

            {/* Edit Tab */}
            {activeTab === 'edit' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Tiêu đề <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      clearFieldError('title');
                    }}
                    placeholder="Ví dụ: Đã nhận được 500 quyên góp"
                    maxLength={100}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30"
                  />
                  <p className="text-xs text-black/40 mt-1">{title.length}/100</p>
                  {fieldErrors.title && <p className="text-xs text-rose-600 mt-1">{fieldErrors.title}</p>}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Danh mục cập nhật <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={normalizeUpdateCategory(category)}
                    onValueChange={(value) => {
                      setCategory(normalizeUpdateCategory(value));
                      clearFieldError('category');
                    }}
                  >
                    <SelectTrigger className="w-full border-2 border-black/10 bg-white/50 rounded-xl">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.category && <p className="text-xs text-rose-600 mt-1">{fieldErrors.category}</p>}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Nội dung <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-black/50 mb-2">Mô tả chi tiết về tiến độ chiến dịch</p>
                  <RichTextEditor
                    value={content}
                    onChange={(next) => {
                      setContent(next);
                      clearFieldError('content');
                    }}
                    placeholder="Chi tiết về tiến độ, những thành quả đạt được..."
                    // minRequirements={50}
                  />
                  <p className="text-xs text-black/40 mt-1">Tối thiểu 50 ký tự. Hiện tại: {contentTextLength}</p>
                  {fieldErrors.content && <p className="text-xs text-rose-600 mt-1">{fieldErrors.content}</p>}
                </div>

                {/* Draft Toggle */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-black/5 border border-black/10">
                  <input
                    type="checkbox"
                    id="isDraft"
                    checked={isDraft}
                    onChange={(e) => {
                      setIsDraft(e.target.checked);
                      if (!e.target.checked) {
                        setActiveTab('preview');
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isDraft" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-medium text-black">
                      <Lock className="w-4 h-4" />
                      Lưu như dự thảo
                    </div>
                    <p className="text-xs text-black/50 mt-1">
                      Dự thảo sẽ không được hiển thị công khai cho đến khi bạn xuất bản
                    </p>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Preview Tab (chỉ hiển thị khi công bố) */}
            {activeTab === 'preview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">XEM TRƯỚC BẢN CÔNG BỐ</p>
                  <p className="text-sm text-blue-700">Đây là cách bài cập nhật sẽ hiển thị cho người quyên góp</p>
                </div>

                {/* Title Preview */}
                <div>
                  <p className="text-xs font-semibold text-black/50 mb-2">TIÊU ĐỀ</p>
                  <h3 className="text-xl font-bold text-black">{title || 'Tiêu đề của bạn...'}</h3>
                </div>

                {/* Category Preview */}
                <div>
                  <p className="text-xs font-semibold text-black/50 mb-2">DANH MỤC</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border bg-black/5 text-black/70 border-black/10">
                    {UPDATE_CATEGORY_LABEL[normalizeUpdateCategory(category)]}
                  </span>
                </div>

                {/* Content Preview */}
                <div>
                  <p className="text-xs font-semibold text-black/50 mb-3">NỘI DUNG</p>
                  <div className="bg-white border border-black/10 rounded-xl p-4">
                    {content ? (
                      <RichTextContent content={content} className="text-base" />
                    ) : (
                      <p className="text-black/40 italic">Nội dung của bạn sẽ hiển thị ở đây...</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-6 py-4 border-t border-black/10 bg-white mt-auto">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                </>
              ) : (
                <>
                  {isDraft ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  {isEditing
                    ? isDraft
                      ? 'Lưu dự thảo'
                      : 'Cập nhật công bố'
                    : isDraft
                      ? 'Lưu dự thảo'
                      : 'Xuất bản cập nhật'}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
              Hủy
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
