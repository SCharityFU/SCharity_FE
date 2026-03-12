"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Crop } from "lucide-react";

interface AvatarCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas to Blob conversion failed"));
    }, "image/jpeg", 0.92);
  });
}

export function AvatarCropModal({ imageSrc, onClose, onCropComplete }: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteInternal = useCallback((_: Area, cropped: Area) => {
    setCroppedAreaPixels(cropped);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(blob);
    } catch (e) {
      console.error("Crop error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-zinc-900 rounded-2xl shadow-2xl flex flex-col w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-google-sans-bold text-base tracking-wide">
            Chọn ảnh đại diện
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-80 bg-zinc-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
          />
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-3 px-5 py-4 bg-zinc-900">
          <ZoomOut className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 appearance-none bg-zinc-700 rounded-full cursor-pointer accent-rose-500"
          />
          <ZoomIn className="w-4 h-4 text-zinc-400 shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/10 bg-zinc-900">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-zinc-300 hover:text-white transition-colors font-google-sans-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-google-sans-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Crop className="w-4 h-4" />
            )}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
