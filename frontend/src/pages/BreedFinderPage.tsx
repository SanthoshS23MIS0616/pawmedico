import { useState } from "react";

import { ImageUploader } from "../components/ImageUploader";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { api } from "../services/api";

export function BreedFinderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      setResult(await api.uploadBreedImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <ImageUploader file={file} onFileChange={setFile} helper="Upload any pet image to identify the animal and breed. Gemini handles multi-animal images when configured." />
        <button className="button-primary" disabled={!file || loading} onClick={submit}>
          Identify animal and breed
        </button>
        {loading ? <LoadingSpinner label="Detecting breed..." /> : null}
        {error ? <div className="panel p-4 text-sm text-red-700">{error}</div> : null}
      </div>
      <div className="panel p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-coral">Prediction</p>
        {result ? (
          <div className="mt-5 space-y-4">
            <h2 className="text-3xl font-black">{result.breed}</h2>
            <p className="text-lg text-ink/70">{result.animal}</p>
            <p className="text-sm text-ink/70">Confidence: {result.confidence}%</p>
            <p className="text-sm text-ink/70">{result.description}</p>
            {result.info_link ? (
              <a className="inline-flex text-sm font-bold text-coral underline" href={result.info_link} target="_blank" rel="noreferrer">
                Open breed info
              </a>
            ) : null}
            {result.warning ? <p className="text-sm font-semibold text-amber-700">{result.warning}</p> : null}
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink/60">The detected species and breed will appear here.</p>
        )}
      </div>
    </div>
  );
}
