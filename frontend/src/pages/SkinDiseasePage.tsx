import { useState } from "react";

import { ImageUploader } from "../components/ImageUploader";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { severityTone } from "../utils/diseaseHelpers";
import { api } from "../services/api";

export function SkinDiseasePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      setResult(await api.uploadSkinImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <ImageUploader file={file} onFileChange={setFile} helper="Upload a clear photo of the affected pet skin region. Close-up images with good lighting work best." />
        <button className="button-primary" disabled={!file || loading} onClick={submit}>
          Analyze skin image
        </button>
        {loading ? <LoadingSpinner label="Analyzing skin image..." /> : null}
        {error ? <div className="panel p-4 text-sm text-red-700">{error}</div> : null}
      </div>
      <div className="panel p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-coral">Result</p>
        {result ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black">{result.condition}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${severityTone(result.severity)}`}>{result.severity}</span>
            </div>
            <p className="text-sm text-ink/70">Confidence: {result.confidence}%</p>
            <p className="text-sm text-ink/70">Source: {result.analysis_source}</p>
            <div>
              <p className="text-sm font-bold">Care tips</p>
              <ul className="mt-2 space-y-2 text-sm text-ink/75">
                {result.care_tips.map((tip: string) => (
                  <li key={tip} className="rounded-2xl bg-sand px-4 py-3">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            {result.image_report ? <p className="text-sm text-ink/65">{result.image_report}</p> : null}
            {result.warning ? <p className="text-sm font-semibold text-amber-700">{result.warning}</p> : null}
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink/60">Upload an image to see the analysis summary here.</p>
        )}
      </div>
    </div>
  );
}
