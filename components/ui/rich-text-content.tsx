import { cn } from "@/lib/utils";

interface RichTextContentProps {
  content?: string | null;
  className?: string;
  emptyText?: string;
}

function sanitizeRichTextHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*')/gi, "")
    .replace(/javascript:/gi, "");
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function RichTextContent({
  content,
  className,
  emptyText = "Chưa có nội dung.",
}: RichTextContentProps) {
  if (!content || !content.trim()) {
    return <p className="text-black/40">{emptyText}</p>;
  }

  if (!looksLikeHtml(content)) {
    return <p className={cn("whitespace-pre-wrap leading-relaxed text-black/75", className)}>{content}</p>;
  }

  const safeHtml = sanitizeRichTextHtml(content);

  return (
    <div
      className={cn(
        "prose prose-sm md:prose-base max-w-none text-black/75 leading-relaxed",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto",
        "[&_a]:text-rose-600 [&_a]:underline [&_a]:break-all",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
