import { Link } from "react-router-dom";

import { AppLanguage, t } from "../utils/translations";

const cards = [
  { title: "Skin Disease AI", body: "Upload a pet skin image for a severity estimate, care tips, and a vet warning signal.", to: "/skin-disease" },
  { title: "Breed Finder", body: "Detect animal and breed from an image using Gemini or the local TensorFlow fallback.", to: "/breed-finder" },
  { title: "Symptom Checker", body: "Select symptoms and get a disease prediction with urgency guidance and reference links.", to: "/symptom-checker" },
  { title: "Prescription PDF", body: "Generate structured medication and diet plans with a downloadable PDF handout.", to: "/prescription" },
  { title: "Nearby Vets", body: "Find local veterinary clinics with OpenStreetMap-powered lookup and direct map links.", to: "/nearby-vets" },
  { title: "PawBot", body: "Ask pet-care questions with profile-aware AI chat and escalation guidance.", to: "/pawbot" }
];

export function HomePage({ language }: { language: AppLanguage }) {
  const copy = t(language);

  return (
    <div className="space-y-8">
      <section className="panel overflow-hidden">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_0.7fr] lg:p-12">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-coral/10 px-4 py-2 text-sm font-bold text-coral">{copy.homeBadge}</div>
            <h1 className="max-w-3xl font-display text-4xl font-black leading-tight sm:text-5xl">
              {copy.homeTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-ink/70 dark:text-paper/70">
              {copy.homeBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="button-primary" to="/dashboard">
                {copy.homePrimary}
              </Link>
              <Link className="button-secondary" to="/login">
                {copy.homeSecondary}
              </Link>
            </div>
            <p className="mt-4 text-sm font-medium text-ink/60 dark:text-paper/60">{copy.homeInstallHint}</p>
          </div>
          <div className="rounded-[30px] bg-ink p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Core stack</p>
            <div className="mt-6 grid gap-3">
              {["React + Vite + Tailwind", "FastAPI + Pydantic", "Supabase-ready auth and storage", "Gemini + TensorFlow + scikit-learn"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} to={card.to} className="panel p-6 transition hover:-translate-y-1">
            <p className="text-lg font-black">{card.title}</p>
            <p className="mt-3 text-sm leading-6 text-ink/70 dark:text-paper/70">{card.body}</p>
            <p className="mt-5 text-sm font-bold text-coral">Open module</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
