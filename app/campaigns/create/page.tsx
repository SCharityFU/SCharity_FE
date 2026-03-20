'use client';

import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { motion } from 'motion/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CampaignCategory } from '@/dtos/enums';
import { useSubmitCampaignRequestMutation } from '@/lib/store/features/campaign/campaignApi';
import { useUploadMyAssetMutation } from '@/lib/store/features/user/userApi';
import { useVietQRBanks } from '@/hooks/useVietQRBanks';
import { useAuth } from '@/hooks/useAuth';
import { BasicInfoSection } from '@/components/campaign/create';
import { CreateCampaignActions } from '@/components/campaign/create/CreateCampaignActions';
import { CreateCampaignFeedback } from '@/components/campaign/create/CreateCampaignFeedback';
import { CreateCampaignHeader } from '@/components/campaign/create/CreateCampaignHeader';
import { MediaUploadSection } from '@/components/campaign/create/MediaUploadSection';
import { ProofDocumentsSection } from '@/components/campaign/create/ProofDocumentsSection';
import { StoryEditorSection } from '@/components/campaign/create/StoryEditorSection';
import { SubmitConfirmDialog } from '@/components/campaign/create/SubmitConfirmDialog';
import { ValidationWarnings } from '@/components/campaign/create/ValidationWarnings';
import {
  createCampaignFormDefaultValues,
  createCampaignFormSchema,
  type CreateCampaignFormValues,
} from '@/components/campaign/create/schema';
import {
  CATEGORY_LABELS,
  DRAFT_STORAGE_KEY,
  GOAL_PRESETS,
  MAX_CAMPAIGN_DEADLINE_DAYS,
  TITLE_MAX,
} from '@/components/campaign/create/constants';
import type { CampaignDraft, FeedbackMessage, ProofPreview } from '@/components/campaign/create/types';
import {
  formatDateVN,
  getDateAfterDaysISO,
  getTomorrowISO,
  normalizeDeadlineToVnIso,
} from '@/components/campaign/create/utils';
import { Button } from '@/components/ui/button';
import { formatVND, formatVNDInput } from '@/lib/money';
import { formatVNDShort } from '@/lib/utils';

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CreateCampaignPage() {
  const REDIRECT_SECONDS = 3;
  const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const WORD_MIME_TYPES = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const;

  const isWordFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    return (
      WORD_MIME_TYPES.includes(file.type as (typeof WORD_MIME_TYPES)[number]) ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx')
    );
  };

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [submitRequest, { isLoading }] = useSubmitCampaignRequestMutation();
  const [uploadMyAsset] = useUploadMyAssetMutation();
  const submitLockRef = useRef(false);
  const [redirectSeconds, setRedirectSeconds] = useState<number | null>(null);

  const formMethods = useForm<CreateCampaignFormValues>({
    resolver: zodResolver(createCampaignFormSchema),
    mode: 'onBlur',
    defaultValues: createCampaignFormDefaultValues,
  });

  const { reset, getValues, trigger, setError, clearErrors, handleSubmit: handleFormSubmit } = formMethods;

  // Bank list from VietQR API
  const {
    bankSearch,
    setBankSearch,
    bankDropdownOpen,
    setBankDropdownOpen,
    selectedBank,
    bankDropdownRef,
    filteredBanks,
    selectBank,
  } = useVietQRBanks();

  // Media
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Proof documents
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [proofPreviews, setProofPreviews] = useState<ProofPreview[]>([]);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [proofDragOver, setProofDragOver] = useState(false);

  // Dialog
  const [showConfirm, setShowConfirm] = useState(false);

  // Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<FeedbackMessage | null>(null);
  const isLockedAfterSuccess = redirectSeconds !== null;

  const getDisplayErrorMessage = (error: unknown, fallback: string) => {
    const err = error as { status?: number; data?: { message?: string } } | undefined;
    if (err?.status === 500) return fallback;
    return err?.data?.message || fallback;
  };

  const applyBackendValidationErrors = (error: unknown): string | null => {
    const err = error as
      | {
          data?: {
            message?: string;
            errors?: Array<{ field?: string; message?: string }>;
          };
        }
      | undefined;

    const errors = err?.data?.errors ?? [];
    if (errors.length === 0) return null;

    const resolveField = (field?: string): keyof CreateCampaignFormValues | null => {
      if (!field) return null;
      const normalized = field.trim();

      if (normalized === 'title') return 'title';
      if (normalized === 'story') return 'story';
      if (normalized === 'goalAmount') return 'goalAmount';
      if (normalized === 'deadline') return 'deadline';
      if (normalized === 'bankName' || normalized === 'bankInfo.bankName') return 'bankName';
      if (normalized === 'accountNumber' || normalized === 'bankInfo.accountNumber') return 'accountNumber';
      if (normalized === 'accountHolderName' || normalized === 'bankInfo.accountHolderName') return 'accountHolderName';
      return null;
    };

    let firstMessage: string | null = null;

    for (const item of errors) {
      if (!item?.message) continue;
      const formField = resolveField(item.field);
      const displayMessage =
        item.field === 'deadline' && item.message.toLowerCase().includes('invalid datetime')
          ? 'Thời hạn chưa đúng định dạng ngày giờ. Vui lòng chọn lại ngày kết thúc.'
          : item.message;

      if (!firstMessage) firstMessage = displayMessage;

      if (formField) {
        setError(formField, { type: 'server', message: displayMessage });
      }
    }

    return firstMessage;
  };

  const shouldBlockForKyc = isAuthenticated && !user?.isKycVerified;
  // console.log('Current user:', user);

  // ── Load draft from localStorage on mount ─────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft: CampaignDraft = JSON.parse(raw);

      reset({
        title: draft.title || '',
        goalAmount: draft.goalAmount || 0,
        deadline: draft.deadline || '',
        category: draft.category || '',
        story: draft.storyHtml || '',
        bankName: draft.bankName || '',
        accountNumber: draft.accountNumber || '',
        accountHolderName: draft.accountHolderName || '',
      });
      setMediaPreviews(draft.mediaPreviews || []);
      setCoverIndex(draft.coverIndex || 0);
    } catch {
      // Ignore corrupted draft
    }
  }, [reset]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (redirectSeconds === null) return;

    if (redirectSeconds <= 0) {
      router.push('/dashboard/my-requests');
      return;
    }

    const timer = window.setTimeout(() => {
      setRedirectSeconds((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [redirectSeconds, router]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const inputFiles = Array.from(files);
    const oversizedFiles: string[] = [];

    const newFiles = inputFiles.filter((f) => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > MAX_UPLOAD_FILE_SIZE) {
        oversizedFiles.push(f.name);
        return false;
      }
      return true;
    });

    if (oversizedFiles.length > 0) {
      toast.error(`Ảnh vượt quá 10MB: ${oversizedFiles.join(', ')}`);
    }

    if (newFiles.length === 0 && inputFiles.length > 0 && oversizedFiles.length === 0) {
      toast.error('Chỉ hỗ trợ tệp ảnh cho phần hình ảnh chiến dịch.');
    }

    if (newFiles.length === 0) return;

    setMediaFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setMediaPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeMedia = (idx: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== idx));
    if (coverIndex === idx) setCoverIndex(0);
    else if (coverIndex > idx) setCoverIndex((prev) => prev - 1);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleUploadStoryImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadMyAsset(formData).unwrap();
      const imageUrl = response.data?.url;

      if (!imageUrl) {
        throw new Error('Không nhận được URL ảnh từ server.');
      }

      return imageUrl;
    } catch (err: unknown) {
      const message = getDisplayErrorMessage(err, 'Upload ảnh thất bại. Vui lòng thử lại.');
      toast.error(message);
      throw new Error(message);
    }
  };

  // Proof document handlers
  const addProofFiles = useCallback((files: FileList | File[]) => {
    const inputFiles = Array.from(files);
    const oversizedFiles: string[] = [];
    const invalidFiles: string[] = [];

    const allowed = inputFiles.filter((f) => {
      const isAllowedType = f.type.startsWith('image/') || f.type === 'application/pdf' || isWordFile(f);
      if (!isAllowedType) {
        invalidFiles.push(f.name);
        return false;
      }
      if (f.size > MAX_UPLOAD_FILE_SIZE) {
        oversizedFiles.push(f.name);
        return false;
      }
      return true;
    });

    if (invalidFiles.length > 0) {
      toast.error(`Tệp không hợp lệ (chỉ nhận ảnh, PDF, DOC, DOCX): ${invalidFiles.join(', ')}`);
    }

    if (oversizedFiles.length > 0) {
      toast.error(`Tài liệu vượt quá 10MB: ${oversizedFiles.join(', ')}`);
    }

    if (allowed.length === 0) return;
    setProofFiles((prev) => [...prev, ...allowed]);
    allowed.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setProofPreviews((prev) => [
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
        const proofType = isWordFile(file) ? 'doc' : 'pdf';
        setProofPreviews((prev) => [
          ...prev,
          {
            name: file.name,
            type: proofType,
            url: '',
          },
        ]);
      }
    });
  }, []);

  const removeProofFile = (idx: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== idx));
    setProofPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProofDrop = (e: DragEvent) => {
    e.preventDefault();
    setProofDragOver(false);
    if (e.dataTransfer.files) addProofFiles(e.dataTransfer.files);
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const getFirstValidationError = (): string | null => {
    const fieldNames: Array<keyof CreateCampaignFormValues> = [
      'title',
      'goalAmount',
      'deadline',
      'story',
      'bankName',
      'accountNumber',
      'accountHolderName',
    ];

    for (const fieldName of fieldNames) {
      const message = formMethods.getFieldState(fieldName).error?.message;
      if (message) return message;
    }

    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmitCampaign = async (values: CreateCampaignFormValues) => {
    if (submitLockRef.current || isLoading) return;

    submitLockRef.current = true;
    setShowConfirm(false);
    clearErrors();

    const normalizedDeadline = normalizeDeadlineToVnIso(values.deadline);
    if (!normalizedDeadline) {
      const message = 'Thời hạn kết thúc chưa hợp lệ. Vui lòng chọn lại ngày.';
      setError('deadline', { type: 'manual', message });
      setFeedbackMsg({ type: 'error', text: message });
      toast.error(message);
      submitLockRef.current = false;
      return;
    }

    try {
      // Separate the cover image (thumbnail) from media files
      const thumbnailFile = mediaFiles[coverIndex] || undefined;
      const otherMediaFiles = mediaFiles.filter((_, i) => i !== coverIndex);
      const categoryValue = values.category === '' ? CampaignCategory.OTHER : values.category;
      await submitRequest({
        data: {
          title: values.title,
          story: values.story,
          goalAmount: values.goalAmount,
          deadline: normalizedDeadline,
          category: categoryValue,
          bankInfo: {
            bankName: values.bankName,
            accountNumber: values.accountNumber,
            accountHolderName: values.accountHolderName.toUpperCase(),
          },
        },
        thumbnail: thumbnailFile,
        media: otherMediaFiles.length > 0 ? otherMediaFiles : undefined,
        proofDocuments: proofFiles.length > 0 ? proofFiles : undefined,
      }).unwrap();

      // Clear saved draft on successful submit
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      const successMessage = 'Chiến dịch đã được gửi duyệt thành công!';
      setFeedbackMsg({ type: 'success', text: successMessage });
      setRedirectSeconds(REDIRECT_SECONDS);
      toast.success(successMessage, {
        description: `Sẽ chuyển về trang Yêu Cầu Của Tôi sau ${REDIRECT_SECONDS} giây.`,
        duration: REDIRECT_SECONDS * 1000,
      });
    } catch (err: unknown) {
      const validationMessage = applyBackendValidationErrors(err);
      const message = validationMessage || getDisplayErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại.');
      setFeedbackMsg({
        type: 'error',
        text: message,
      });
      toast.error(message);
    } finally {
      submitLockRef.current = false;
    }
  };

  const handleSaveDraft = () => {
    if (isLockedAfterSuccess) return;

    const values = getValues();
    const draft: CampaignDraft = {
      title: values.title,
      goalAmount: values.goalAmount,
      goalRaw: values.goalAmount > 0 ? formatVNDInput(values.goalAmount) : '',
      deadline: values.deadline,
      category: (values.category as CampaignCategory | '') || '',
      storyHtml: values.story,
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      accountHolderName: values.accountHolderName,
      mediaPreviews,
      coverIndex,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      const successMessage = 'Đã lưu nháp thành công! Dữ liệu sẽ được khôi phục khi bạn quay lại.';
      setFeedbackMsg({ type: 'success', text: successMessage });
      toast.success(successMessage);
    } catch {
      const errorMessage = 'Không thể lưu nháp. Bộ nhớ trình duyệt có thể đã đầy.';
      setFeedbackMsg({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (shouldBlockForKyc) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-2xl p-8 md:p-10"
          >
            <h1 className="text-2xl md:text-3xl font-black text-black mb-4">
              Bạn cần xác thực KYC trước khi tạo chiến dịch
            </h1>
            <p className="text-black/70 leading-relaxed mb-8">
              Để đảm bảo minh bạch và an toàn cho cộng đồng, tài khoản của bạn cần hoàn tất xác thực KYC trước khi gửi
              yêu cầu tạo chiến dịch gây quỹ.
            </p>
            <Button onClick={() => router.push('/kyc')} variant="outline">
              Đi tới trang KYC
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <FormProvider {...formMethods}>
        <div className="max-w-screen-lg mx-auto">
          {/* ── Header ────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <CreateCampaignHeader />
          </motion.div>

          <CreateCampaignFeedback feedbackMsg={feedbackMsg} onClose={() => setFeedbackMsg(null)} />

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`glass-card rounded-2xl p-6 md:p-8 ${
              isLockedAfterSuccess ? 'pointer-events-none opacity-80' : ''
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <BasicInfoSection
                titleMax={TITLE_MAX}
                goalPresets={GOAL_PRESETS}
                shortVND={formatVNDShort}
                minDeadline={getTomorrowISO()}
                maxDeadline={getDateAfterDaysISO(MAX_CAMPAIGN_DEADLINE_DAYS)}
                formatDateVN={formatDateVN}
                categoryLabels={CATEGORY_LABELS}
                bankSearch={bankSearch}
                onBankSearchChange={setBankSearch}
                bankDropdownOpen={bankDropdownOpen}
                onBankDropdownOpenChange={setBankDropdownOpen}
                selectedBank={selectedBank}
                bankDropdownRef={bankDropdownRef}
                filteredBanks={filteredBanks}
                onSelectBank={selectBank}
              />

              <div className="space-y-6">
                <StoryEditorSection onUploadImage={handleUploadStoryImage} />
                <MediaUploadSection
                  isDragOver={isDragOver}
                  fileInputRef={fileInputRef}
                  mediaPreviews={mediaPreviews}
                  coverIndex={coverIndex}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onInputFiles={(files) => addFiles(files)}
                  onCoverChange={setCoverIndex}
                  onRemoveMedia={removeMedia}
                />
                <ProofDocumentsSection
                  proofDragOver={proofDragOver}
                  proofInputRef={proofInputRef}
                  proofPreviews={proofPreviews}
                  onDrop={handleProofDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setProofDragOver(true);
                  }}
                  onDragLeave={() => setProofDragOver(false)}
                  onInputFiles={(files) => addProofFiles(files)}
                  onRemoveProof={removeProofFile}
                />
              </div>
            </div>

            <ValidationWarnings />

            <CreateCampaignActions
              isSubmitting={isLoading || isLockedAfterSuccess}
              onCancel={() => router.push('/campaigns')}
              onSaveDraft={handleSaveDraft}
              onOpenConfirm={async () => {
                if (isLoading || isLockedAfterSuccess) return;

                const valid = await trigger();
                if (valid) {
                  setShowConfirm(true);
                  return;
                }

                const firstError = getFirstValidationError() || 'Biểu mẫu chưa hợp lệ.';
                const message = `Biểu mẫu chưa hợp lệ: ${firstError}`;
                setFeedbackMsg({ type: 'error', text: message });
                toast.warning(message);
              }}
            />
          </motion.div>

          {redirectSeconds !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
            >
              <p className="text-sm font-semibold text-emerald-700">
                Đang chuyển đến trang Yêu Cầu Của Tôi sau {redirectSeconds} giây...
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(redirectSeconds / REDIRECT_SECONDS) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </div>

        <SubmitConfirmDialog
          open={showConfirm}
          setOpen={setShowConfirm}
          isLoading={isLoading || isLockedAfterSuccess}
          onSubmit={handleFormSubmit(onSubmitCampaign)}
          categoryLabels={CATEGORY_LABELS}
          selectedBank={selectedBank}
          formatDateVN={formatDateVN}
          formatVND={formatVND}
        />
      </FormProvider>
    </div>
  );
}
