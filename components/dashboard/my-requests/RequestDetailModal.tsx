'use client';

import { useState, useCallback, useEffect, type ChangeEvent, type DragEvent, useRef } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Clock,
  Landmark,
  CalendarDays,
  Target,
  Tag,
  Info,
  Loader2,
  Save,
  ImageIcon,
  FileCheck,
  Upload,
  X,
  Star,
  DollarSign,
  Pencil,
} from 'lucide-react';
import { CampaignRequestStatus } from '@/dtos/enums';
import type { CampaignRequestResponseDto } from '@/dtos/campaign';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useUpdateCampaignRequestMutation } from '@/lib/store/features/campaign/campaignApi';
import { RichTextContent } from '@/components/ui/rich-text-content';
import { CampaignMediaSection } from '@/components/campaign/detail/CampaignMediaSection';
import { RequestStoryEditor } from '@/components/dashboard/my-requests/RequestStoryEditor';
import { CATEGORY_LABELS, STATUS_CONFIG, fmtDate, fmtVND } from '@/components/dashboard/my-requests/constants';

const TITLE_MAX = 100;
const GOAL_PRESETS = [5_000_000, 10_000_000, 50_000_000, 100_000_000];

function formatVNDInput(v: number): string {
  return v.toLocaleString('vi-VN');
}

function parseCurrencyInput(raw: string): number {
  return Number(raw.replace(/\./g, '').replace(/\D/g, '')) || 0;
}

function shortVND(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} tr`;
  return formatVNDInput(n);
}

function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function fmtDateForDateInput(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: CampaignRequestResponseDto | null;
}

export function RequestDetailModal({ open, onOpenChange, request }: Props) {
  const [selectedReq, setSelectedReq] = useState<CampaignRequestResponseDto | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editGoalRaw, setEditGoalRaw] = useState('');
  const [editGoalAmount, setEditGoalAmount] = useState(0);
  const [editDeadline, setEditDeadline] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [updateRequest, { isLoading: isUpdating }] = useUpdateCampaignRequestMutation();
  const [editFeedback, setEditFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
  const [editMediaPreviews, setEditMediaPreviews] = useState<string[]>([]);
  const [editCoverIndex, setEditCoverIndex] = useState(0);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [editIsDragOver, setEditIsDragOver] = useState(false);

  const [editProofFiles, setEditProofFiles] = useState<File[]>([]);
  const [editProofPreviews, setEditProofPreviews] = useState<{ name: string; type: string; url: string }[]>([]);
  const editProofInputRef = useRef<HTMLInputElement>(null);
  const [editProofDragOver, setEditProofDragOver] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedReq(request);
    setIsEditing(false);
    setEditFeedback(null);
  }, [open, request]);

  const handleEditGoalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseCurrencyInput(raw);
    setEditGoalAmount(num);
    setEditGoalRaw(num > 0 ? formatVNDInput(num) : '');
  };

  const handleEditGoalPreset = (preset: number) => {
    setEditGoalAmount(preset);
    setEditGoalRaw(formatVNDInput(preset));
  };

  const addEditFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (newFiles.length === 0) return;
    setEditMediaFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditMediaPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeEditMedia = (idx: number) => {
    setEditMediaFiles((prev) => prev.filter((_, i) => i !== idx));
    setEditMediaPreviews((prev) => prev.filter((_, i) => i !== idx));
    if (editCoverIndex === idx) setEditCoverIndex(0);
    else if (editCoverIndex > idx) setEditCoverIndex((prev) => prev - 1);
  };

  const handleEditDrop = (e: DragEvent) => {
    e.preventDefault();
    setEditIsDragOver(false);
    if (e.dataTransfer.files) addEditFiles(e.dataTransfer.files);
  };

  const addProofFiles = useCallback((files: FileList | File[]) => {
    const allowed = Array.from(files).filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (allowed.length === 0) return;
    setEditProofFiles((prev) => [...prev, ...allowed]);
    allowed.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setEditProofPreviews((prev) => [
            ...prev,
            {
              name: file.name,
              type: 'image',
              url: ev.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setEditProofPreviews((prev) => [...prev, { name: file.name, type: 'pdf', url: '' }]);
      }
    });
  }, []);

  const removeProofFile = (idx: number) => {
    setEditProofFiles((prev) => prev.filter((_, i) => i !== idx));
    setEditProofPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProofDrop = (e: DragEvent) => {
    e.preventDefault();
    setEditProofDragOver(false);
    if (e.dataTransfer.files) addProofFiles(e.dataTransfer.files);
  };

  const startEditing = () => {
    if (!selectedReq) return;
    setEditTitle(selectedReq.title);
    setEditStory(selectedReq.story);
    setEditGoalAmount(selectedReq.goalAmount);
    setEditGoalRaw(formatVNDInput(selectedReq.goalAmount));
    setEditDeadline(fmtDateForDateInput(selectedReq.deadline));
    setEditCategory(selectedReq.category ?? 'other');
    setEditFeedback(null);

    const existingPreviews: string[] = [];
    if (selectedReq.thumbnailUrl) existingPreviews.push(selectedReq.thumbnailUrl);
    if (selectedReq.mediaUrls) existingPreviews.push(...selectedReq.mediaUrls);
    setEditMediaPreviews(existingPreviews);
    setEditMediaFiles([]);
    setEditCoverIndex(0);

    const existingProofs: { name: string; type: string; url: string }[] = [];
    if (selectedReq.proofDocuments) {
      selectedReq.proofDocuments.forEach((url) => {
        const isPdf = url.toLowerCase().endsWith('.pdf');
        existingProofs.push({
          name: url.split('/').pop() || 'document',
          type: isPdf ? 'pdf' : 'image',
          url,
        });
      });
    }
    setEditProofPreviews(existingProofs);
    setEditProofFiles([]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditFeedback(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedReq) return;
    const newFiles = editMediaFiles.filter((f) => f instanceof File);
    const coverFile = newFiles[editCoverIndex] || undefined;
    const otherMediaFiles = newFiles.filter((_, i) => i !== editCoverIndex);
    try {
      const result = await updateRequest({
        requestId: selectedReq.id,
        data: {
          title: editTitle,
          story: editStory,
          goalAmount: editGoalAmount,
          deadline: new Date(editDeadline).toISOString(),
          category: editCategory,
        },
        thumbnail: coverFile ? [coverFile] : undefined,
        media: otherMediaFiles.length > 0 ? otherMediaFiles : undefined,
        proofDocuments: editProofFiles.length > 0 ? editProofFiles : undefined,
      }).unwrap();
      setEditFeedback({ type: 'success', text: 'Cập nhật yêu cầu thành công!' });
      if (result.data) setSelectedReq(result.data);
      setTimeout(() => {
        setIsEditing(false);
        setEditFeedback(null);
      }, 1200);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message || 'Có lỗi xảy ra.';
      setEditFeedback({ type: 'error', text: msg });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setIsEditing(false);
          setEditFeedback(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        {selectedReq && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <FileText className="w-5 h-5 text-rose-400" />
                Chi Tiết Yêu Cầu
              </DialogTitle>
              <DialogDescription>Thông tin đầy đủ về yêu cầu tạo chiến dịch</DialogDescription>
            </DialogHeader>

            {editFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border text-sm font-medium ${
                  editFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                }`}
              >
                {editFeedback.text}
              </motion.div>
            )}

            {!isEditing ? (
              <div className="space-y-4">
                {(() => {
                  const cfg = STATUS_CONFIG[selectedReq.status as CampaignRequestStatus];
                  const Icon = cfg.icon;
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                      {selectedReq.category && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-500/20 text-blue-500 bg-blue-500/10">
                          <Tag className="w-3.5 h-3.5" />
                          {CATEGORY_LABELS[selectedReq.category] ?? selectedReq.category}
                        </span>
                      )}
                    </div>
                  );
                })()}

                <div>
                  <p className="text-xs text-black/40 mb-1">Tiêu đề</p>
                  <p className="font-bold text-black text-lg">{selectedReq.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/[0.03] p-3">
                    <div className="flex items-center gap-2 text-xs text-black/40 mb-1">
                      <Target className="w-3.5 h-3.5 text-rose-400" />
                      Mục tiêu
                    </div>
                    <p className="font-bold text-black">{fmtVND(selectedReq.goalAmount)}</p>
                  </div>
                  <div className="rounded-xl bg-black/[0.03] p-3">
                    <div className="flex items-center gap-2 text-xs text-black/40 mb-1">
                      <CalendarDays className="w-3.5 h-3.5 text-violet-400" />
                      Hạn chót
                    </div>
                    <p className="font-bold text-black">{fmtDate(selectedReq.deadline)}</p>
                  </div>
                  <div className="rounded-xl bg-black/[0.03] p-3">
                    <div className="flex items-center gap-2 text-xs text-black/40 mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Ngày gửi
                    </div>
                    <p className="font-bold text-black">{fmtDate(selectedReq.createdAt)}</p>
                  </div>
                  <div className="rounded-xl bg-black/[0.03] p-3">
                    <div className="flex items-center gap-2 text-xs text-black/40 mb-1">
                      <Info className="w-3.5 h-3.5 text-sky-400" />
                      Cập nhật
                    </div>
                    <p className="font-bold text-black">{fmtDate(selectedReq.updatedAt)}</p>
                  </div>

                  {selectedReq.bankInfo && (
                    <div className="col-span-2 rounded-xl border border-black/10 bg-black/[0.02] p-3">
                      <div className="flex items-center gap-2 text-xs text-black/40 mb-2">
                        <Landmark className="w-3.5 h-3.5" />
                        Thông tin ngân hàng
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[11px] text-black/30">Ngân hàng</p>
                          <p className="font-semibold text-black text-sm">{selectedReq.bankInfo.bankName}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-black/30">Số TK</p>
                          <p className="font-semibold text-black text-sm font-mono">
                            {selectedReq.bankInfo.accountNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-black/30">Chủ TK</p>
                          <p className="font-semibold text-black text-sm">{selectedReq.bankInfo.accountHolderName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-black/40 mb-1">Câu chuyện</p>
                  <div className="rounded-xl bg-black/[0.03] p-4 text-sm max-h-80 overflow-y-auto">
                    <RichTextContent content={selectedReq.story} />
                  </div>
                </div>

                {selectedReq.thumbnailUrl && (
                  <div>
                    <p className="text-xs text-black/40 mb-1 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Ảnh đại diện
                    </p>
                    <img
                      src={selectedReq.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full max-h-48 object-cover rounded-xl"
                    />
                  </div>
                )}

                {selectedReq.mediaUrls && selectedReq.mediaUrls.length > 0 && (
                  <div className="rounded-xl border border-black/10 p-3">
                    <CampaignMediaSection mediaUrls={selectedReq.mediaUrls} />
                  </div>
                )}

                {selectedReq.proofDocuments && selectedReq.proofDocuments.length > 0 && (
                  <div>
                    <p className="text-xs text-black/40 mb-1 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5" /> Giấy tờ chứng minh ({selectedReq.proofDocuments.length})
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedReq.proofDocuments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 text-xs text-black/60 hover:bg-black/10 transition-colors"
                        >
                          <FileCheck className="w-3 h-3" />
                          Tài liệu {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReq.rejectReason && (
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <p className="text-sm text-rose-500">
                      <strong>Lý do từ chối:</strong> {selectedReq.rejectReason}
                    </p>
                  </div>
                )}

                {selectedReq.reviewedAt && (
                  <div className="text-xs text-black/30">
                    Duyệt lúc: {fmtDate(selectedReq.reviewedAt)}
                    {selectedReq.reviewedBy && <> bởi {selectedReq.reviewedBy.fullName ?? 'Admin'}</>}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    Tiêu đề
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={TITLE_MAX}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="VD: Xây trường học cho trẻ em vùng cao"
                      className="w-full px-4 py-2.5 pr-16 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30 text-sm"
                    />
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${editTitle.length >= TITLE_MAX ? 'text-rose-500 font-semibold' : 'text-black/30'}`}
                    >
                      {editTitle.length}/{TITLE_MAX}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    Mục tiêu gây quỹ
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editGoalRaw}
                      onChange={handleEditGoalChange}
                      placeholder="VD: 50.000.000"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30 text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-black/40">
                      ₫
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {GOAL_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleEditGoalPreset(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${editGoalAmount === preset ? 'bg-rose-500 text-white shadow-sm' : 'bg-black/[0.04] border border-black/10 text-black/50 hover:text-black hover:border-rose-400/30'}`}
                      >
                        {shortVND(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-violet-400" />
                      Hạn chót
                    </Label>
                    <input
                      type="date"
                      min={getTomorrowISO()}
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors text-sm"
                    />
                    {editDeadline && (
                      <p className="text-[11px] text-black/40">Ngày kết thúc: {fmtDate(editDeadline)}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-400" />
                      Danh mục
                    </Label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors text-sm appearance-none cursor-pointer"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([val, lab]) => (
                        <option key={val} value={val}>
                          {lab}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    Câu chuyện chiến dịch
                  </Label>
                  <RequestStoryEditor value={editStory} onChange={setEditStory} />
                  <p className="text-[11px] text-black/30 text-right">
                    {
                      editStory
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim().length
                    }{' '}
                    ký tự • Tối thiểu 50
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-pink-500" />
                    Hình ảnh chiến dịch
                  </Label>
                  <div
                    onDrop={handleEditDrop}
                    onDragOver={(e: DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      setEditIsDragOver(true);
                    }}
                    onDragLeave={() => setEditIsDragOver(false)}
                    onClick={() => editFileInputRef.current?.click()}
                    className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 ${editIsDragOver ? 'border-rose-400 bg-rose-50/50' : 'border-black/10 hover:border-rose-300 hover:bg-rose-50/20'}`}
                  >
                    <input
                      ref={editFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) addEditFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-rose-400" />
                      </div>
                      <p className="text-xs text-black/50">
                        <span className="font-semibold text-rose-500">Nhấn để chọn</span> hoặc kéo thả ảnh
                      </p>
                      <p className="text-[10px] text-black/30">PNG, JPG, WEBP</p>
                    </div>
                  </div>

                  {editMediaPreviews.length > 0 && (
                    <>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {editMediaPreviews.map((src, idx) => (
                          <div key={idx} className="relative group">
                            <div
                              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${editCoverIndex === idx ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-transparent hover:border-black/20'}`}
                              onClick={() => setEditCoverIndex(idx)}
                            >
                              <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                              {editCoverIndex === idx && (
                                <div className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Star className="w-2 h-2" />
                                  Bìa
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEditMedia(idx);
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-black/40">
                        Nhấn vào ảnh để chọn làm ảnh bìa • {editMediaPreviews.length} ảnh
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Tài liệu chứng minh
                  </Label>
                  <p className="text-[11px] text-black/40">Tải lên giấy tờ xác minh chiến dịch (ảnh hoặc PDF)</p>
                  <div
                    onDrop={handleProofDrop}
                    onDragOver={(e: DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      setEditProofDragOver(true);
                    }}
                    onDragLeave={() => setEditProofDragOver(false)}
                    onClick={() => editProofInputRef.current?.click()}
                    className={`relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-300 ${editProofDragOver ? 'border-emerald-400 bg-emerald-50/50' : 'border-black/10 hover:border-emerald-300 hover:bg-emerald-50/20'}`}
                  >
                    <input
                      ref={editProofInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) addProofFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-xs text-black/50">
                        <span className="font-semibold text-emerald-600">Nhấn để chọn</span> hoặc kéo thả tài liệu
                      </p>
                      <p className="text-[10px] text-black/30">PNG, JPG, WEBP, PDF</p>
                    </div>
                  </div>

                  {editProofPreviews.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {editProofPreviews.map((proof, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2.5 rounded-lg border border-black/10 bg-white/30 group"
                        >
                          {proof.type === 'image' && proof.url ? (
                            <img
                              src={proof.url}
                              alt={proof.name}
                              className="w-10 h-10 rounded-md object-cover border border-black/10 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-red-500">PDF</span>
                            </div>
                          )}
                          <span className="text-xs text-black/60 truncate flex-1">{proof.name}</span>
                          <button
                            type="button"
                            onClick={() => removeProofFile(idx)}
                            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <p className="text-[11px] text-black/40">{editProofPreviews.length} tài liệu đã chọn</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Đóng
                  </Button>
                  {selectedReq.status === CampaignRequestStatus.PENDING && (
                    <Button onClick={startEditing}>
                      <Pencil className="w-4 h-4" />
                      Sửa Yêu Cầu
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={cancelEditing} disabled={isUpdating}>
                    Hủy Chỉnh Sửa
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu Thay Đổi
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
