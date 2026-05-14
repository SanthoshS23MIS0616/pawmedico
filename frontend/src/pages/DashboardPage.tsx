import { FormEvent, useEffect, useMemo, useState } from "react";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { PetCard } from "../components/PetCard";
import { WeightChart } from "../components/WeightChart";
import { api } from "../services/api";
import { usePetStore } from "../store/petStore";

export function DashboardPage() {
  const { dashboard, pets, selectedPetId, loading, error, refresh, selectPet } = usePetStore();
  const [petForm, setPetForm] = useState({ owner_id: "demo-user", name: "", species: "Dog", breed: "", dob: "", weight: "", photo_url: "" });
  const [recordForm, setRecordForm] = useState({ date: "", symptoms: "", diagnosis: "", severity: "moderate", notes: "" });
  const [weightForm, setWeightForm] = useState({ weight_kg: "", recorded_date: "" });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectedPet = useMemo(() => pets.find((pet) => pet.id === selectedPetId) ?? null, [pets, selectedPetId]);
  const selectedWeights = useMemo(() => dashboard?.weight_logs.filter((item) => item.pet_id === selectedPetId) ?? [], [dashboard, selectedPetId]);

  async function submitPet(event: FormEvent) {
    event.preventDefault();
    await api.createPet({
      owner_id: petForm.owner_id,
      name: petForm.name,
      species: petForm.species,
      breed: petForm.breed,
      dob: petForm.dob || null,
      weight: petForm.weight ? Number(petForm.weight) : null,
      photo_url: petForm.photo_url || null
    });
    setPetForm({ owner_id: "demo-user", name: "", species: "Dog", breed: "", dob: "", weight: "", photo_url: "" });
    await refresh();
  }

  async function submitRecord(event: FormEvent) {
    event.preventDefault();
    if (!selectedPetId) return;
    await api.createHealthRecord(selectedPetId, {
      date: recordForm.date,
      symptoms: recordForm.symptoms.split(",").map((item) => item.trim()).filter(Boolean),
      diagnosis: recordForm.diagnosis,
      severity: recordForm.severity,
      notes: recordForm.notes
    });
    setRecordForm({ date: "", symptoms: "", diagnosis: "", severity: "moderate", notes: "" });
    await refresh();
  }

  async function submitWeight(event: FormEvent) {
    event.preventDefault();
    if (!selectedPetId) return;
    await api.createWeightLog(selectedPetId, { weight_kg: Number(weightForm.weight_kg), recorded_date: weightForm.recorded_date });
    setWeightForm({ weight_kg: "", recorded_date: "" });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard?.metrics.map((metric) => (
          <div key={metric.label} className="panel p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-ink/50">{metric.label}</p>
            <p className="mt-3 text-4xl font-black">{metric.value}</p>
          </div>
        ))}
      </section>

      {loading ? <LoadingSpinner label="Loading pet dashboard..." /> : null}
      {error ? <div className="panel p-4 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-2xl font-black">Pet profiles</h2>
            <div className="mt-5 space-y-3">
              {pets.length ? pets.map((pet) => <PetCard key={pet.id} pet={pet} active={pet.id === selectedPetId} onClick={() => selectPet(pet.id)} />) : <p className="text-sm text-ink/60">No pets added yet.</p>}
            </div>
          </div>

          <form className="panel p-6" onSubmit={submitPet}>
            <h3 className="text-xl font-black">Add a pet</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input className="input" value={petForm.name} onChange={(event) => setPetForm((value) => ({ ...value, name: event.target.value }))} required />
              </div>
              <div>
                <label className="label">Species</label>
                <input className="input" value={petForm.species} onChange={(event) => setPetForm((value) => ({ ...value, species: event.target.value }))} required />
              </div>
              <div>
                <label className="label">Breed</label>
                <input className="input" value={petForm.breed} onChange={(event) => setPetForm((value) => ({ ...value, breed: event.target.value }))} required />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input className="input" type="number" step="0.1" value={petForm.weight} onChange={(event) => setPetForm((value) => ({ ...value, weight: event.target.value }))} />
              </div>
              <div>
                <label className="label">DOB</label>
                <input className="input" type="date" value={petForm.dob} onChange={(event) => setPetForm((value) => ({ ...value, dob: event.target.value }))} />
              </div>
              <div>
                <label className="label">Photo URL</label>
                <input className="input" value={petForm.photo_url} onChange={(event) => setPetForm((value) => ({ ...value, photo_url: event.target.value }))} />
              </div>
            </div>
            <button className="button-primary mt-5" type="submit">
              Save pet
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-2xl font-black">Selected pet overview</h2>
            {selectedPet ? (
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div className="rounded-[24px] bg-sand p-5">
                  <p className="text-lg font-black">{selectedPet.name}</p>
                  <p className="mt-2 text-sm text-ink/70">
                    {selectedPet.species} • {selectedPet.breed}
                  </p>
                  <p className="mt-4 text-sm text-ink/70">DOB: {selectedPet.dob || "Not recorded"}</p>
                  <p className="mt-1 text-sm text-ink/70">Weight: {selectedPet.weight ? `${selectedPet.weight} kg` : "Not recorded"}</p>
                </div>
                <div>
                  <h3 className="mb-4 text-lg font-black">Weight trend</h3>
                  <WeightChart logs={selectedWeights} />
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-ink/60">Choose or create a pet to unlock records, weight tracking, and vaccinations.</p>
            )}
          </div>

          <form className="panel p-6" onSubmit={submitRecord}>
            <h3 className="text-xl font-black">Add health record</h3>
            <div className="mt-5 grid gap-4">
              <input className="input" type="date" value={recordForm.date} onChange={(event) => setRecordForm((value) => ({ ...value, date: event.target.value }))} required />
              <input className="input" value={recordForm.symptoms} onChange={(event) => setRecordForm((value) => ({ ...value, symptoms: event.target.value }))} placeholder="Symptoms, comma separated" required />
              <input className="input" value={recordForm.diagnosis} onChange={(event) => setRecordForm((value) => ({ ...value, diagnosis: event.target.value }))} placeholder="Diagnosis" required />
              <select className="input" value={recordForm.severity} onChange={(event) => setRecordForm((value) => ({ ...value, severity: event.target.value }))}>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
              <textarea className="input min-h-24" value={recordForm.notes} onChange={(event) => setRecordForm((value) => ({ ...value, notes: event.target.value }))} placeholder="Owner notes" />
            </div>
            <button className="button-primary mt-5" type="submit" disabled={!selectedPetId}>
              Add health record
            </button>
          </form>

          <form className="panel p-6" onSubmit={submitWeight}>
            <h3 className="text-xl font-black">Log weight</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input className="input" type="number" step="0.1" value={weightForm.weight_kg} onChange={(event) => setWeightForm((value) => ({ ...value, weight_kg: event.target.value }))} placeholder="Weight kg" required />
              <input className="input" type="date" value={weightForm.recorded_date} onChange={(event) => setWeightForm((value) => ({ ...value, recorded_date: event.target.value }))} required />
            </div>
            <button className="button-primary mt-5" type="submit" disabled={!selectedPetId}>
              Save weight log
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
