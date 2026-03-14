"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Lock, Send, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
    useCreateCampaignUpdateMutation,
    useUpdateCampaignUpdateMutation,
} from "@/lib/store/features/campaign/campaignApi";

interface UpdateEditModalProps {
    campaignId: string;
    isOpen: boolean;
    onClose: () => void;
    updateToEdit?: any;
}

export function UpdateEditModal({ campaignId, isOpen, onClose, updateToEdit }: UpdateEditModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isDraft, setIsDraft] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

    const [createUpdate, { isLoading: isCreating }] = useCreateCampaignUpdateMutation();
    const [updateUpdate, { isLoading: isUpdating }] = useUpdateCampaignUpdateMutation();

    const isLoading = isCreating || isUpdating;
    const isEditing = !!updateToEdit;

    useEffect(() => {
        if (updateToEdit) {
            setTitle(updateToEdit.title);
            setContent(updateToEdit.content);
            setIsDraft(updateToEdit.isDraft);
        } else {
            setTitle("");
            setContent("");
            setIsDraft(true);
        }
        setError(null);
        setActiveTab("edit");
    }, [updateToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (isEditing) {
                await updateUpdate({
                    campaignId,
                    updateId: updateToEdit.id,
                    data: { title, content, isDraft },
                }).unwrap();
            } else {
                await createUpdate({
                    campaignId,
                    data: { title, content, isDraft },
                }).unwrap();
            }
            onClose();
        } catch (err) {
            setError((err as any)?.data?.message || (err as Error).message);
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
                    <h2 className="text-2xl font-bold text-black">
                        {isEditing ? "Chỉnh sửa cập nhật" : "Thêm cập nhật mới"}
                    </h2>
                    <button
                        onClick={onClose}
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
                            onClick={() => setActiveTab("edit")}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                                activeTab === "edit"
                                    ? "border-black text-black"
                                    : "border-transparent text-black/50 hover:text-black/70"
                            }`}
                        >
                            <Edit3 className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("preview")}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                                    activeTab === "preview"
                                        ? "border-black text-black"
                                        : "border-transparent text-black/50 hover:text-black/70"
                                }`}
                            >
                                <Eye className="w-4 h-4" />
                                Xem trước
                            </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        {/* Edit Tab */}
                        {activeTab === "edit" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Error */}
                                {error && (
                                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">
                                        Tiêu đề <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ví dụ: Đã nhận được 500 quyên góp"
                                        maxLength={100}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30"
                                    />
                                    <p className="text-xs text-black/40 mt-1">{title.length}/100</p>
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">
                                        Nội dung <span className="text-rose-500">*</span>
                                    </label>
                                    <p className="text-xs text-black/50 mb-2">Mô tả chi tiết về tiến độ chiến dịch</p>
                                    <RichTextEditor
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Chi tiết về tiến độ, những thành quả đạt được..."
                                        minRequirements={50}
                                    />
                                    <p className="text-xs text-black/40 mt-1">Tối thiểu 50 ký tự</p>
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
                                                setActiveTab("preview");
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
                        {activeTab === "preview" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-blue-700 mb-1">XEM TRƯỚC BẢN CÔNG BỐ</p>
                                    <p className="text-sm text-blue-700">Đây là cách bài cập nhật sẽ hiển thị cho người quyên góp</p>
                                </div>

                                {/* Title Preview */}
                                <div>
                                    <p className="text-xs font-semibold text-black/50 mb-2">TIÊU ĐỀ</p>
                                    <h3 className="text-xl font-bold text-black">{title || "Tiêu đề của bạn..."}</h3>
                                </div>

                                {/* Content Preview */}
                                <div>
                                    <p className="text-xs font-semibold text-black/50 mb-3">NỘI DUNG</p>
                                    <div className="bg-white border border-black/10 rounded-xl p-4">
                                        {content ? (
                                            <RichTextContent 
                                                content={content} 
                                                className="text-base"
                                            />
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
                        <Button
                            type="submit"
                            disabled={isLoading || !title.trim() || content.length < 50}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    {isEditing ? "Đang cập nhật..." : "Đang tạo..."}
                                </>
                            ) : (
                                <>
                                    {isDraft ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                    {isEditing
                                        ? isDraft
                                            ? "Lưu dự thảo"
                                            : "Cập nhật công bố"
                                        : isDraft
                                        ? "Lưu dự thảo"
                                        : "Xuất bản cập nhật"}
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
