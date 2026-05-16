import { FormEvent, useEffect, useMemo, useState } from "react";

import { ImageUploader } from "../components/ImageUploader";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { PetCard } from "../components/PetCard";
import { WeightChart } from "../components/WeightChart";
import { uploadPetPhotoToSupabase } from "../lib/supabase";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { usePetStore } from "../store/petStore";

export function DashboardPage() {
  const { authConfig, initialized, mode, user } = useAuthStore((state) => ({
    authConfig: state.authConfig,
    initialized: state.initialized,
    mode: state.mode,
    user: state.user
  }));
  const { dashboard, pets, selectedPetId, loading, error, refresh, selectPet } = usePetStore();
  const [petForm, setPetForm] = useState({ name: "", species: "Dog", breed: "", dob: "", weight: "", photo_url: "" });
  const [petPhotoFile, setPetPhotoFile] = useState<File | null>(null);
  const [recordForm, setRecordForm] = useState({ date: "", symptoms: "", diagnosis: "", severity: "moderate", notes: "" });
  const [weightForm, setWeightForm] = useState({ weight_kg: "", recorded_date: "" });
  const [editForm, setEditForm] = useState({ name: "", species: "", breed: "", dob: "", weight: "", photo_url: "" });
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialized) {
      void refresh();
    }
  }, [initialized, refresh]);

  useEffect(() => {
    const selectedProfile = localStorage.getItem("pawmedic-selected-profile");
    if (!selectedProfile) return;
    try {
      const parsed = JSON.parse(selectedProfile) as { animal?: string; breed?: string };
      setPetForm((current) => ({
        ...current,
        species: current.species === "Dog" && parsed.animal ? parsed.animal : current.species || parsed.animal || "Dog",
        breed: current.breed || parsed.breed || ""
      }));
    } catch {
      return;
    }
  }, []);

  const selectedPet = useMemo(() => pets.find((pet) => pet.id === selectedPetId) ?? null, [pets, selectedPetId]);
  const selectedWeights = useMemo(() => dashboard?.weight_logs.filter((item) => item.pet_id === selectedPetId) ?? [], [dashboard, selectedPetId]);

  useEffect(() => {
    if (!selectedPet) return;
    setEditForm({
      name: selectedPet.name,
      species: selectedPet.species,
      breed: selectedPet.breed,
      dob: selectedPet.dob || "",
      weight: selectedPet.weight ? String(selectedPet.weight) : "",
      photo_url: selectedPet.photo_url || ""
    });
    setEditPhotoFile(null);
  }, [selectedPet]);

  async function uploadPhoto(file: File) {
    if (authConfig?.storage_ready && mode === "authenticated" && user) {
      const uploaded = await uploadPetPhotoToSupabase({ userId: user.id, file, bucket: authConfig.storage_bucket });
      return uploaded.publicUrl;
    }
    const uploaded = await api.uploadPetPhoto(file);
    return uploaded.public_url;
  }

  async function submitPet(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const photoUrl = petPhotoFile ? await uploadPhoto(petPhotoFile) : petForm.photo_url || null;
      await api.createPet({
        name: petForm.name,
        species: petForm.species,
        breed: petForm.breed,
        dob: petForm.dob || null,
        weight: petForm.weight ? Number(petForm.weight) : null,
        photo_url: photoUrl
      });
      setPetForm({ name: "", species: "Dog", breed: "", dob: "", weight: "", photo_url: "" });
      setPetPhotoFile(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function submitPetUpdate(event: FormEvent) {
    event.preventDefault();
    if (!selectedPetId) return;
    setSaving(true);
    try {
      const photoUrl = editPhotoFile ? await uploadPhoto(editPhotoFile) : editForm.photo_url || null;
      await api.updatePet(selectedPetId, {
        name: editForm.name,
        species: editForm.species,
        breed: editForm.breed,
        dob: editForm.dob || null,
        weight: editForm.weight ? Number(editForm.weight) : null,
        photo_url: photoUrl
      });
      setEditPhotoFile(null);
      await refresh();
    } finally {
      setSaving(false);
    }
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
            <div className="mt-5">
              <ImageUploader file={petPhotoFile} onFileChange={setPetPhotoFile} helper="Upload a pet photo. Live mode uses Supabase Storage; demo mode falls back to local uploads." />
            </div>
            <button className="button-primary mt-5" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save pet"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-2xl font-black">Selected pet overview</h2>
            {selectedPet ? (
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div className="rounded-[24px] bg-sand p-5">
                  {selectedPet.photo_url ? <img className="mb-4 h-48 w-full rounded-[20px] object-cover" src={api.resolveAssetUrl(selectedPet.photo_url) ?? undefined} alt={selectedPet.name} /> : null}
                  <p className="text-lg font-black">{selectedPet.name}</p>
                  <p className="mt-2 text-sm text-ink/70">
                    {selectedPet.species} | {selectedPet.breed}
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

          {selectedPet ? (
            <form className="panel p-6" onSubmit={submitPetUpdate}>
              <h3 className="text-xl font-black">Edit selected pet</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input className="input" value={editForm.name} onChange={(event) => setEditForm((value) => ({ ...value, name: event.target.value }))} placeholder="Name" required />
                <input className="input" value={editForm.species} onChange={(event) => setEditForm((value) => ({ ...value, species: event.target.value }))} placeholder="Species" required />
                <input className="input" value={editForm.breed} onChange={(event) => setEditForm((value) => ({ ...value, breed: event.target.value }))} placeholder="Breed" required />
                <input className="input" type="number" step="0.1" value={editForm.weight} onChange={(event) => setEditForm((value) => ({ ...value, weight: event.target.value }))} placeholder="Weight kg" />
                <input className="input" type="date" value={editForm.dob} onChange={(event) => setEditForm((value) => ({ ...value, dob: event.target.value }))} />
                <input className="input" value={editForm.photo_url} onChange={(event) => setEditForm((value) => ({ ...value, photo_url: event.target.value }))} placeholder="Existing photo URL" />
              </div>
              <div className="mt-5">
                <ImageUploader file={editPhotoFile} onFileChange={setEditPhotoFile} helper="Replace the current pet photo with a new upload." />
              </div>
              <button className="button-primary mt-5" type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update pet"}
              </button>
            </form>
          ) : null}

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
