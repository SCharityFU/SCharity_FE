"use client";

import { useState, useCallback, useEffect, useRef, type ChangeEvent, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    ArrowLeft,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Plus,
    Landmark,
    Eye,
    Pencil,
    CalendarDays,
    Target,
    Tag,
    Info,
    CreditCard,
    User,
    Search,
    ChevronDown,
    Loader2,
    Save,
    ImageIcon,
    FileCheck,
    Upload,
    X,
    Star,
    DollarSign,
} from "lucide-react";
import { CampaignRequestStatus, CampaignCategory } from "@/dtos/enums";
import type { CampaignRequestResponseDto } from "@/dtos/campaign";
import { HighlightText } from "@/components/ui/highlight-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { Label } from "@/components/ui/label";
import { RichTextContent } from "@/components/ui/rich-text-content";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
    useGetMyRequestsQuery,
    useUpdateCampaignRequestMutation,
    useUpdateRequestBankInfoMutation,
} from "@/lib/store/features/campaign/campaignApi";
import { useVietQRBanks } from "@/hooks/useVietQRBanks";

/* ── Constants ──────────────────────────────────────────────────────── */

const TITLE_MAX = 100;
const GOAL_PRESETS = [5_000_000, 10_000_000, 50_000_000, 100_000_000];

const STATUS_CONFIG: Record<CampaignRequestStatus, { label: string; color: string; icon: typeof Clock }> = {
    [CampaignRequestStatus.PENDING]: { label: "Đang chờ", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock },
    [CampaignRequestStatus.APPROVED]: { label: "Đã duyệt", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    [CampaignRequestStatus.REJECTED]: { label: "Từ chối", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: XCircle },
};

const CATEGORY_LABELS: Record<string, string> = {
    [CampaignCategory.EDUCATION]: "Giáo dục",
    [CampaignCategory.MEDICAL]: "Y tế",
    [CampaignCategory.DISASTER]: "Thiên tai",
    [CampaignCategory.COMMUNITY]: "Cộng đồng",
    [CampaignCategory.ENVIRONMENT]: "Môi trường",
    [CampaignCategory.OTHER]: "Khác",
};

/* ── Helpers ────────────────────────────────────────────────────────── */

function fmtDate(iso: string): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtVND(v: number): string {
    return v.toLocaleString("vi-VN") + " ₫";
}

function formatVNDInput(v: number): string {
    return v.toLocaleString("vi-VN");
}

function parseCurrencyInput(raw: string): number {
    return Number(raw.replace(/\./g, "").replace(/\D/g, "")) || 0;
}

function shortVND(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)} tỷ`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} tr`;
    return formatVNDInput(n);
}

function getTomorrowISO(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

function fmtDateForDateInput(iso: string): string {
    if (!iso) return "";
    return new Date(iso).toISOString().split("T")[0];
}

function removeDiacritics(str: string): string {
    return str
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .replaceAll("đ", "d")
        .replaceAll("Đ", "D")
        .toUpperCase();
}

function plainTextFromHtml(html: string): string {
    return html
        .replaceAll(/<[^>]+>/g, " ")
        .replaceAll("&nbsp;", " ")
        .replaceAll(/\s+/g, " ")
        .trim();
}

function isTinyMceAuxTarget(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && Boolean(target.closest(".tox-tinymce-aux, .tox-dialog-wrap, .tox-menu"));
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function MyRequestsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, isFetching } = useGetMyRequestsQuery({ page, limit });

    const requests = data?.data ?? [];
    const totalPages = data?.pagination?.totalPages ?? 1;

    /* Detail modal */
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState<CampaignRequestResponseDto | null>(null);

    /* Bank modal */
    const [bankOpen, setBankOpen] = useState(false);
    const [bankReq, setBankReq] = useState<CampaignRequestResponseDto | null>(null);

    const openDetail = (req: CampaignRequestResponseDto) => {
        setSelectedReq(req);
        setIsEditing(false);
        setEditFeedback(null);
        setDetailOpen(true);
    };

    const openBankModal = (req: CampaignRequestResponseDto) => {
        setBankReq(req);
        setBankOpen(true);
    };

    /* Edit mode inside detail modal */
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editStory, setEditStory] = useState("");
    const [editGoalRaw, setEditGoalRaw] = useState("");
    const [editGoalAmount, setEditGoalAmount] = useState(0);
    const [editDeadline, setEditDeadline] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [updateRequest, { isLoading: isUpdating }] = useUpdateCampaignRequestMutation();
    const [editFeedback, setEditFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

    /* Media state for edit mode */
    const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
    const [editMediaPreviews, setEditMediaPreviews] = useState<string[]>([]);
    const [editCoverIndex, setEditCoverIndex] = useState(0);
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [editIsDragOver, setEditIsDragOver] = useState(false);

    /* Proof documents state */
    const [editProofFiles, setEditProofFiles] = useState<File[]>([]);
    const [editProofPreviews, setEditProofPreviews] = useState<{ name: string; type: string; url: string }[]>([]);
    const editProofInputRef = useRef<HTMLInputElement>(null);
    const [editProofDragOver, setEditProofDragOver] = useState(false);

    const handleEditGoalChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const num = parseCurrencyInput(raw);
        setEditGoalAmount(num);
        setEditGoalRaw(num > 0 ? formatVNDInput(num) : "");
    };

    const handleEditGoalPreset = (preset: number) => {
        setEditGoalAmount(preset);
        setEditGoalRaw(formatVNDInput(preset));
    };

    const addEditFiles = useCallback((files: FileList | File[]) => {
        const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
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

    /* Proof document handlers */
    const addProofFiles = useCallback((files: FileList | File[]) => {
        const allowed = Array.from(files).filter(
            (f) => f.type.startsWith("image/") || f.type === "application/pdf"
        );
        if (allowed.length === 0) return;
        setEditProofFiles((prev) => [...prev, ...allowed]);
        allowed.forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setEditProofPreviews((prev) => [...prev, {
                        name: file.name,
                        type: "image",
                        url: ev.target?.result as string,
                    }]);
                };
                reader.readAsDataURL(file);
            } else {
                setEditProofPreviews((prev) => [...prev, {
                    name: file.name,
                    type: "pdf",
                    url: "",
                }]);
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
        setEditStory(selectedReq.story || "");
        setEditGoalAmount(selectedReq.goalAmount);
        setEditGoalRaw(formatVNDInput(selectedReq.goalAmount));
        setEditDeadline(fmtDateForDateInput(selectedReq.deadline));
        setEditCategory(selectedReq.category ?? "other");
        setEditFeedback(null);
        // Pre-fill existing media as previews (URLs from server)
        const existingPreviews: string[] = [];
        if (selectedReq.thumbnailUrl) existingPreviews.push(selectedReq.thumbnailUrl);
        if (selectedReq.mediaUrls) existingPreviews.push(...selectedReq.mediaUrls);
        setEditMediaPreviews(existingPreviews);
        setEditMediaFiles([]);
        setEditCoverIndex(0);
        // Pre-fill existing proof documents
        const existingProofs: { name: string; type: string; url: string }[] = [];
        if (selectedReq.proofDocuments) {
            selectedReq.proofDocuments.forEach((url) => {
                const isPdf = url.toLowerCase().endsWith(".pdf");
                existingProofs.push({
                    name: url.split("/").pop() || "document",
                    type: isPdf ? "pdf" : "image",
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
        // Only send actual File objects (not existing URL previews from server)
        const newFiles = editMediaFiles.filter((f) => f instanceof File);
        // Separate cover (thumbnail) from other media
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
            setEditFeedback({ type: "success", text: "Cập nhật yêu cầu thành công!" });
            if (result.data) setSelectedReq(result.data);
            setTimeout(() => {
                setIsEditing(false);
                setEditFeedback(null);
            }, 1200);
        } catch (err: unknown) {
            const msg = (err as { data?: { message?: string } })?.data?.message || "Có lỗi xảy ra.";
            setEditFeedback({ type: "error", text: msg });
        }
    };

    /* Which request is "active" (has a modal open) — for border highlight */
    const activeReqId = detailOpen ? selectedReq?.id : bankOpen ? bankReq?.id : null;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="flex items-center gap-1 text-sm text-black/40 hover:text-black/70 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Dashboard
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-black">
                            <HighlightText variant="underline" color="primary">
                                Yêu Cầu Tạo Chiến Dịch
                            </HighlightText>
                        </h1>
                        <p className="text-black/50 text-sm mt-2">
                            Danh sách các yêu cầu tạo chiến dịch bạn đã gửi
                        </p>
                    </div>
                    <Magnetic intensity={0.3} range={60}>
                        <Link href="/campaigns/create">
                            <RainbowButton
                                colors={["#f43f5e", "#8b5cf6", "#f43f5e"]}
                                duration={2.5}
                                borderWidth={1.5}
                                className="text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo Mới
                            </RainbowButton>
                        </Link>
                    </Magnetic>
                </div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
                            <div key={key} className="glass-card rounded-2xl p-5 animate-pulse flex flex-col" style={{ minHeight: 280 }}>
                                <div className="h-5 bg-black/10 rounded w-1/2 mb-3" />
                                <div className="h-4 bg-black/10 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-black/10 rounded w-full mb-2" />
                                <div className="h-3 bg-black/10 rounded w-2/3 mb-2" />
                                <div className="h-12 bg-black/10 rounded w-full mb-3 mt-auto" />
                                <div className="h-8 bg-black/10 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && requests.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <FileText className="w-12 h-12 text-black/20 mx-auto mb-4" />
                        <p className="text-black/50 text-lg mb-2">Chưa có yêu cầu nào</p>
                        <p className="text-black/30 text-sm mb-6">Hãy tạo chiến dịch gây quỹ đầu tiên của bạn</p>
                        <Link href="/campaigns/create">
                            <Button>
                                <Plus className="w-4 h-4" />
                                Tạo Chiến Dịch
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Request Cards — Portrait Grid */}
                {!isLoading && requests.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <AnimatePresence mode="popLayout">
                                {requests.map((req: CampaignRequestResponseDto, i: number) => {
                                    const statusCfg = STATUS_CONFIG[req.status as CampaignRequestStatus];
                                    const StatusIcon = statusCfg.icon;
                                    const isActive = activeReqId === req.id;
                                    return (
                                        <motion.div
                                            key={req.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`glass-card rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col ${isActive
                                                ? "ring-2 ring-rose-400 shadow-lg shadow-rose-500/10"
                                                : ""
                                                }`}
                                        >
                                            {/* Thumbnail */}
                                            {req.thumbnailUrl && (
                                                <div className="mb-3 rounded-xl overflow-hidden border border-black/10 bg-black/[0.02]">
                                                    <img
                                                        src={req.thumbnailUrl}
                                                        alt={req.title}
                                                        className="w-full h-36 object-cover"
                                                    />
                                                </div>
                                            )}

                                            {/* Top: Status + Category */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.color}`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusCfg.label}
                                                </span>
                                                {req.category && (
                                                    <span className="text-[11px] text-black/40 flex items-center gap-1">
                                                        <Tag className="w-3 h-3" />
                                                        {CATEGORY_LABELS[req.category] ?? req.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-bold text-black text-[15px] leading-snug mb-2 line-clamp-2">
                                                {req.title}
                                            </h3>

                                            {/* Story preview */}
                                            <p className="text-xs text-black/50 line-clamp-2 leading-relaxed mb-3 flex-1">
                                                <RichTextContent content={req.story} />
                                            </p>

                                            {/* Key Info */}
                                            <div className="space-y-1.5 mb-3">
                                                <div className="flex items-center gap-2 text-xs text-black/60">
                                                    <Target className="w-3 h-3 text-rose-400 shrink-0" />
                                                    <span className="font-semibold">{fmtVND(req.goalAmount)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-black/50">
                                                    <CalendarDays className="w-3 h-3 text-violet-400 shrink-0" />
                                                    <span>Hạn: {fmtDate(req.deadline)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-black/40">
                                                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                                    <span>Gửi: {fmtDate(req.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Bank info short */}
                                            {req.bankInfo && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-black/35 mb-3 px-2 py-1.5 rounded-lg bg-black/[0.03]">
                                                    <Landmark className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">
                                                        {req.bankInfo.bankName} — ****{req.bankInfo.accountNumber.slice(-4)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Reject reason */}
                                            {req.rejectReason && (
                                                <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 mb-3">
                                                    <p className="text-[11px] text-rose-500 line-clamp-2">
                                                        <strong>Từ chối:</strong> {req.rejectReason}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action buttons — stacked */}
                                            <div className="flex flex-col gap-1.5 pt-3 border-t border-black/5 mt-auto">
                                                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => openDetail(req)}>
                                                    <Eye className="w-3 h-3" />
                                                    Xem Chi Tiết
                                                </Button>
                                                <div className="flex gap-1.5">
                                                    {req.status === CampaignRequestStatus.PENDING && (
                                                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openBankModal(req)}>
                                                            <Landmark className="w-3 h-3" />
                                                            Sửa Bank
                                                        </Button>
                                                    )}
                                                    {req.campaignId && (
                                                        <Link href={`/campaigns/${req.campaignId}`} className="flex-1">
                                                            <Button variant="ghost" size="sm" className="w-full text-xs">
                                                                <Eye className="w-3 h-3" />
                                                                Xem CD
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1 || isFetching}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-black/50">
                                    Trang {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages || isFetching}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Detail Modal ─────────────────────────────────────────── */}
            <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) { setIsEditing(false); setEditFeedback(null); } }}>
                <DialogContent
                    className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
                    showCloseButton={false}
                    onInteractOutside={(event) => {
                        if (isTinyMceAuxTarget(event.target)) {
                            event.preventDefault();
                        }
                    }}
                    onFocusOutside={(event) => {
                        if (isTinyMceAuxTarget(event.target)) {
                            event.preventDefault();
                        }
                    }}
                >
                    {selectedReq && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-rose-400" />
                                    Chi Tiết Yêu Cầu
                                </DialogTitle>
                                <DialogDescription>
                                    Thông tin đầy đủ về yêu cầu tạo chiến dịch
                                </DialogDescription>
                            </DialogHeader>

                            {/* Feedback */}
                            {editFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3 rounded-xl border text-sm font-medium ${editFeedback.type === "success"
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                        : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                                        }`}
                                >
                                    {editFeedback.text}
                                </motion.div>
                            )}

                            {/* ── View Mode ── */}
                            {!isEditing ? (
                                <div className="space-y-4">
                                    {/* Status + Category badges */}
                                    {(() => {
                                        const cfg = STATUS_CONFIG[selectedReq.status as CampaignRequestStatus];
                                        const Icon = cfg.icon;
                                        return (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
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

                                    {/* Title */}
                                    <div>
                                        <p className="text-xs text-black/40 mb-1">Tiêu đề</p>
                                        <p className="font-bold text-black text-lg">{selectedReq.title}</p>
                                    </div>

                                    {/* Info grid: numbers + bank side-by-side */}
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

                                        {/* Bank info card — spans full row, compact inline */}
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
                                                        <p className="font-semibold text-black text-sm font-mono">{selectedReq.bankInfo.accountNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-black/30">Chủ TK</p>
                                                        <p className="font-semibold text-black text-sm">{selectedReq.bankInfo.accountHolderName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Story */}
                                    <div>
                                        <p className="text-xs text-black/40 mb-1">Câu chuyện</p>
                                        <div className="rounded-xl bg-black/[0.03] p-4 max-h-40 overflow-y-auto">
                                            <RichTextContent content={selectedReq.story} />
                                        </div>
                                    </div>

                                    {/* Thumbnail */}
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

                                    {/* Media */}
                                    {selectedReq.mediaUrls && selectedReq.mediaUrls.length > 0 && (
                                        <div>
                                            <p className="text-xs text-black/40 mb-1 flex items-center gap-1.5">
                                                <ImageIcon className="w-3.5 h-3.5" /> Hình ảnh ({selectedReq.mediaUrls.length})
                                            </p>
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {selectedReq.mediaUrls.map((url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt={`Media ${idx + 1}`}
                                                        className="w-24 h-24 object-cover rounded-lg shrink-0"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Proof docs */}
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

                                    {/* Reject reason */}
                                    {selectedReq.rejectReason && (
                                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                            <p className="text-sm text-rose-500">
                                                <strong>Lý do từ chối:</strong> {selectedReq.rejectReason}
                                            </p>
                                        </div>
                                    )}

                                    {/* Reviewed info */}
                                    {selectedReq.reviewedAt && (
                                        <div className="text-xs text-black/30">
                                            Duyệt lúc: {fmtDate(selectedReq.reviewedAt)}
                                            {selectedReq.reviewedBy && (
                                                <> bởi {selectedReq.reviewedBy.fullName ?? "Admin"}</>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ── Edit Mode ── */
                                <div className="space-y-5">
                                    {/* ── Title ── */}
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
                                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${editTitle.length >= TITLE_MAX ? "text-rose-500 font-semibold" : "text-black/30"}`}>
                                                {editTitle.length}/{TITLE_MAX}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── Goal Amount ── */}
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
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-black/40">₫</span>
                                        </div>
                                        {/* Quick presets */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {GOAL_PRESETS.map((preset) => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => handleEditGoalPreset(preset)}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${editGoalAmount === preset
                                                        ? "bg-rose-500 text-white shadow-sm"
                                                        : "bg-black/[0.04] border border-black/10 text-black/50 hover:text-black hover:border-rose-400/30"
                                                        }`}
                                                >
                                                    {shortVND(preset)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Deadline + Category row ── */}
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
                                                <p className="text-[11px] text-black/40">
                                                    Ngày kết thúc: {fmtDate(editDeadline)}
                                                </p>
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
                                                    <option key={val} value={val}>{lab}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* ── Story (Rich Text Editor) ── */}
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                            Câu chuyện chiến dịch
                                        </Label>
                                        <RichTextEditor
                                            value={editStory}
                                            onChange={setEditStory}
                                            minHeight={160}
                                            placeholder="Kể câu chuyện về chiến dịch... (ít nhất 50 ký tự)"
                                        />
                                        <p className="text-[11px] text-black/30 text-right">
                                            {plainTextFromHtml(editStory).length} ký tự • Tối thiểu 50
                                        </p>
                                    </div>

                                    {/* ── Upload Media ── */}
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                                            <Upload className="w-3.5 h-3.5 text-pink-500" />
                                            Hình ảnh chiến dịch
                                        </Label>

                                        {/* Drop zone */}
                                        <div
                                            onDrop={handleEditDrop}
                                            onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setEditIsDragOver(true); }}
                                            onDragLeave={() => setEditIsDragOver(false)}
                                            onClick={() => editFileInputRef.current?.click()}
                                            className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 ${editIsDragOver
                                                ? "border-rose-400 bg-rose-50/50"
                                                : "border-black/10 hover:border-rose-300 hover:bg-rose-50/20"
                                                }`}
                                        >
                                            <input
                                                ref={editFileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files) addEditFiles(e.target.files);
                                                    e.target.value = "";
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

                                        {/* Media Previews */}
                                        {editMediaPreviews.length > 0 && (
                                            <>
                                                <div className="grid grid-cols-4 gap-2 mt-2">
                                                    {editMediaPreviews.map((src, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <div
                                                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${editCoverIndex === idx
                                                                    ? "border-rose-500 ring-2 ring-rose-500/30"
                                                                    : "border-transparent hover:border-black/20"
                                                                    }`}
                                                                onClick={() => setEditCoverIndex(idx)}
                                                            >
                                                                <img
                                                                    src={src}
                                                                    alt={`Preview ${idx + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                {editCoverIndex === idx && (
                                                                    <div className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                                                        <Star className="w-2 h-2" />
                                                                        Bìa
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); removeEditMedia(idx); }}
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

                                    {/* ── Proof Documents ── */}
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-black/70 flex items-center gap-1.5">
                                            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                                            Tài liệu chứng minh
                                        </Label>
                                        <p className="text-[11px] text-black/40">Tải lên giấy tờ xác minh chiến dịch (ảnh hoặc PDF)</p>

                                        {/* Drop zone */}
                                        <div
                                            onDrop={handleProofDrop}
                                            onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setEditProofDragOver(true); }}
                                            onDragLeave={() => setEditProofDragOver(false)}
                                            onClick={() => editProofInputRef.current?.click()}
                                            className={`relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-300 ${editProofDragOver
                                                    ? "border-emerald-400 bg-emerald-50/50"
                                                    : "border-black/10 hover:border-emerald-300 hover:bg-emerald-50/20"
                                                }`}
                                        >
                                            <input
                                                ref={editProofInputRef}
                                                type="file"
                                                multiple
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files) addProofFiles(e.target.files);
                                                    e.target.value = "";
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

                                        {/* Proof Previews */}
                                        {editProofPreviews.length > 0 && (
                                            <div className="space-y-1.5 mt-2">
                                                {editProofPreviews.map((proof, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-2.5 rounded-lg border border-black/10 bg-white/30 group"
                                                    >
                                                        {proof.type === "image" && proof.url ? (
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
                                                <p className="text-[11px] text-black/40">
                                                    {editProofPreviews.length} tài liệu đã chọn
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <DialogFooter>
                                {!isEditing ? (
                                    <>
                                        <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
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
                                            {isUpdating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            Lưu Thay Đổi
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Bank Edit Modal ──────────────────────────────────────── */}
            <BankEditModal
                open={bankOpen}
                onOpenChange={setBankOpen}
                request={bankReq}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   Bank Edit Modal
   ═══════════════════════════════════════════════════════════════════════ */

function BankEditModal({
    open,
    onOpenChange,
    request,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    request: CampaignRequestResponseDto | null;
}) {
    const [updateBankInfo, { isLoading }] = useUpdateRequestBankInfoMutation();

    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        bankList,
        bankSearch,
        setBankSearch,
        bankDropdownOpen,
        setBankDropdownOpen,
        selectedBank,
        setSelectedBank,
        bankDropdownRef,
        filteredBanks,
        selectBank,
    } = useVietQRBanks();

    useEffect(() => {
        if (!open || !request?.bankInfo) return;
        const { bankName, accountNumber: acNum, accountHolderName: acHolder } = request.bankInfo;
        setAccountNumber(acNum ?? "");
        setAccountHolderName(acHolder ?? "");
        setFeedback(null);
        setShowConfirm(false);
        if (bankList.length > 0) {
            const match = bankList.find(
                (b) =>
                    b.shortName.toLowerCase() === bankName.toLowerCase() ||
                    b.name.toLowerCase() === bankName.toLowerCase(),
            );
            if (match) setSelectedBank(match);
        }
    }, [open, request, bankList, setSelectedBank]);

    const handleAccountNumber = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setAccountNumber(e.target.value.replaceAll(/\D/g, ""));
    }, []);

    const handleAccountHolderName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setAccountHolderName(removeDiacritics(e.target.value));
    }, []);

    const isFormValid = selectedBank && accountNumber.length >= 6 && accountHolderName.length >= 2;

    const handleSubmit = async () => {
        if (!selectedBank || !isFormValid || !request) return;
        try {
            await updateBankInfo({
                requestId: request.id,
                bankInfo: {
                    bankName: selectedBank.shortName,
                    accountNumber,
                    accountHolderName,
                },
            }).unwrap();
            setShowConfirm(false);
            setFeedback({ type: "success", text: "Cập nhật thông tin ngân hàng thành công!" });
            setTimeout(() => onOpenChange(false), 1500);
        } catch (err: unknown) {
            setShowConfirm(false);
            const msg = (err as { data?: { message?: string } })?.data?.message || "Có lỗi xảy ra.";
            setFeedback({ type: "error", text: msg });
        }
    };

    if (!request) return null;

    return (
        <>
            <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <Landmark className="w-5 h-5 text-violet-400" />
                            Sửa Thông Tin Ngân Hàng
                        </DialogTitle>
                        <DialogDescription>
                            Cập nhật tài khoản ngân hàng cho yêu cầu &ldquo;{request.title}&rdquo;
                        </DialogDescription>
                    </DialogHeader>

                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-xl border text-sm font-medium ${feedback.type === "success"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                                }`}
                        >
                            {feedback.text}
                        </motion.div>
                    )}

                    <div className="space-y-5">
                        {/* Bank Dropdown */}
                        <div>
                            <Label className="text-sm font-semibold text-black/70 mb-2 flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-black/40" />
                                Chọn Ngân Hàng
                            </Label>
                            <div ref={bankDropdownRef} className="relative">
                                <button
                                    type="button"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 cursor-pointer flex items-center justify-between hover:border-black/20 transition-colors text-left"
                                    onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                                >
                                    {selectedBank ? (
                                        <div className="flex items-center gap-3">
                                            <img src={selectedBank.logo} alt={selectedBank.shortName} className="w-8 h-8 object-contain rounded" />
                                            <div>
                                                <p className="text-sm font-semibold text-black">{selectedBank.shortName}</p>
                                                <p className="text-xs text-black/40">{selectedBank.name}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-black/40 text-sm">-- Chọn ngân hàng --</span>
                                    )}
                                    <ChevronDown className={`w-4 h-4 text-black/30 transition-transform ${bankDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                {bankDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-black/10 shadow-2xl max-h-72 overflow-hidden"
                                    >
                                        <div className="p-3 border-b border-black/5">
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5">
                                                <Search className="w-4 h-4 text-black/30" />
                                                <input
                                                    type="text"
                                                    value={bankSearch}
                                                    onChange={(e) => setBankSearch(e.target.value)}
                                                    placeholder="Tìm ngân hàng..."
                                                    className="bg-transparent outline-none text-sm flex-1 text-black placeholder:text-black/30"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-56 overflow-y-auto">
                                            {filteredBanks.length === 0 ? (
                                                <p className="text-center text-black/30 text-sm py-6">Không tìm thấy</p>
                                            ) : (
                                                filteredBanks.map((bank) => (
                                                    <button
                                                        type="button"
                                                        key={bank.id}
                                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors w-full text-left ${selectedBank?.id === bank.id ? "bg-rose-500/5" : ""}`}
                                                        onClick={() => selectBank(bank)}
                                                    >
                                                        <img src={bank.logo} alt={bank.shortName} className="w-8 h-8 object-contain rounded" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-black truncate">{bank.shortName}</p>
                                                            <p className="text-xs text-black/40 truncate">{bank.name}</p>
                                                        </div>
                                                        {selectedBank?.id === bank.id && (
                                                            <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Account Number */}
                        <div>
                            <Label className="text-sm font-semibold text-black/70 mb-2 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-black/40" />
                                Số Tài Khoản
                            </Label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={accountNumber}
                                onChange={handleAccountNumber}
                                placeholder="Nhập số tài khoản"
                                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30 text-sm tracking-wider font-mono"
                                maxLength={20}
                            />
                            <p className="text-xs text-black/30 mt-1">Chỉ được nhập số</p>
                        </div>

                        {/* Account Holder Name */}
                        <div>
                            <Label className="text-sm font-semibold text-black/70 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-black/40" />
                                Tên Chủ Tài Khoản
                            </Label>
                            <input
                                type="text"
                                value={accountHolderName}
                                onChange={handleAccountHolderName}
                                placeholder="VD: NGUYEN VAN A"
                                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30 text-sm uppercase tracking-wider font-mono"
                            />
                            <p className="text-xs text-black/30 mt-1">Tự động viết hoa, không dấu (theo chuẩn ngân hàng)</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Đóng</Button>
                        <Button onClick={() => setShowConfirm(true)} disabled={!isFormValid || isLoading}>
                            <CheckCircle2 className="w-4 h-4" />
                            Xác Nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation sub-dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Xác nhận thông tin ngân hàng</DialogTitle>
                        <DialogDescription>Vui lòng kiểm tra kỹ thông tin trước khi lưu</DialogDescription>
                    </DialogHeader>
                    <div className="rounded-xl bg-black/5 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            {selectedBank && (
                                <img src={selectedBank.logo} alt={selectedBank.shortName} className="w-10 h-10 object-contain rounded" />
                            )}
                            <div>
                                <p className="text-xs text-black/40">Ngân hàng</p>
                                <p className="font-bold text-black">{selectedBank?.shortName ?? "—"}</p>
                            </div>
                        </div>
                        <div className="border-t border-black/10 pt-3">
                            <p className="text-xs text-black/40">Số tài khoản</p>
                            <p className="font-bold text-black font-mono tracking-wider text-lg">{accountNumber}</p>
                        </div>
                        <div className="border-t border-black/10 pt-3">
                            <p className="text-xs text-black/40">Tên chủ tài khoản</p>
                            <p className="font-bold text-black tracking-wider">{accountHolderName}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isLoading}>
                            Kiểm tra lại
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            Xác Nhận Lưu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
