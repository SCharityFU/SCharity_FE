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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white rounded-xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-black/10">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-black mb-1">
                                    {update.title}
                                </h2>
                                <p className="text-sm text-black/50">
                                    {formatDate(update.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-black/50" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                            <RichTextContent 
                                content={update.content} 
                                className="text-base md:text-lg"
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/10">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors text-black font-medium"
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
