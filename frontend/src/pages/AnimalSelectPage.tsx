import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type AnimalCard = {
  id: string;
  name: string;
  image: string;
};

type Catalog = {
  animals: AnimalCard[];
};

function assetUrl(file: string) {
  return `/animals/${encodeURIComponent(file)}`;
}

export function AnimalSelectPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<Catalog>({ animals: [] });
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/animals/catalog.json")
      .then((response) => response.json())
      .then(setCatalog);
  }, []);

  const animals = useMemo(
    () => catalog.animals.filter((animal) => animal.name.toLowerCase().includes(query.toLowerCase())),
    [catalog.animals, query]
  );

  function selectAnimal(animal: AnimalCard) {
    localStorage.setItem("pawmedic-selected-animal", animal.id);
    navigate(`/breed-gallery/${encodeURIComponent(animal.id)}`);
  }

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex rounded-full bg-coral/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-coral">Animal gallery workflow</p>
            <h1 className="mt-5 text-4xl font-black leading-tight">Choose the animal first, then narrow down to a known breed from your old curated visual library.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70 dark:text-paper/70">
              This restores the familiar visual flow from your older project using the original image collection, now integrated into the React app.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="button-secondary" to="/breed-finder">
                Use AI upload instead
              </Link>
              <Link className="button-secondary" to="/breed-recommender">
                Open breed recommender
              </Link>
            </div>
          </div>
          <div className="rounded-[28px] bg-ink p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Available now</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Dog", "Cat", "Cow", "Goat", "Horse", "Sheep", "Rabbit", "Pigeon", "Ox", "Lovebirds", "Rooster"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black">Select animal</h2>
            <p className="mt-2 text-sm text-ink/65 dark:text-paper/70">Search or browse the available animal categories from the old gallery set.</p>
          </div>
          <div className="w-full md:max-w-sm">
            <label className="label">Search animals</label>
            <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Dog, Cat, Goat..." />
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {animals.map((animal) => (
            <button
              key={animal.id}
              type="button"
              onClick={() => selectAnimal(animal)}
              className="group overflow-hidden rounded-[28px] border border-ink/10 bg-white text-left shadow-panel transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={assetUrl(animal.image)} alt={animal.name} />
              </div>
              <div className="p-5">
                <p className="text-xl font-black">{animal.name}</p>
                <p className="mt-2 text-sm text-ink/65 dark:text-paper/70">Open the breed gallery for this animal</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
