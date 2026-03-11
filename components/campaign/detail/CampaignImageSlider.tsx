"use client";
import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignImageSliderProps {
  images: string[];
}

export function CampaignImageSlider({ images }: CampaignImageSliderProps) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + images.length) % images.length),
    [images.length],
  );

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % images.length),
    [images.length],
  );

  // Reset to first slide when image list changes
  useEffect(() => {
    setCurrent(0);
  }, [images.length]);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (images.length === 0) {
    return (
      <div className="aspect-video rounded-2xl bg-gradient-to-br from-rose-500/10 via-violet-500/8 to-blue-500/8 border border-black/5 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/70 border border-black/8 flex items-center justify-center shadow-sm">
          <Heart className="w-6 h-6 text-rose-400 fill-rose-400/30" />
        </div>
        <p className="text-xs text-black/30 font-medium">Chưa có ảnh minh hoạ</p>
      </div>
    );
  }

  // ── Single image (no controls needed) ──────────────────────────────────────
  if (images.length === 1) {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden bg-black/5 shadow-sm">
        <img
          src={images[0]}
          alt="campaign-image"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // ── Slider ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative group overflow-hidden rounded-2xl bg-black/5 shadow-sm select-none">
      {/* ── Slides ───────────────────────────────────────────────────────────── */}
      <div className="aspect-video relative overflow-hidden">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`slide-${i + 1}`}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out",
              i === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
            )}
          />
        ))}

        {/* Bottom gradient for dots readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent z-20 pointer-events-none" />

        {/* ── Image counter badge ──────────────────────────────────────────── */}
        <div className="absolute bottom-3.5 right-4 z-30 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold tracking-wide">
          {current + 1} / {images.length}
        </div>

        {/* ── Dot indicators ───────────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current
                  ? "w-5 bg-white shadow-sm"
                  : "w-1.5 bg-white/40 hover:bg-white/65",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Prev arrow ───────────────────────────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Previous image"
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 z-30",
          "w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md",
          "flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-all duration-200",
          "hover:bg-white hover:scale-105 active:scale-95",
        )}
      >
        <ChevronLeft className="w-5 h-5 text-black" />
      </button>

      {/* ── Next arrow ───────────────────────────────────────────────────────── */}
      <button
        onClick={next}
        aria-label="Next image"
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 z-30",
          "w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md",
          "flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-all duration-200",
          "hover:bg-white hover:scale-105 active:scale-95",
        )}
      >
        <ChevronRight className="w-5 h-5 text-black" />
      </button>
    </div>
  );
}
