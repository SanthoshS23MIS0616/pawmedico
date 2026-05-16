import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { api } from "../services/api";
import { severityTone } from "../utils/diseaseHelpers";

export function SymptomCheckerPage() {
  const [searchParams] = useSearchParams();
  const [catalog, setCatalog] = useState<{ breed?: string | null; symptoms: string[]; all_breeds: string[] }>({ symptoms: [], all_breeds: [] });
  const [breed, setBreed] = useState(searchParams.get("breed") ?? "");
  const [animal, setAnimal] = useState(searchParams.get("animal") ?? "Dog");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const profile = localStorage.getItem("petmedico-selected-profile");
    if (!profile) return;
    try {
      const parsed = JSON.parse(profile) as { animal?: string; breed?: string };
      if (!searchParams.get("breed") && parsed.breed) setBreed(parsed.breed);
      if (!searchParams.get("animal") && parsed.animal) setAnimal(parsed.animal);
    } catch {}
  }, [searchParams]);

  useEffect(() => {
    api.getSymptomCatalog(breed || undefined).then(setCatalog);
  }, [breed]);

  const deferredSearch = useDeferredValue(search);
  const filteredSymptoms = useMemo(
    () => catalog.symptoms.filter((item) => item.toLowerCase().includes(deferredSearch.toLowerCase())).slice(0, 40),
    [catalog.symptoms, deferredSearch]
  );

  function toggleSymptom(symptom: string) {
    setSelected((current) => (current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]));
  }

  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      setResult(await api.predictSymptoms({ animal, breed: breed || null, symptoms: selected }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <div className="mb-5 rounded-[24px] bg-sand p-4 text-sm dark:bg-white/5">
          <p className="font-bold">Selected profile</p>
          <p className="mt-2 text-ink/70 dark:text-paper/70">
            Animal: {animal || "Not selected"} | Breed: {breed || "All breeds"}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.4fr_0.6fr]">
          <div>
            <label className="label">Animal</label>
            <input className="input" value={animal} onChange={(event) => setAnimal(event.target.value)} />
          </div>
          <div>
            <label className="label">Breed</label>
            <select className="input" value={breed} onChange={(event) => setBreed(event.target.value)}>
              <option value="">All breeds</option>
              {catalog.all_breeds.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Search symptoms</label>
            <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Itching, fever, vomiting..." />
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filteredSymptoms.map((symptom) => {
            const active = selected.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${active ? "border-coral bg-coral/10 text-coral" : "border-ink/10 bg-white text-ink/80"}`}
              >
                {symptom}
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className="button-primary" disabled={!selected.length || loading} onClick={submit}>
            Predict disease
          </button>
          <p className="text-sm text-ink/65">Selected: {selected.length} symptoms</p>
        </div>
      </section>

      {loading ? <LoadingSpinner label="Checking symptom pattern..." /> : null}

      <section className="panel p-8">
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black">{result.disease}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${severityTone(result.severity)}`}>{result.severity}</span>
            </div>
            <p className="text-sm text-ink/70">Confidence: {result.confidence}%</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold">Matched symptoms</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.matched_symptoms.map((item: string) => (
                    <span key={item} className="rounded-full bg-sand px-3 py-2 text-xs font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold">Advice</p>
                <ul className="mt-2 space-y-2 text-sm text-ink/75">
                  {result.advice.map((item: string) => (
                    <li key={item} className="rounded-2xl bg-sand px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {result.vet_link ? (
              <a className="inline-flex text-sm font-bold text-coral underline" href={result.vet_link} target="_blank" rel="noreferrer">
                Open veterinary reference
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-ink/60">Choose symptoms to receive a predicted disease and severity rating.</p>
        )}
      </section>
    </div>
  );
}
