import { ImageIcon, Star, Upload, X } from "lucide-react";
import type { DragEvent } from "react";
import { Label } from "@/components/ui/label";

interface MediaUploadSectionProps {
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  mediaPreviews: string[];
  coverIndex: number;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onInputFiles: (files: FileList) => void;
  onCoverChange: (idx: number) => void;
  onRemoveMedia: (idx: number) => void;
}

export function MediaUploadSection({
  isDragOver,
  fileInputRef,
  mediaPreviews,
  coverIndex,
  onDrop,
  onDragOver,
  onDragLeave,
  onInputFiles,
  onCoverChange,
  onRemoveMedia,
}: MediaUploadSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-black/70">
        <Upload className="w-4 h-4 text-pink-500" />
        Hình ảnh chiến dịch
      </Label>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? "border-rose-400 bg-rose-50/50"
            : "border-black/10 hover:border-rose-300 hover:bg-rose-50/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onInputFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-sm text-black/50">
            <span className="font-semibold text-rose-500">Nhấn để chọn</span> hoặc kéo thả ảnh vào đây
          </p>
          <p className="text-xs text-black/30">PNG, JPG, WEBP (tối đa 10MB)</p>
        </div>
      </div>

      {mediaPreviews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {mediaPreviews.map((src, idx) => (
            <div key={idx} className="relative group">
              <div
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  coverIndex === idx
                    ? "border-rose-500 ring-2 ring-rose-500/30"
                    : "border-transparent hover:border-black/20"
                }`}
                onClick={() => onCoverChange(idx)}
              >
                <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                {coverIndex === idx && (
                  <div className="absolute top-1 left-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" />
                    Bìa
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMedia(idx);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {mediaPreviews.length > 0 && (
        <p className="text-xs text-black/40">Nhấn vào ảnh để chọn làm ảnh bìa • {mediaPreviews.length} ảnh đã chọn</p>
      )}
    </div>
  );
}
