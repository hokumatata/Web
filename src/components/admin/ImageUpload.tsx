"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Cover Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onChange(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div>
      <label className="label">{label}</label>

      {value ? (
        <div className="relative group">
          <img src={value} alt="Cover" className="w-full max-h-48 object-cover rounded-sm border border-ink-700" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-ink-900/80 text-ink-200 hover:text-white p-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="input text-xs flex-1"
              placeholder="Image URL"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn-secondary h-9 px-3 text-xs"
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-ink-700 hover:border-ink-500"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-ink-400">
              <Loader2 size={24} className="animate-spin text-accent" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-ink-400">
              <Upload size={24} />
              <span className="text-sm">Drop an image here or click to upload</span>
              <span className="text-2xs text-ink-500">JPEG, PNG, GIF, WebP, SVG — max 5 MB</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <ImageIcon size={12} className="text-ink-500" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input text-xs flex-1"
          placeholder="Or paste image URL here"
          style={value ? { display: "none" } : {}}
        />
      </div>

      {error && <p className="text-xs text-down mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}
