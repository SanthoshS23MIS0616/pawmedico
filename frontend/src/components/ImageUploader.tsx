import { useRef } from "react";

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  helper: string;
};

export function ImageUploader({ file, onFileChange, helper }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="panel p-6">
      <div
        className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-ink/20 bg-gradient-to-br from-sand to-white p-6 text-center"
        onClick={() => inputRef.current?.click()}
      >
        <div className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-coral shadow">Drop image or click to upload</div>
        <p className="max-w-md text-sm text-ink/65">{helper}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </div>
      {file ? <p className="mt-4 text-sm font-semibold text-ink">Selected: {file.name}</p> : null}
    </div>
  );
}
