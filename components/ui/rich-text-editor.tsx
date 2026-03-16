'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';

type QuillInstance = {
  root: { innerHTML: string };
  clipboard: { dangerouslyPasteHTML: (html: string) => void };
  on: (eventName: 'text-change', handler: () => void) => void;
  getSelection: (focus?: boolean) => { index: number; length: number } | null;
  getLength: () => number;
  insertEmbed: (index: number, type: 'image', value: string, source?: string) => void;
  setSelection: (index: number, length: number) => void;
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 180,
  className = '',
}: Readonly<RichTextEditorProps>) {
  const editorRootRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const latestValueRef = useRef(value);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = useAppSelector((state) => state.auth.token);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${apiBaseUrl}/campaigns/editor-image`, {
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload image failed');
    }

    const result = await response.json();
    const imageUrl = result?.data?.url;

    if (!imageUrl) {
      throw new Error('Image URL not found in upload response');
    }

    return imageUrl as string;
  };

  useEffect(() => {
    let mounted = true;

    const initQuill = async () => {
      const { default: Quill } = await import('quill');
      if (!mounted || !editorRootRef.current || quillRef.current) return;

      const quill = new Quill(editorRootRef.current, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'link', 'image'],
              ['clean'],
            ],
            handlers: {
              image: () => {
                imageInputRef.current?.click();
              },
            },
          },
        },
      });

      quill.clipboard.dangerouslyPasteHTML(latestValueRef.current || '');

      quill.on('text-change', () => {
        onChangeRef.current(quill.root.innerHTML);
      });

      quillRef.current = quill as QuillInstance;
    };

    initQuill();

    return () => {
      mounted = false;
      quillRef.current = null;
    };
  }, [placeholder]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const currentHtml = quill.root.innerHTML;
    if (value === currentHtml) return;

    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(value || '');
    if (selection) {
      quill.setSelection(selection.index, selection.length);
    }
  }, [value]);

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Chỉ hỗ trợ upload tệp ảnh.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Kích thước ảnh vượt quá 10MB.');
      return;
    }

    const quill = quillRef.current;
    if (!quill) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const imageUrl = await uploadImage(file);
      const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
      quill.insertEmbed(range.index, 'image', imageUrl, 'user');
      quill.setSelection(range.index + 1, 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload ảnh thất bại. Vui lòng thử lại.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`rich-text-editor ${className}`.trim()}>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />

      <div className="rounded-xl overflow-hidden border border-black/10 bg-white/60">
        <div ref={editorRootRef} className="quill-editor" style={{ minHeight }} />
      </div>

      {(isUploading || uploadError) && (
        <div className="mt-2 text-xs flex items-center gap-2 text-black/60">
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
    </div>
  );
}
