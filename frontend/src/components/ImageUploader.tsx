import { useMemo, useRef, useState } from "react";

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  helper: string;
};

export function ImageUploader({ file, onFileChange, helper }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  return (
    <div className="panel p-6">
      <div
        className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed p-6 text-center transition ${
          dragActive ? "border-coral bg-coral/5" : "border-ink/20 bg-gradient-to-br from-sand to-white dark:from-white/5 dark:to-white/10"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          onFileChange(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        <div className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-coral shadow">Drop image or click to upload</div>
        <p className="max-w-md text-sm text-ink/65 dark:text-paper/70">{helper}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </div>
      {file ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-ink dark:text-paper">Selected: {file.name}</p>
          {previewUrl ? <img className="max-h-72 rounded-[24px] object-cover shadow-panel" src={previewUrl} alt={file.name} /> : null}
        </div>
      ) : null}
    </div>
  );
}
