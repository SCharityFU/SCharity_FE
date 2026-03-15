"use client";

import { useEffect, useMemo, useState, type WheelEvent } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { createPortal } from "react-dom";

interface CampaignMediaSectionProps {
  mediaUrls?: string[] | null;
}

export function CampaignMediaSection({ mediaUrls }: CampaignMediaSectionProps) {
  const images = useMemo(
    () => (mediaUrls ?? []).filter((u): u is string => Boolean(u)),
    [mediaUrls],
  );
  const [mounted, setMounted] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (images.length === 0) return null;

  const openViewer = (index: number) => {
    setActiveIndex(index);
    setZoom(1);
    setViewerOpen(true);
  };

  const goPrev = () => {
    setZoom(1);
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = () => {
    setZoom(1);
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const adjustZoom = (nextValue: number) => {
    setZoom(Math.max(1, Math.min(4, nextValue)));
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const step = event.deltaY < 0 ? 0.15 : -0.15;
    adjustZoom(zoom + step);
  };

  return (
    <>
      <section>
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
          Những Hình Ảnh Liên Quan
        </h2>
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((url, i) => (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => openViewer(i)}
                className="group relative h-36 sm:h-40 overflow-hidden rounded-xl border border-black/10"
              >
                <img
                  src={url}
                  alt={`campaign-media-${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {viewerOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[1300] bg-black/90 backdrop-blur-[2px] px-3 pb-3 pt-0 sm:px-6 sm:pb-6 sm:pt-2">
            <div className="relative w-full h-full max-w-6xl mx-auto flex flex-col">
              <div className="flex items-center justify-between text-white/85 pb-3">
                <p className="text-sm font-semibold">
                  Ảnh {activeIndex + 1} / {images.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustZoom(zoom - 0.25)}
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => adjustZoom(zoom + 0.25)}
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerOpen(false)}
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Close viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative flex-1 min-h-0 rounded-xl border border-white/15 bg-black/40 overflow-hidden">
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  className="absolute inset-0 flex items-center justify-center overflow-auto p-3 sm:p-6"
                  onWheel={handleWheel}
                >
                  <img
                    src={images[activeIndex]}
                    alt={`viewer-${activeIndex + 1}`}
                    className="max-w-full max-h-full object-contain transition-transform duration-150"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <div className="flex gap-2 min-w-max pb-1">
                  {images.map((url, i) => (
                    <button
                      key={`${url}-thumb-${i}`}
                      type="button"
                      onClick={() => {
                        setActiveIndex(i);
                        setZoom(1);
                      }}
                      className={`w-20 h-14 rounded-lg overflow-hidden border transition-all ${
                        i === activeIndex
                          ? "border-emerald-400 ring-1 ring-emerald-300"
                          : "border-white/20 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`thumb-${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
