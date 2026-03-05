"use client";
import Link from "next/link";
import { Heart, Users, Clock } from "lucide-react";
import { NumberCounter } from "@/components/ui/number-counter";
import { HighlightText } from "@/components/ui/highlight-text";
import { useState } from "react";

export interface Campaign {
    id: string;
    title: string;
    description: string;
    category: string;
    raised: number;
    goal: number;
    donors: number;
    daysLeft: number;
    imageGradient: string;
    emoji: string;
    highlight?: "underline" | "circle" | "marker";
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
    const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
    const [liked, setLiked] = useState(false);

    return (
        <Link href={`/campaigns/${campaign.id}`} className="block group">
            <div className="glass-card rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
                {/* Image area */}
                <div className={`h-48 ${campaign.imageGradient} relative flex items-center justify-center overflow-hidden`}>
                    <span className="text-6xl z-10">{campaign.emoji}</span>
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium glass text-white">
                        {campaign.category}
                    </span>
                    {/* Like button */}
                    <button
                        className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
                        onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
                        aria-label="Like campaign"
                    >
                        <Heart className={`w-4 h-4 transition-colors ${liked ? "text-rose-500 fill-rose-500" : "text-white"}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-semibold text-base text-white mb-2 line-clamp-2 group-hover:text-rose-300 transition-colors">
                        <HighlightText variant={campaign.highlight || "underline"} color="primary" animate className="text-white group-hover:text-rose-300">
                            {campaign.title}
                        </HighlightText>
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-2 mb-4">{campaign.description}</p>

                    {/* Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs text-white/60">Đã quyên góp</span>
                            <span className="text-xs font-semibold text-rose-400">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-white/50">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-white text-sm">
                                <NumberCounter value={campaign.raised} prefix="₫" suffix="tr" duration={1.5} />
                            </span>
                            <span>/ {campaign.goal}tr</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{campaign.donors}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{campaign.daysLeft}d</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
