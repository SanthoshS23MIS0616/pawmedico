import { useState } from "react";
import { Link } from "react-router-dom";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { ResultCard } from "../components/ResultCard";
import { api } from "../services/api";

const defaultForm = {
  affectionate_with_family: 5,
  good_with_young_children: 5,
  good_with_other_dogs: 4,
  shedding_level: 3,
  coat_grooming_frequency: 3,
  drooling_level: 2,
  openness_to_strangers: 4,
  playfulness_level: 4,
  watchdog_protective_nature: 3,
  adaptability_level: 4,
  trainability_level: 5,
  energy_level: 4,
  barking_level: 3,
  mental_stimulation_needs: 4,
  height_c: 50,
  weight_c: 22,
  life_c: 12,
  coat_length_c: 2
};

export function BreedRecommenderPage() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  async function submit() {
    setLoading(true);
    try {
      setResult(await api.recommendBreeds(form));
    } finally {
      setLoading(false);
    }
  }

  const traits = Object.entries(form);

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex rounded-full bg-coral/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-coral">Breed match workflow</p>
            <h1 className="mt-5 text-4xl font-black leading-tight">Find a dog breed that actually fits lifestyle, grooming effort, family needs, and energy expectations.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70 dark:text-paper/70">
              This is now a first-class module in PawMedic Pro. Use it as a preference-based match flow, then jump into the visual animal gallery if you want curated breed browsing.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="button-secondary" to="/animal-gallery">
                Open animal gallery
              </Link>
              <Link className="button-secondary" to="/breed-finder">
                Use AI breed finder
              </Link>
            </div>
          </div>
          <div className="rounded-[30px] bg-ink p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Current source</p>
            <div className="mt-6 grid gap-3">
              {["Lifestyle sliders", "Temperament weighting", "Care and grooming profile", "Curated fallback breed profiles"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel p-8">
          <h2 className="text-3xl font-black">Breed recommender</h2>
          <p className="mt-3 text-sm text-ink/65 dark:text-paper/70">Adjust lifestyle and care preferences to get the closest dog breed matches.</p>
        <div className="mt-6 space-y-4">
          {traits.map(([key, value]) => (
            <div key={key}>
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>{key.split("_").join(" ")}</span>
                <span>{value}</span>
              </div>
              <input
                className="w-full accent-coral"
                type="range"
                min={key.endsWith("_c") ? (key === "coat_length_c" ? 1 : key === "life_c" ? 5 : key === "weight_c" ? 1 : 10) : 1}
                max={key.endsWith("_c") ? (key === "coat_length_c" ? 3 : key === "life_c" ? 20 : key === "weight_c" ? 90 : 100) : 5}
                step="1"
                value={value}
                onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))}
              />
            </div>
          ))}
        </div>
        <button className="button-primary mt-6" onClick={submit}>
          Find best breeds
        </button>
        </section>

        <ResultCard title="Matches" subtitle="Top-scoring breeds, quick summaries, and direct breed reference links." badge={result?.matches?.length ? `${result.matches.length}` : undefined}>
          {loading ? <div className="mt-5"><LoadingSpinner label="Scoring breed profiles..." /></div> : null}
          <div className="space-y-4">
            {result?.dataset_size ? <p className="text-sm text-ink/60 dark:text-paper/60">Using the restored source dataset with {result.dataset_size} dog breeds.</p> : null}
            {result?.matches?.map((match: any) => (
              <a key={match.name} className="block rounded-[24px] bg-sand p-5 transition hover:-translate-y-0.5 dark:bg-white/5" href={match.url} target="_blank" rel="noreferrer">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-black">{match.name}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-coral">{match.similarity}%</span>
                </div>
                <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">{match.summary}</p>
              </a>
            ))}
            {!result ? <p className="text-sm text-ink/60 dark:text-paper/60">Top breed matches will appear here.</p> : null}
            {result?.warning ? <p className="text-sm font-semibold text-amber-700">{result.warning}</p> : null}
          </div>
        </ResultCard>
      </div>
    </div>
  );
}
