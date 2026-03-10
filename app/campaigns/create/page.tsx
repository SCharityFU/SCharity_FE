"use client";

import { useState, useRef, useCallback, useEffect, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    Type,
    DollarSign,
    Calendar,
    FileText,
    Upload,
    ImageIcon,
    X,
    Star,
    Landmark,
    CreditCard,
    User,
    Send,
    Save,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Bold,
    Italic,
    List,
    Link,
    Image as ImageLucide,
    Search,
    ChevronDown,
    FileCheck,
} from "lucide-react";
import { CampaignCategory } from "@/dtos/enums";
import { HighlightText } from "@/components/ui/highlight-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSubmitCampaignRequestMutation } from "@/lib/store/features/campaign/campaignApi";
import { useVietQRBanks } from "@/hooks/useVietQRBanks";

// ── Constants ──────────────────────────────────────────────────────────────────

const TITLE_MAX = 100;
const GOAL_PRESETS = [5_000_000, 10_000_000, 50_000_000, 100_000_000];
const DRAFT_STORAGE_KEY = "scharity_campaign_draft";
const CATEGORY_LABELS: Record<CampaignCategory, string> = {
    [CampaignCategory.EDUCATION]: "Giáo dục",
    [CampaignCategory.MEDICAL]: "Y tế",
    [CampaignCategory.DISASTER]: "Thiên tai",
    [CampaignCategory.COMMUNITY]: "Cộng đồng",
    [CampaignCategory.ENVIRONMENT]: "Môi trường",
    [CampaignCategory.OTHER]: "Khác",
};

interface CampaignDraft {
    title: string;
    goalAmount: number;
    goalRaw: string;
    deadline: string;
    category: CampaignCategory | "";
    storyHtml: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    mediaPreviews: string[];
    coverIndex: number;
    savedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatVND(value: number): string {
    return value.toLocaleString("vi-VN");
}

function parseCurrencyInput(raw: string): number {
    return Number(raw.replace(/\./g, "").replace(/\D/g, "")) || 0;
}

function getTomorrowISO(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

function formatDateVN(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function shortVND(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)} tỷ`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} tr`;
    return formatVND(n);
}

/** Remove Vietnamese diacritics → plain uppercase ASCII (bank standard) */
function removeDiacritics(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toUpperCase();
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CreateCampaignPage() {
    const router = useRouter();
    const [submitRequest, { isLoading }] = useSubmitCampaignRequestMutation();

    // Form state
    const [title, setTitle] = useState("");
    const [goalRaw, setGoalRaw] = useState("");
    const [goalAmount, setGoalAmount] = useState(0);
    const [deadline, setDeadline] = useState("");
    const [category, setCategory] = useState<CampaignCategory | "">("");
    const [story, setStory] = useState("");

    // Bank info
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");

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
    const [proofPreviews, setProofPreviews] = useState<{ name: string; type: string; url: string }[]>([]);
    const proofInputRef = useRef<HTMLInputElement>(null);
    const [proofDragOver, setProofDragOver] = useState(false);

    // Dialog
    const [showConfirm, setShowConfirm] = useState(false);

    // Feedback
    const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Story editor ref
    const storyEditorRef = useRef<HTMLDivElement>(null);

    // ── Load draft from localStorage on mount ─────────────────────────────────

    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (!raw) return;
            const draft: CampaignDraft = JSON.parse(raw);

            setTitle(draft.title || "");
            setGoalAmount(draft.goalAmount || 0);
            setGoalRaw(draft.goalRaw || "");
            setDeadline(draft.deadline || "");
            setCategory(draft.category || "");
            setStory(draft.storyHtml || "");
            setBankName(draft.bankName || "");
            setAccountNumber(draft.accountNumber || "");
            setAccountHolderName(draft.accountHolderName || "");
            setMediaPreviews(draft.mediaPreviews || []);
            setCoverIndex(draft.coverIndex || 0);

            // Restore story editor HTML after mount
            if (draft.storyHtml && storyEditorRef.current) {
                storyEditorRef.current.innerHTML = draft.storyHtml;
            }
        } catch {
            // Ignore corrupted draft
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Restore story HTML into contentEditable after initial render
    useEffect(() => {
        if (story && storyEditorRef.current && !storyEditorRef.current.innerHTML) {
            storyEditorRef.current.innerHTML = story;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [story]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleGoalChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const num = parseCurrencyInput(raw);
        setGoalAmount(num);
        setGoalRaw(num > 0 ? formatVND(num) : "");
    };

    const handleGoalPreset = (preset: number) => {
        setGoalAmount(preset);
        setGoalRaw(formatVND(preset));
    };

    const addFiles = useCallback((files: FileList | File[]) => {
        const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
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

    // Story toolbar commands
    const execCmd = (cmd: string, value?: string) => {
        document.execCommand(cmd, false, value);
        storyEditorRef.current?.focus();
    };

    const getStoryHTML = () => storyEditorRef.current?.innerHTML || "";

    // Proof document handlers
    const addProofFiles = useCallback((files: FileList | File[]) => {
        const allowed = Array.from(files).filter(
            (f) => f.type.startsWith("image/") || f.type === "application/pdf"
        );
        if (allowed.length === 0) return;
        setProofFiles((prev) => [...prev, ...allowed]);
        allowed.forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setProofPreviews((prev) => [...prev, {
                        name: file.name,
                        type: "image",
                        url: ev.target?.result as string,
                    }]);
                };
                reader.readAsDataURL(file);
            } else {
                setProofPreviews((prev) => [...prev, {
                    name: file.name,
                    type: "pdf",
                    url: "",
                }]);
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

    const errors: string[] = [];
    if (title.length < 5) errors.push("Tiêu đề ít nhất 5 ký tự");
    if (goalAmount < 1_000_000) errors.push("Mục tiêu tối thiểu 1.000.000₫");
    if (!deadline) errors.push("Chưa chọn hạn chót");
    const storyText = storyEditorRef.current?.innerText || story;
    if (storyText.length < 50) errors.push("Câu chuyện ít nhất 50 ký tự");
    if (!bankName) errors.push("Chưa nhập tên ngân hàng");
    if (!accountNumber) errors.push("Chưa nhập số tài khoản");
    if (!accountHolderName) errors.push("Chưa nhập tên chủ tài khoản");

    const isValid = errors.length === 0;

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        setShowConfirm(false);
        try {
            // Separate the cover image (thumbnail) from media files
            const thumbnailFile = mediaFiles[coverIndex] || undefined;
            const otherMediaFiles = mediaFiles.filter((_, i) => i !== coverIndex);

            await submitRequest({
                data: {
                    title,
                    story: getStoryHTML() || story,
                    goalAmount,
                    deadline: new Date(deadline).toISOString(),
                    category: (category as CampaignCategory) || undefined,
                    bankInfo: {
                        bankName,
                        accountNumber,
                        accountHolderName: accountHolderName.toUpperCase(),
                    },
                },
                thumbnail: thumbnailFile,
                media: otherMediaFiles.length > 0 ? otherMediaFiles : undefined,
                proofDocuments: proofFiles.length > 0 ? proofFiles : undefined,
            }).unwrap();

            // Clear saved draft on successful submit
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            setFeedbackMsg({ type: "success", text: "Chiến dịch đã được gửi duyệt thành công!" });
            setTimeout(() => router.push("/campaigns"), 2000);
        } catch (err: any) {
            setFeedbackMsg({
                type: "error",
                text: err?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
            });
        }
    };

    const handleSaveDraft = () => {
        const draft: CampaignDraft = {
            title,
            goalAmount,
            goalRaw,
            deadline,
            category,
            storyHtml: getStoryHTML(),
            bankName,
            accountNumber,
            accountHolderName,
            mediaPreviews,
            coverIndex,
            savedAt: new Date().toISOString(),
        };
        try {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
            setFeedbackMsg({ type: "success", text: "Đã lưu nháp thành công! Dữ liệu sẽ được khôi phục khi bạn quay lại." });
        } catch {
            setFeedbackMsg({ type: "error", text: "Không thể lưu nháp. Bộ nhớ trình duyệt có thể đã đầy." });
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ── Header ────────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-black mb-3">
                        Tạo{" "}
                        <HighlightText variant="underline" color="primary" className="gradient-text">
                            Chiến Dịch
                        </HighlightText>
                    </h1>
                    <p className="text-black/50 max-w-lg mx-auto text-sm">
                        Điền thông tin chiến dịch của bạn. Sau khi gửi, đội ngũ quản trị sẽ xét duyệt trong 24h.
                    </p>
                </motion.div>

                {/* ── Feedback ──────────────────────────────────────────────────── */}
                <AnimatePresence>
                    {feedbackMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${feedbackMsg.type === "success"
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
                                title="Feedback"
                                onClick={() => setFeedbackMsg(null)}
                                className="ml-auto hover:opacity-70 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Form ──────────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="glass-card rounded-2xl p-6 md:p-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* ── Left Column ─────────────────────────────────────────── */}
                        <div className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="campaign-title" className="text-black/70">
                                    <Type className="w-4 h-4 text-rose-400" />
                                    Tiêu đề chiến dịch
                                </Label>
                                <div className="relative">
                                    <input
                                        id="campaign-title"
                                        type="text"
                                        maxLength={TITLE_MAX}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="VD: Xây trường học cho trẻ em vùng cao"
                                        className="w-full px-4 py-3 rounded-xl glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black/30">
                                        {title.length}/{TITLE_MAX}
                                    </span>
                                </div>
                            </div>

                            {/* Goal Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="campaign-goal" className="text-black/70">
                                    <DollarSign className="w-4 h-4 text-amber-500" />
                                    Mục tiêu gây quỹ
                                </Label>
                                <div className="relative">
                                    <input
                                        id="campaign-goal"
                                        type="text"
                                        inputMode="numeric"
                                        value={goalRaw}
                                        onChange={handleGoalChange}
                                        placeholder="VD: 50.000.000"
                                        className="w-full px-4 py-3 pr-12 rounded-xl glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-black/40">
                                        ₫
                                    </span>
                                </div>
                                {/* Quick presets */}
                                <div className="flex flex-wrap gap-2">
                                    {GOAL_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handleGoalPreset(preset)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${goalAmount === preset
                                                ? "bg-rose-500 text-white shadow-sm"
                                                : "glass border border-black/10 text-black/50 hover:text-black hover:border-rose-500/30"
                                                }`}
                                        >
                                            {shortVND(preset)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Deadline */}
                            <div className="space-y-2">
                                <Label htmlFor="campaign-deadline" className="text-black/70">
                                    <Calendar className="w-4 h-4 text-violet-500" />
                                    Hạn chót
                                </Label>
                                <input
                                    title="Deadline"
                                    id="campaign-deadline"
                                    type="date"
                                    min={getTomorrowISO()}
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl glass border border-black/10 text-black outline-none focus:border-rose-500/50 transition-colors text-sm"
                                />
                                {deadline && (
                                    <p className="text-xs text-black/40">
                                        Ngày kết thúc: {formatDateVN(deadline)}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label className="text-black/70">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    Danh mục (tùy chọn)
                                </Label>
                                <Select
                                    value={category}
                                    onValueChange={(val: string) => setCategory(val as CampaignCategory)}
                                >
                                    <SelectTrigger className="w-full h-11 px-4 rounded-xl bg-white border border-black/10 text-sm">
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-black/10 rounded-xl shadow-lg">
                                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key} className="rounded-lg text-black/70 focus:bg-black/[0.04] focus:text-black">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bank Info */}
                            <div className="space-y-4 p-4 rounded-xl bg-black/[0.02] border border-black/5">
                                <h3 className="font-semibold text-sm text-black/80 flex items-center gap-2">
                                    <Landmark className="w-4 h-4 text-emerald-500" />
                                    Thông tin ngân hàng
                                </h3>

                                {/* Bank Dropdown */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-black/50">
                                        Chọn ngân hàng
                                    </Label>
                                    <div className="relative" ref={bankDropdownRef}>
                                        {/* Trigger */}
                                        <button
                                            type="button"
                                            onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg glass border border-black/10 text-sm text-left transition-colors focus:border-rose-500/50 outline-none"
                                        >
                                            {selectedBank ? (
                                                <>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={selectedBank.logo}
                                                        alt={selectedBank.shortName}
                                                        className="w-6 h-6 object-contain rounded"
                                                    />
                                                    <span className="flex-1 truncate text-black">
                                                        {selectedBank.shortName} — {selectedBank.name}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="flex-1 text-black/30">Chọn ngân hàng...</span>
                                            )}
                                            <ChevronDown className={`w-4 h-4 text-black/30 transition-transform ${bankDropdownOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {/* Dropdown */}
                                        <AnimatePresence>
                                            {bankDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -4 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl glass-card border border-black/10 shadow-lg max-h-64 overflow-hidden flex flex-col"
                                                >
                                                    {/* Search */}
                                                    <div className="p-2 border-b border-black/5">
                                                        <div className="relative">
                                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" />
                                                            <input
                                                                type="text"
                                                                value={bankSearch}
                                                                onChange={(e) => setBankSearch(e.target.value)}
                                                                placeholder="Tìm ngân hàng..."
                                                                className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/[0.03] border-none text-xs text-black placeholder-black/30 outline-none"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Bank list */}
                                                    <div className="overflow-y-auto flex-1">
                                                        {filteredBanks.map((bank) => (
                                                            <button
                                                                key={bank.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    selectBank(bank);
                                                                    setBankName(bank.shortName);
                                                                }}
                                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs hover:bg-black/[0.04] transition-colors ${selectedBank?.id === bank.id ? "bg-rose-50 text-rose-700" : "text-black/70"
                                                                    }`}
                                                            >
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={bank.logo}
                                                                    alt={bank.shortName}
                                                                    className="w-7 h-7 object-contain rounded bg-white p-0.5 border border-black/5"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold truncate">{bank.shortName}</p>
                                                                    <p className="text-[10px] text-black/40 truncate">{bank.name}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                        {filteredBanks.length === 0 && (
                                                            <p className="text-xs text-black/30 text-center py-4">Không tìm thấy ngân hàng</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Account Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="account-number" className="text-xs text-black/50">
                                        <CreditCard className="w-3 h-3" />
                                        Số tài khoản
                                    </Label>
                                    <input
                                        id="account-number"
                                        type="text"
                                        inputMode="numeric"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                                        placeholder="VD: 0123456789"
                                        className="w-full px-4 py-2.5 rounded-lg glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm font-mono tracking-wider"
                                    />
                                </div>

                                {/* Account Holder Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="account-holder" className="text-xs text-black/50">
                                        <User className="w-3 h-3" />
                                        Tên chủ tài khoản
                                    </Label>
                                    <input
                                        id="account-holder"
                                        type="text"
                                        value={accountHolderName}
                                        onChange={(e) => setAccountHolderName(removeDiacritics(e.target.value))}
                                        placeholder="VD: NGUYEN VAN A"
                                        className="w-full px-4 py-2.5 rounded-lg glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm uppercase tracking-wide"
                                    />
                                    <p className="text-[10px] text-black/30">Tự động viết hoa, không dấu (theo chuẩn ngân hàng)</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Right Column ────────────────────────────────────────── */}
                        <div className="space-y-6">
                            {/* Story Editor */}
                            <div className="space-y-2">
                                <Label className="text-black/70">
                                    <FileText className="w-4 h-4 text-indigo-500" />
                                    Câu chuyện chiến dịch
                                </Label>

                                {/* Toolbar */}
                                <div className="flex items-center gap-1 p-1.5 rounded-t-xl glass border border-black/10 border-b-0">
                                    <button
                                        type="button"
                                        onClick={() => execCmd("bold")}
                                        className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/50 hover:text-black"
                                        title="In đậm"
                                    >
                                        <Bold className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => execCmd("italic")}
                                        className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/50 hover:text-black"
                                        title="In nghiêng"
                                    >
                                        <Italic className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => execCmd("insertUnorderedList")}
                                        className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/50 hover:text-black"
                                        title="Danh sách"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-5 bg-black/10 mx-1" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const url = prompt("Nhập URL:");
                                            if (url) execCmd("createLink", url);
                                        }}
                                        className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/50 hover:text-black"
                                        title="Chèn liên kết"
                                    >
                                        <Link className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const url = prompt("Nhập URL hình ảnh:");
                                            if (url) execCmd("insertImage", url);
                                        }}
                                        className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/50 hover:text-black"
                                        title="Chèn hình ảnh"
                                    >
                                        <ImageLucide className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Editor */}
                                <div
                                    ref={storyEditorRef}
                                    contentEditable
                                    onInput={() => setStory(storyEditorRef.current?.innerText || "")}
                                    className="min-h-[200px] w-full px-4 py-3 rounded-b-xl glass border border-black/10 text-black text-sm outline-none focus:border-rose-500/50 transition-colors prose prose-sm max-w-none"
                                    data-placeholder="Kể câu chuyện về chiến dịch của bạn... (ít nhất 50 ký tự)"
                                    style={{
                                        minHeight: "200px",
                                    }}
                                    suppressContentEditableWarning
                                />
                                <p className="text-xs text-black/30 text-right">
                                    {(storyEditorRef.current?.innerText || story).length} ký tự
                                </p>
                            </div>

                            {/* Media Upload */}
                            <div className="space-y-2">
                                <Label className="text-black/70">
                                    <Upload className="w-4 h-4 text-pink-500" />
                                    Hình ảnh chiến dịch
                                </Label>

                                {/* Drop zone */}
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${isDragOver
                                        ? "border-rose-400 bg-rose-50/50"
                                        : "border-black/10 hover:border-rose-300 hover:bg-rose-50/20"
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) addFiles(e.target.files);
                                            e.target.value = "";
                                        }}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-rose-400" />
                                        </div>
                                        <p className="text-sm text-black/50">
                                            <span className="font-semibold text-rose-500">Nhấn để chọn</span> hoặc kéo thả ảnh vào đây
                                        </p>
                                        <p className="text-xs text-black/30">PNG, JPG, WEBP (tối đa 10MB)</p>
                                    </div>
                                </div>

                                {/* Previews */}
                                {mediaPreviews.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                                        {mediaPreviews.map((src, idx) => (
                                            <div key={idx} className="relative group">
                                                <div
                                                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${coverIndex === idx
                                                        ? "border-rose-500 ring-2 ring-rose-500/30"
                                                        : "border-transparent hover:border-black/20"
                                                        }`}
                                                    onClick={() => setCoverIndex(idx)}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={src}
                                                        alt={`Preview ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {coverIndex === idx && (
                                                        <div className="absolute top-1 left-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                                            <Star className="w-2.5 h-2.5" />
                                                            Bìa
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeMedia(idx);
                                                    }}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {mediaPreviews.length > 0 && (
                                    <p className="text-xs text-black/40">
                                        Nhấn vào ảnh để chọn làm ảnh bìa • {mediaPreviews.length} ảnh đã chọn
                                    </p>
                                )}
                            </div>

                            {/* Proof Documents */}
                            <div className="space-y-2">
                                <Label className="text-black/70">
                                    <FileCheck className="w-4 h-4 text-emerald-500" />
                                    Tài liệu chứng minh
                                </Label>
                                <p className="text-xs text-black/40">Tải lên giấy tờ xác minh chiến dịch (ảnh hoặc PDF, tối đa 10MB)</p>

                                {/* Drop zone */}
                                <div
                                    onDrop={handleProofDrop}
                                    onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setProofDragOver(true); }}
                                    onDragLeave={() => setProofDragOver(false)}
                                    onClick={() => proofInputRef.current?.click()}
                                    className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${proofDragOver
                                        ? "border-emerald-400 bg-emerald-50/50"
                                        : "border-black/10 hover:border-emerald-300 hover:bg-emerald-50/20"
                                        }`}
                                >
                                    <input
                                        ref={proofInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) addProofFiles(e.target.files);
                                            e.target.value = "";
                                        }}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <FileCheck className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <p className="text-sm text-black/50">
                                            <span className="font-semibold text-emerald-600">Nhấn để chọn</span> hoặc kéo thả tài liệu
                                        </p>
                                        <p className="text-xs text-black/30">PNG, JPG, WEBP, PDF</p>
                                    </div>
                                </div>

                                {/* Proof Previews */}
                                {proofPreviews.length > 0 && (
                                    <div className="space-y-2 mt-3">
                                        {proofPreviews.map((proof, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-black/10 bg-white/30 group"
                                            >
                                                {proof.type === "image" && proof.url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
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
                                        <p className="text-xs text-black/40">
                                            {proofPreviews.length} tài liệu đã chọn
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Validation Warnings ───────────────────────────────────── */}
                    {errors.length > 0 && title.length > 0 && (
                        <div className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                            <p className="font-semibold mb-1 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Lưu ý:
                            </p>
                            <ul className="list-disc list-inside space-y-0.5">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ── Actions ──────────────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 pt-6 border-t border-black/5">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/campaigns")}
                            className="order-3 sm:order-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Hủy
                        </Button>

                        <div className="flex-1" />

                        <Button
                            variant="outline"
                            onClick={handleSaveDraft}
                            className="order-2"
                        >
                            <Save className="w-4 h-4" />
                            Lưu Nháp
                        </Button>

                        <RainbowButton
                            colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
                            duration={3}
                            borderWidth={2}
                            onClick={() => {
                                if (isValid) setShowConfirm(true);
                            }}
                            className={!isValid ? "opacity-50 cursor-not-allowed" : ""}
                        >
                            <Send className="w-4 h-4" />
                            Gửi Duyệt
                        </RainbowButton>
                    </div>
                </motion.div>
            </div>

            {/* ── Confirmation Dialog ─────────────────────────────────────────── */}
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent size="default" className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-rose-100">
                            <Send className="w-6 h-6 text-rose-500" />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Xác nhận gửi duyệt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn gửi chiến dịch này để duyệt?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Summary */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-start">
                            <span className="text-black/50">Tiêu đề:</span>
                            <span className="font-semibold text-right max-w-[60%]">{title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-black/50">Mục tiêu:</span>
                            <span className="font-semibold text-rose-600">{formatVND(goalAmount)}₫</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-black/50">Hạn chót:</span>
                            <span className="font-semibold">{formatDateVN(deadline)}</span>
                        </div>
                        {category && (
                            <div className="flex justify-between">
                                <span className="text-black/50">Danh mục:</span>
                                <span className="font-semibold">
                                    {CATEGORY_LABELS[category as CampaignCategory]}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Bank Info Verification */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
                        <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5" />
                            Thông tin ngân hàng nhận tiền
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-3">
                                {selectedBank?.logo && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={selectedBank.logo}
                                        alt={bankName}
                                        className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-black/5 flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-black/80 truncate">{bankName || "Chưa chọn"}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-black/50 text-xs">Số tài khoản:</span>
                                <span className="font-mono font-semibold tracking-wider text-black/80">{accountNumber || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-black/50 text-xs">Chủ tài khoản:</span>
                                <span className="font-semibold uppercase text-black/80">{accountHolderName || "—"}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Vui lòng kiểm tra kỹ thông tin trước khi gửi
                        </p>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Quay lại</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit} variant="default">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Đang gửi...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Xác nhận gửi
                                </span>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Inline styles for contentEditable placeholder ──────────────── */}
            <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(0, 0, 0, 0.3);
          pointer-events: none;
        }
      `}</style>
        </div>
    );
}
