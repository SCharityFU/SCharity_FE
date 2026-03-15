import { FileCheck, X } from "lucide-react";
import type { DragEvent } from "react";
import { Label } from "@/components/ui/label";
import type { ProofPreview } from "@/components/campaign/create/types";

interface ProofDocumentsSectionProps {
  proofDragOver: boolean;
  proofInputRef: React.RefObject<HTMLInputElement | null>;
  proofPreviews: ProofPreview[];
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onInputFiles: (files: FileList) => void;
  onRemoveProof: (idx: number) => void;
}

export function ProofDocumentsSection({
  proofDragOver,
  proofInputRef,
  proofPreviews,
  onDrop,
  onDragOver,
  onDragLeave,
  onInputFiles,
  onRemoveProof,
}: ProofDocumentsSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-black/70">
        <FileCheck className="w-4 h-4 text-emerald-500" />
        Tài liệu chứng minh
      </Label>
      <p className="text-xs text-black/40">Tải lên giấy tờ xác minh chiến dịch (ảnh hoặc PDF, tối đa 10MB)</p>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => proofInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          proofDragOver
            ? "border-emerald-400 bg-emerald-50/50"
            : "border-black/10 hover:border-emerald-300 hover:bg-emerald-50/20"
        }`}
      >
        <input
          ref={proofInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onInputFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm text-black/50">
            <span className="font-semibold text-emerald-600">Nhấn để chọn</span> hoặc kéo thả tài liệu
          </p>
          <p className="text-xs text-black/30">PNG, JPG, WEBP, PDF</p>
        </div>
      </div>

      {proofPreviews.length > 0 && (
        <div className="space-y-2 mt-3">
          {proofPreviews.map((proof, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-black/10 bg-white/30 group">
              {proof.type === "image" && proof.url ? (
                <img src={proof.url} alt={proof.name} className="w-10 h-10 rounded-md object-cover border border-black/10 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-md bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-red-500">PDF</span>
                </div>
              )}
              <span className="text-xs text-black/60 truncate flex-1">{proof.name}</span>
              <button
                type="button"
                onClick={() => onRemoveProof(idx)}
                className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <p className="text-xs text-black/40">{proofPreviews.length} tài liệu đã chọn</p>
        </div>
      )}
    </div>
  );
}
