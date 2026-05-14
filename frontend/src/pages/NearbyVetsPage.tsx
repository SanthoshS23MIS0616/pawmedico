import { useState } from "react";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { ResultCard } from "../components/ResultCard";
import { api } from "../services/api";
import { AppLanguage, t } from "../utils/translations";

export function NearbyVetsPage({ language }: { language: AppLanguage }) {
  const copy = t(language);
  const [form, setForm] = useState({ latitude: "13.0827", longitude: "80.2707", radius_km: "5" });
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  function useCurrentLocation() {
    navigator.geolocation?.getCurrentPosition((position) => {
      setForm({
        latitude: position.coords.latitude.toFixed(5),
        longitude: position.coords.longitude.toFixed(5),
        radius_km: form.radius_km
      });
    });
  }

  async function submit() {
    setLoading(true);
    try {
      setResult(await api.findNearbyVets({ latitude: Number(form.latitude), longitude: Number(form.longitude), radius_km: Number(form.radius_km) }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="panel p-8">
        <h1 className="text-3xl font-black">{copy.nearbyTitle}</h1>
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">{copy.nearbyBody}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Latitude</label>
            <input className="input" value={form.latitude} onChange={(event) => setForm((value) => ({ ...value, latitude: event.target.value }))} />
          </div>
          <div>
            <label className="label">Longitude</label>
            <input className="input" value={form.longitude} onChange={(event) => setForm((value) => ({ ...value, longitude: event.target.value }))} />
          </div>
          <div>
            <label className="label">Radius (km)</label>
            <input className="input" type="number" value={form.radius_km} onChange={(event) => setForm((value) => ({ ...value, radius_km: event.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="button-primary" onClick={submit}>
            {copy.nearbySearch}
          </button>
          <button className="button-secondary" onClick={useCurrentLocation}>
            {copy.nearbyCurrent}
          </button>
        </div>
      </section>

      <ResultCard title="Results" subtitle="Nearest clinics, direct map links, and quick distance scan." badge={result?.vets?.length ? `${result.vets.length}` : undefined}>
        {loading ? <div className="mt-5"><LoadingSpinner label="Looking up nearby vets..." /></div> : null}
        <div className="mt-5 space-y-4">
          {result?.vets?.map((vet: any) => (
            <a key={`${vet.name}-${vet.latitude}-${vet.longitude}`} href={vet.map_link} target="_blank" rel="noreferrer" className="block rounded-[24px] bg-sand p-5 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-lg font-black">{vet.name}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-coral">{vet.distance_km} km</span>
              </div>
              <p className="mt-2 text-sm text-ink/65 dark:text-paper/65">
                {vet.latitude}, {vet.longitude}
              </p>
            </a>
          ))}
          {!result ? <p className="text-sm text-ink/60 dark:text-paper/60">Search by coordinates to get veterinary locations here.</p> : null}
          {result?.warning ? <p className="text-sm font-semibold text-amber-700">{result.warning}</p> : null}
        </div>
      </ResultCard>
    </div>
  );
}
