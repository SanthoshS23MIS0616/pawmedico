import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type BreedCard = {
  animal: string;
  name: string;
  image: string;
};

type Catalog = {
  animals: { id: string; name: string; image: string }[];
  breedsByAnimal: Record<string, BreedCard[]>;
};

function assetUrl(file: string) {
  return `/animals/${encodeURIComponent(file)}`;
}

export function BreedSelectPage() {
  const navigate = useNavigate();
  const params = useParams<{ animal: string }>();
  const animal = decodeURIComponent(params.animal ?? "");
  const [catalog, setCatalog] = useState<Catalog>({ animals: [], breedsByAnimal: {} });
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/animals/catalog.json")
      .then((response) => response.json())
      .then(setCatalog);
  }, []);

  const breeds = useMemo(() => {
    const items = catalog.breedsByAnimal[animal] ?? [];
    return items.filter((breed) => breed.name.toLowerCase().includes(query.toLowerCase()));
  }, [animal, catalog.breedsByAnimal, query]);

  const heroAnimal = catalog.animals.find((item) => item.id === animal);

  function chooseBreed(breed: BreedCard) {
    localStorage.setItem("petmedico-selected-profile", JSON.stringify({ animal: breed.animal, breed: breed.name }));
    navigate(`/symptom-checker?animal=${encodeURIComponent(breed.animal)}&breed=${encodeURIComponent(breed.name)}`);
  }

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex rounded-full bg-coral/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-coral">Breed gallery</p>
            <h1 className="mt-5 text-4xl font-black leading-tight">Select a known {animal || "animal"} breed from the restored visual collection.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70 dark:text-paper/70">
              Choosing a breed here sends the selected animal and breed straight into symptom checking, and also saves it locally so dashboard forms can reuse it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="button-secondary" to="/animal-gallery">
                Back to animal gallery
              </Link>
              <Link className="button-secondary" to="/dashboard">
                Open dashboard
              </Link>
            </div>
          </div>
          {heroAnimal ? (
            <div className="overflow-hidden rounded-[30px]">
              <img className="h-full min-h-[240px] w-full object-cover" src={assetUrl(heroAnimal.image)} alt={heroAnimal.name} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black">{animal} breeds</h2>
            <p className="mt-2 text-sm text-ink/65 dark:text-paper/70">
              Available right now from your old curated set: {breeds.length} breeds
            </p>
          </div>
          <div className="w-full md:max-w-sm">
            <label className="label">Search breeds</label>
            <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${animal} breeds`} />
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {breeds.map((breed) => (
            <button
              key={`${breed.animal}-${breed.name}`}
              type="button"
              onClick={() => chooseBreed(breed)}
              className="group overflow-hidden rounded-[24px] border border-ink/10 bg-white text-left shadow-panel transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={assetUrl(breed.image)} alt={breed.name} />
              </div>
              <div className="p-4">
                <p className="text-base font-black">{breed.name}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-coral">Use this breed</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
