import { api, type Pet } from "../services/api";

export function PetCard({ pet, active, onClick }: { pet: Pet; active?: boolean; onClick?: () => void }) {
  const photoUrl = api.resolveAssetUrl(pet.photo_url);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[24px] border p-5 text-left transition ${active ? "border-coral bg-coral/5" : "border-ink/10 bg-white hover:border-ink/30"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-bold">{pet.name}</p>
          <p className="text-sm text-ink/60">
            {pet.species} | {pet.breed}
          </p>
        </div>
        {photoUrl ? <img className="h-16 w-16 rounded-2xl object-cover shadow-panel" src={photoUrl} alt={pet.name} /> : null}
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink/60">Profile</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ink/70">
        <p>Weight: {pet.weight ? `${pet.weight} kg` : "Not set"}</p>
        <p>DOB: {pet.dob || "Not set"}</p>
      </div>
    </button>
  );
}
