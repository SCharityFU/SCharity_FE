'use client';

import { useEffect, useRef } from 'react';

type QuillInstance = {
  root: { innerHTML: string };
  clipboard: { dangerouslyPasteHTML: (html: string) => void };
  on: (eventName: 'text-change', handler: () => void) => void;
  getSelection: (focus?: boolean) => { index: number; length: number } | null;
  setSelection: (index: number, length: number) => void;
};

interface RequestStoryEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RequestStoryEditor({ value, onChange }: RequestStoryEditorProps) {
  const editorRootRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;

    const initQuill = async () => {
      const { default: Quill } = await import('quill');
      if (!mounted || !editorRootRef.current || quillRef.current) return;

      const quill = new Quill(editorRootRef.current, {
        theme: 'snow',
        placeholder: 'Kể câu chuyện về chiến dịch... (ít nhất 50 ký tự)',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'link', 'image'],
            ['clean'],
          ],
        },
      });

      if (initialValueRef.current) {
        quill.clipboard.dangerouslyPasteHTML(initialValueRef.current);
      }

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
  }, []);

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

  return (
    <div className="rounded-xl overflow-hidden border border-black/10 bg-white/60">
      <div ref={editorRootRef} className="quill-editor min-h-[220px]" />
    </div>
  );
}
