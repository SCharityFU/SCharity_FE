"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

type QuillInstance = {
  root: { innerHTML: string };
  clipboard: { dangerouslyPasteHTML: (html: string) => void };
  on: (eventName: "text-change", handler: () => void) => void;
  getSelection: (focus?: boolean) => { index: number; length: number } | null;
  getLength: () => number;
  insertEmbed: (index: number, type: "image", value: string, source?: string) => void;
  setSelection: (index: number, length: number) => void;
};

interface StoryEditorSectionProps {
  story: string;
  onStoryChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function StoryEditorSection({
  story,
  onStoryChange,
  onUploadImage,
}: StoryEditorSectionProps) {
  const editorRootRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const onStoryChangeRef = useRef(onStoryChange);
  const initialStoryRef = useRef(story);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    onStoryChangeRef.current = onStoryChange;
  }, [onStoryChange]);

  const storyLength = useMemo(() => {
    if (!story) return 0;
    if (typeof window === "undefined") return 0;
    const parser = new DOMParser();
    const doc = parser.parseFromString(story, "text/html");
    return (doc.body.textContent || "").trim().length;
  }, [story]);

  useEffect(() => {
    let mounted = true;

    const initQuill = async () => {
      const { default: Quill } = await import("quill");
      if (!mounted || !editorRootRef.current || quillRef.current) return;

      const quill = new Quill(editorRootRef.current, {
        theme: "snow",
        placeholder: "Kể câu chuyện về chiến dịch của bạn... (ít nhất 50 ký tự)",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["blockquote", "link", "image"],
              ["clean"],
            ],
            handlers: {
              image: () => {
                imageInputRef.current?.click();
              },
            },
          },
        },
      });

      if (initialStoryRef.current) {
        quill.clipboard.dangerouslyPasteHTML(initialStoryRef.current);
      }

      quill.on("text-change", () => {
        onStoryChangeRef.current(quill.root.innerHTML);
      });

      quillRef.current = quill as QuillInstance;
    };

    initQuill();

    return () => {
      mounted = false;
      quillRef.current = null;
    };
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const currentHtml = quill.root.innerHTML;
    if (story === currentHtml) return;

    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(story || "");
    if (selection) {
      quill.setSelection(selection.index, selection.length);
    }
  }, [story]);

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Chỉ hỗ trợ upload tệp ảnh cho nội dung bài viết.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Kích thước ảnh vượt quá 10MB.");
      return;
    }

    const quill = quillRef.current;
    if (!quill) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const imageUrl = await onUploadImage(file);
      const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
      quill.insertEmbed(range.index, "image", imageUrl, "user");
      quill.setSelection(range.index + 1, 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload ảnh thất bại. Vui lòng thử lại.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-black/70">
        <FileText className="w-4 h-4 text-indigo-500" />
        Câu chuyện chiến dịch
      </Label>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      <div className="rounded-xl overflow-hidden border border-black/10 bg-white/60">
        <div ref={editorRootRef} className="quill-editor min-h-[220px]" />
      </div>

      {(isUploading || uploadError) && (
        <div className="text-xs flex items-center gap-2 text-black/60">
          {isUploading && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang upload ảnh...</span>
            </>
          )}
          {!isUploading && uploadError && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-600">{uploadError}</span>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-black/30 text-right">{storyLength} ký tự</p>
    </div>
  );
}
