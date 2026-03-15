'use client';

import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CampaignCategory } from '@/dtos/enums';
import { useSubmitCampaignRequestMutation } from '@/lib/store/features/campaign/campaignApi';
import { useUploadMyAssetMutation } from '@/lib/store/features/user/userApi';
import { useVietQRBanks } from '@/hooks/useVietQRBanks';
import { useAuth } from '@/hooks/useAuth';
import { BasicInfoSection } from '@/components/campaign/create/BasicInfoSection';
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
import { CATEGORY_LABELS, DRAFT_STORAGE_KEY, GOAL_PRESETS, TITLE_MAX } from '@/components/campaign/create/constants';
import type { CampaignDraft, FeedbackMessage, ProofPreview } from '@/components/campaign/create/types';
import {
  formatDateVN,
  formatVND,
  getTomorrowISO,
  parseCurrencyInput,
  removeDiacritics,
  shortVND,
} from '@/components/campaign/create/utils';
import { Button } from '@/components/ui/button';

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CreateCampaignPage() {
  const REDIRECT_SECONDS = 3;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [submitRequest, { isLoading }] = useSubmitCampaignRequestMutation();
  const [uploadMyAsset] = useUploadMyAssetMutation();
  const submitLockRef = useRef(false);
  const [redirectSeconds, setRedirectSeconds] = useState<number | null>(null);

  const {
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors: formErrors },
    handleSubmit: handleFormSubmit,
  } = useForm<CreateCampaignFormValues>({
    resolver: zodResolver(createCampaignFormSchema),
    mode: 'onChange',
    defaultValues: createCampaignFormDefaultValues,
  });

  // Form state
  const [goalRaw, setGoalRaw] = useState('');

  const title = watch('title');
  const goalAmount = watch('goalAmount');
  const deadline = watch('deadline');
  const category = watch('category') || '';
  const story = watch('story');
  const bankName = watch('bankName');
  const accountNumber = watch('accountNumber');
  const accountHolderName = watch('accountHolderName');

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

  const shouldBlockForKyc = isAuthenticated && !user?.isKycVerified;
  console.log('Current user:', user);

  // ── Load draft from localStorage on mount ─────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft: CampaignDraft = JSON.parse(raw);

      setValue('title', draft.title || '', { shouldValidate: false });
      setValue('goalAmount', draft.goalAmount || 0, { shouldValidate: false });
      setGoalRaw(draft.goalRaw || '');
      setValue('deadline', draft.deadline || '', { shouldValidate: false });
      setValue('category', draft.category || '', { shouldValidate: false });
      setValue('story', draft.storyHtml || '', { shouldValidate: false });
      setValue('bankName', draft.bankName || '', { shouldValidate: false });
      setValue('accountNumber', draft.accountNumber || '', { shouldValidate: false });
      setValue('accountHolderName', draft.accountHolderName || '', { shouldValidate: false });
      setMediaPreviews(draft.mediaPreviews || []);
      setCoverIndex(draft.coverIndex || 0);
    } catch {
      // Ignore corrupted draft
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

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

  const handleGoalChange = (raw: string) => {
    const num = parseCurrencyInput(raw);
    setValue('goalAmount', num, { shouldValidate: true, shouldDirty: true });
    setGoalRaw(num > 0 ? formatVND(num) : '');
  };

  const handleGoalPreset = (preset: number) => {
    setValue('goalAmount', preset, { shouldValidate: true, shouldDirty: true });
    setGoalRaw(formatVND(preset));
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
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
    const allowed = Array.from(files).filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf');
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
        setProofPreviews((prev) => [
          ...prev,
          {
            name: file.name,
            type: 'pdf',
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

  const validationErrors = [
    formErrors.title?.message,
    formErrors.goalAmount?.message,
    formErrors.deadline?.message,
    formErrors.story?.message,
    formErrors.bankName?.message,
    formErrors.accountNumber?.message,
    formErrors.accountHolderName?.message,
  ].filter((msg): msg is string => Boolean(msg));

  const isValid = validationErrors.length === 0;

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmitCampaign = async (values: CreateCampaignFormValues) => {
    if (submitLockRef.current || isLoading) return;

    submitLockRef.current = true;
    setShowConfirm(false);

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
          deadline: new Date(values.deadline).toISOString(),
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
      const message = getDisplayErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại.');
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
      goalRaw,
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
      <div className="max-w-4xl mx-auto">
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
              title={title}
              titleMax={TITLE_MAX}
              onTitleChange={(value) => setValue('title', value, { shouldValidate: true, shouldDirty: true })}
              goalRaw={goalRaw}
              goalAmount={goalAmount}
              goalPresets={GOAL_PRESETS}
              onGoalChange={handleGoalChange}
              onGoalPreset={handleGoalPreset}
              shortVND={shortVND}
              deadline={deadline}
              minDeadline={getTomorrowISO()}
              onDeadlineChange={(value) => setValue('deadline', value, { shouldValidate: true, shouldDirty: true })}
              formatDateVN={formatDateVN}
              category={category}
              onCategoryChange={(value) => setValue('category', value, { shouldValidate: true, shouldDirty: true })}
              categoryLabels={CATEGORY_LABELS}
              onBankNameChange={(value) => setValue('bankName', value, { shouldValidate: true, shouldDirty: true })}
              accountNumber={accountNumber}
              onAccountNumberChange={(value) =>
                setValue('accountNumber', value, { shouldValidate: true, shouldDirty: true })
              }
              accountHolderName={accountHolderName}
              onAccountHolderNameChange={(value) =>
                setValue('accountHolderName', value, { shouldValidate: true, shouldDirty: true })
              }
              normalizeAccountHolderName={removeDiacritics}
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
              <StoryEditorSection
                story={story}
                onStoryChange={(value) => setValue('story', value, { shouldValidate: true, shouldDirty: true })}
                onUploadImage={handleUploadStoryImage}
              />
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

          <ValidationWarnings errors={validationErrors} visible={title.length > 0} />

          <CreateCampaignActions
            isValid={isValid}
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

              const firstError = validationErrors[0] || 'Biểu mẫu chưa hợp lệ.';
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
        title={title}
        goalAmount={goalAmount}
        deadline={deadline}
        category={category}
        categoryLabels={CATEGORY_LABELS}
        selectedBank={selectedBank}
        bankName={bankName}
        accountNumber={accountNumber}
        accountHolderName={accountHolderName}
        formatDateVN={formatDateVN}
        formatVND={formatVND}
      />
    </div>
  );
}
