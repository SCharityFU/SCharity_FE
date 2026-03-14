"use client";

import dynamic from "next/dynamic";
import { useAppSelector } from "@/lib/store/hooks";

const TinyMCEEditor = dynamic(() => import("@tinymce/tinymce-react").then((mod) => mod.Editor), {
  ssr: false,
});

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
  className = "",
}: Readonly<RichTextEditorProps>) {
  const tinyMceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  const token = useAppSelector((state) => state.auth.token);

  const uploadImage = async (blobInfo: { blob: () => Blob; filename: () => string }, progress: (percent: number) => void) => {
    const formData = new FormData();
    formData.append("image", blobInfo.blob(), blobInfo.filename());

    const response = await fetch(`${apiBaseUrl}/campaigns/editor-image`, {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    progress(100);

    if (!response.ok) {
      throw new Error("Upload image failed");
    }

    const result = await response.json();
    const imageUrl = result?.data?.url;

    if (!imageUrl) {
      throw new Error("Image URL not found in upload response");
    }

    return imageUrl as string;
  };

  return (
    <div className={`rich-text-editor ${className}`.trim()}>
      <TinyMCEEditor
        apiKey={tinyMceApiKey}
        value={value}
        onEditorChange={onChange}
        init={{
          menubar: false,
          branding: false,
          statusbar: false,
          height: minHeight,
          plugins: ["lists", "link", "image"],
          toolbar: "bold italic | bullist numlist | link image | removeformat",
          automatic_uploads: true,
          images_upload_handler: uploadImage,
          placeholder,
          content_style:
            "body { font-family: Google Sans, Google Sans Text, system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #111827; }",
        }}
      />
    </div>
  );
}
