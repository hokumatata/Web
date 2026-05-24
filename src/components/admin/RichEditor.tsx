"use client";

import { useRef, useState, useCallback, type ChangeEvent } from "react";
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus, Link as LinkIcon,
  Image as ImageIcon, Upload, Eye, EyeOff, Loader2,
  type LucideIcon,
} from "lucide-react";
import { markdownToHtml } from "@/lib/markdown";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
}

type ToolAction = {
  icon: LucideIcon;
  label: string;
  action: "wrap" | "prefix" | "insert" | "custom";
  before?: string;
  after?: string;
  prefix?: string;
  text?: string;
  customFn?: string;
};

const TOOLS: (ToolAction | "sep")[] = [
  { icon: Bold, label: "Bold", action: "wrap", before: "**", after: "**" },
  { icon: Italic, label: "Italic", action: "wrap", before: "*", after: "*" },
  { icon: Strikethrough, label: "Strikethrough", action: "wrap", before: "~~", after: "~~" },
  "sep",
  { icon: Heading1, label: "Heading 1", action: "prefix", prefix: "# " },
  { icon: Heading2, label: "Heading 2", action: "prefix", prefix: "## " },
  { icon: Heading3, label: "Heading 3", action: "prefix", prefix: "### " },
  "sep",
  { icon: List, label: "Bullet list", action: "prefix", prefix: "- " },
  { icon: ListOrdered, label: "Numbered list", action: "prefix", prefix: "1. " },
  { icon: Quote, label: "Blockquote", action: "prefix", prefix: "> " },
  { icon: Code, label: "Inline code", action: "wrap", before: "`", after: "`" },
  { icon: Minus, label: "Horizontal rule", action: "insert", text: "\n---\n" },
  "sep",
  { icon: LinkIcon, label: "Insert link", action: "custom", customFn: "link" },
  { icon: ImageIcon, label: "Insert image", action: "custom", customFn: "image" },
];

export function RichEditor({ value, onChange }: RichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getSelection = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return { start: 0, end: 0, selected: "" };
    return {
      start: ta.selectionStart,
      end: ta.selectionEnd,
      selected: value.slice(ta.selectionStart, ta.selectionEnd),
    };
  }, [value]);

  const replaceSelection = useCallback((start: number, end: number, replacement: string) => {
    const newValue = value.slice(0, start) + replacement + value.slice(end);
    onChange(newValue);
    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        const pos = start + replacement.length;
        ta.setSelectionRange(pos, pos);
      }
    }, 0);
  }, [value, onChange]);

  function applyTool(tool: ToolAction) {
    const { start, end, selected } = getSelection();

    switch (tool.action) {
      case "wrap": {
        const wrapped = `${tool.before}${selected || "text"}${tool.after}`;
        replaceSelection(start, end, wrapped);
        break;
      }
      case "prefix": {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const line = value.slice(lineStart, end);
        const prefixed = `${tool.prefix}${line}`;
        replaceSelection(lineStart, end, prefixed);
        break;
      }
      case "insert": {
        replaceSelection(start, end, tool.text ?? "");
        break;
      }
      case "custom": {
        if (tool.customFn === "link") insertLink();
        if (tool.customFn === "image") insertImageDialog();
        break;
      }
    }
  }

  function insertLink() {
    const { start, end, selected } = getSelection();
    const url = prompt("Enter URL:", "https://");
    if (!url) return;
    const text = selected || prompt("Link text:", "click here") || "link";
    replaceSelection(start, end, `[${text}](${url})`);
  }

  function insertImageDialog() {
    const choice = confirm("Upload an image file?\n\nClick OK to upload from your device.\nClick Cancel to enter a URL instead.");
    if (choice) {
      fileInputRef.current?.click();
    } else {
      const { start, end } = getSelection();
      const url = prompt("Image URL:", "https://");
      if (!url) return;
      const alt = prompt("Alt text (optional):", "") || "";
      replaceSelection(start, end, `![${alt}](${url})`);
    }
  }

  async function onImageFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }
      const { start, end } = getSelection();
      const alt = file.name.replace(/\.[^.]+$/, "");
      replaceSelection(start, end, `![${alt}](${data.url})\n`);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label">Body</label>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="btn-ghost text-xs h-7 px-2"
        >
          {preview ? <><EyeOff size={12} /> Edit</> : <><Eye size={12} /> Preview</>}
        </button>
      </div>

      {/* Toolbar */}
      {!preview && (
        <div className="flex items-center flex-wrap gap-0.5 p-1.5 bg-ink-850 border border-ink-700 border-b-0 rounded-t-sm">
          {TOOLS.map((tool, i) =>
            tool === "sep" ? (
              <div key={`sep-${i}`} className="w-px h-5 bg-ink-700 mx-1" />
            ) : (
              <button
                key={tool.label}
                type="button"
                title={tool.label}
                onClick={() => applyTool(tool)}
                className="p-1.5 rounded-sm text-ink-300 hover:text-ink-50 hover:bg-ink-700 transition-colors"
              >
                <tool.icon size={14} />
              </button>
            )
          )}
          <div className="w-px h-5 bg-ink-700 mx-1" />
          <button
            type="button"
            title="Upload image"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-sm text-ink-300 hover:text-accent hover:bg-ink-700 transition-colors"
            disabled={uploading}
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          </button>
        </div>
      )}

      {preview ? (
        <div
          className="prose-mp p-4 bg-ink-900 border border-ink-700 rounded-sm min-h-[300px] max-h-[600px] overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="input min-h-[400px] font-mono text-sm rounded-t-none resize-y"
          placeholder="Write your article using markdown...

**Bold text**, *italic text*, ~~strikethrough~~

## Headings

- Bullet lists
1. Numbered lists

> Blockquotes

[Link text](https://example.com)
![Image alt](https://example.com/image.jpg)

---"
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageFileChange}
        className="hidden"
      />

      {!preview && (
        <div className="flex items-center gap-3 mt-1.5 text-2xs text-ink-500">
          <span>Markdown supported</span>
          <span>|</span>
          <span>**bold**</span>
          <span>*italic*</span>
          <span>[link](url)</span>
          <span>![image](url)</span>
          <span>## heading</span>
        </div>
      )}
    </div>
  );
}
