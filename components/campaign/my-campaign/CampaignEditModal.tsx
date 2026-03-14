"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useUpdateCampaignMutation } from "@/lib/store/features/campaign/campaignApi";
import type { CampaignDto } from "@/dtos/campaign";

interface CampaignEditModalProps {
    campaign: CampaignDto;
    isOpen: boolean;
    onClose: () => void;
}

export function CampaignEditModal({ campaign, isOpen, onClose }: CampaignEditModalProps) {
    const [story, setStory] = useState("");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [updateCampaign, { isLoading }] = useUpdateCampaignMutation();

    useEffect(() => {
        if (isOpen && campaign) {
            setStory(campaign.story || "");
            setThumbnailPreview(campaign.thumbnailUrl || "");
            setThumbnail(null);
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, campaign]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setThumbnailPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append("story", story);
            if (thumbnail) {
                formData.append("thumbnail", thumbnail);
            }

            await updateCampaign({
                campaignId: campaign.id,
                data: formData,
            }).unwrap();

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
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
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-black">Sửa chiến dịch</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm">
                            ✓ Cập nhật chiến dịch thành công!
                        </div>
                    )}

                    {/* Thumbnail Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-3">
                            Ảnh bìa
                        </label>
                        <div className="space-y-3">
                            {/* Preview */}
                            {thumbnailPreview && (
                                <div className="rounded-xl overflow-hidden h-48 bg-black/5 border border-black/10">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Upload Area */}
                            <label className="block">
                                <div className="border-2 border-dashed border-black/20 rounded-xl p-6 text-center cursor-pointer hover:border-black/40 hover:bg-black/5 transition-all">
                                    <Upload className="w-8 h-8 text-black/40 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-black mb-1">
                                        Nhấp để chọn ảnh hoặc kéo thả
                                    </p>
                                    <p className="text-xs text-black/40">
                                        JPG, PNG (Tối đa 5MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Story */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Câu chuyện
                        </label>
                        <p className="text-xs text-black/50 mb-2">Chia sẻ câu chuyện đằng sau chiến dịch của bạn</p>
                        <RichTextEditor
                            value={story}
                            onChange={setStory}
                            placeholder="Kể về chiến dịch, lý do, ảnh hưởng mong muốn..."
                            minRequirements={0}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <span>✓</span>
                                    Lưu thay đổi
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
