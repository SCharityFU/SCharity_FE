"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RichTextContent } from "@/components/ui/rich-text-content";

interface Update {
    id: string;
    title: string;
    content: string;
    isDraft: boolean;
    createdAt: string;
}

interface UpdateDetailModalProps {
    isOpen: boolean;
    update: Update | null;
    onClose: () => void;
    formatDate: (date: string) => string;
}

export function UpdateDetailModal({
    isOpen,
    update,
    onClose,
    formatDate,
}: UpdateDetailModalProps) {
    if (!update) return null;

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
                        style={{ width: "calc(40% - 1rem)", maxHeight: "80vh" }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-black/10 flex-shrink-0">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-black mb-1 truncate">
                                    {update.title}
                                </h2>
                                <p className="text-xs text-black/50">
                                    {formatDate(update.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4 text-black/50" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <RichTextContent 
                                content={update.content} 
                                className="text-sm md:text-base"
                            />
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
