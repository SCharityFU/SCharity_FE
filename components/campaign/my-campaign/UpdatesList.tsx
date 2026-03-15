"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { formatDate } from "@/lib/utils";

interface Update {
    id: string;
    title: string;
    content: string;
    isDraft: boolean;
    createdAt: string;
}

interface UpdatesListProps {
    updates: Update[];
    isLoading: boolean;
    updateFilter: "all" | "draft" | "published";
    deleteConfirm: string | null;
    setDeleteConfirm: (id: string | null) => void;
    onEdit: (update: Update) => void;
    onDelete: (updateId: string) => void;
    onViewDetail: (update: Update) => void;
}

const ITEMS_PER_PAGE = 3;

export function UpdatesList({
    updates,
    isLoading,
    updateFilter,
    deleteConfirm,
    setDeleteConfirm,
    onEdit,
    onDelete,
    onViewDetail,
}: UpdatesListProps) {
    const [expandedCount, setExpandedCount] = useState(ITEMS_PER_PAGE);

    const displayedUpdates = updates.slice(0, expandedCount);
    const hasMore = updates.length > expandedCount;

    const handleViewMore = () => {
        setExpandedCount((prev) => prev + ITEMS_PER_PAGE);
    };

    const handleViewLess = () => {
        setExpandedCount(ITEMS_PER_PAGE);
    };

    if (isLoading) {
        return <div className="text-center py-8 text-black/40">Đang tải cập nhật...</div>;
    }

    if (updates.length === 0) {
        return (
            <div className="text-center py-12 text-black/40">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có cập nhật nào</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {displayedUpdates.map((update) => (
                    <motion.div
                        key={update.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-black/5 rounded-lg p-4 border border-black/10 hover:border-black/20 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                                <h4 className="font-semibold text-black line-clamp-1">
                                    {update.title}
                                </h4>
                                <p className="text-xs text-black/50">
                                    {formatDate(update.createdAt)}
                                </p>
                            </div>
                            {update.isDraft && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-700 border border-amber-500/30 shrink-0">
                                    🔒 Dự thảo
                                </span>
                            )}
                        </div>

                        {/* Rich text content */}
                        <div className="text-sm text-black/60 mb-3 line-clamp-3 [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0">
                            <RichTextContent content={update.content} className="prose-sm" />
                        </div>

                        {/* Update Actions */}
                        <div className="flex gap-2">
                            {update.isDraft ? (
                                <>
                                    {/* Draft - Edit button */}
                                    <button
                                        onClick={() => onEdit(update)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors text-black/70 text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Chỉnh sửa
                                    </button>

                                    {/* Delete button */}
                                    {deleteConfirm === update.id ? (
                                        <>
                                            <button
                                                onClick={() => onDelete(update.id)}
                                                className="px-3 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 transition-colors text-white text-sm font-medium flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Xác nhận
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-3 py-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors text-black/70 text-sm font-medium"
                                            >
                                                Hủy
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(update.id)}
                                            aria-label="Xóa cập nhật"
                                            className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 transition-colors text-rose-700 text-sm font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Published - View detail button only */}
                                    <button
                                        onClick={() => onViewDetail(update)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Xem chi tiết
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* View more / less buttons */}
            {updates.length > ITEMS_PER_PAGE && (
                <div className="flex gap-2 pt-4 border-t">
                    {expandedCount < updates.length && (
                        <Button
                            onClick={handleViewMore}
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            Xem thêm ({updates.length - expandedCount} cái)
                        </Button>
                    )}
                    {expandedCount > ITEMS_PER_PAGE && (
                        <Button
                            onClick={handleViewLess}
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            Thu gọn
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
