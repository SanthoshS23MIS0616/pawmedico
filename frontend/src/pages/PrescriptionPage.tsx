import { FormEvent, useState } from "react";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { splitSymptoms } from "../utils/diseaseHelpers";
import { api } from "../services/api";

export function PrescriptionPage() {
  const [form, setForm] = useState({
    pet_no: "",
    pet_name: "",
    animal: "Dog",
    breed: "",
    age: "",
    weight: "",
    sex: "",
    disease: "",
    symptoms: "",
    medical_history: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      setResult(
        await api.generatePrescription({
          ...form,
          symptoms: splitSymptoms(form.symptoms)
        })
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form className="panel p-8" onSubmit={submit}>
        <h1 className="text-3xl font-black">Prescription and diet planner</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["pet_no", "Pet number"],
            ["pet_name", "Pet name"],
            ["animal", "Animal"],
            ["breed", "Breed"],
            ["age", "Age"],
            ["weight", "Weight"],
            ["sex", "Sex"],
            ["disease", "Known disease"]
          ].map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" value={(form as Record<string, string>)[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} required={key === "pet_name"} />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="label">Symptoms</label>
            <input className="input" value={form.symptoms} onChange={(event) => setForm((current) => ({ ...current, symptoms: event.target.value }))} placeholder="Vomiting, fever, dehydration" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Medical history</label>
            <textarea className="input min-h-28" value={form.medical_history} onChange={(event) => setForm((current) => ({ ...current, medical_history: event.target.value }))} />
          </div>
        </div>
        <button className="button-primary mt-6" type="submit">
          Generate prescription
        </button>
      </form>

      <section className="panel p-8">
        <h2 className="text-2xl font-black">Generated plan</h2>
        {loading ? <div className="mt-5"><LoadingSpinner label="Creating treatment plan..." /></div> : null}
        {result ? (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-lg font-black">{result.disease}</p>
              <p className="mt-2 text-sm text-ink/70">{result.explanation}</p>
            </div>
            <div>
              <p className="text-sm font-bold">Prescription</p>
              <div className="mt-2 space-y-2">
                {result.prescription_plan.map((item: any, index: number) => (
                  <div key={`${item.medicine}-${index}`} className="rounded-2xl bg-sand p-4 text-sm text-ink/80">
                    {item.date} {item.time} • {item.medicine} • {item.dosage} • {item.route} • {item.duration}
                    <div className="mt-1 text-ink/60">{item.notes}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold">Diet plan</p>
              <div className="mt-2 space-y-2">
                {result.diet_plan.map((item: any, index: number) => (
                  <div key={`${item.food_type}-${index}`} className="rounded-2xl bg-sand p-4 text-sm text-ink/80">
                    {item.date} {item.feeding_time} • {item.food_type} • {item.quantity}
                    <div className="mt-1 text-ink/60">{item.notes}</div>
                  </div>
                ))}
              </div>
            </div>
            {result.pdf_url ? (
              <a className="button-secondary" href={`http://localhost:8000${result.pdf_url}`} target="_blank" rel="noreferrer">
                Open PDF
              </a>
            ) : null}
            {result.warning ? <p className="text-sm font-semibold text-amber-700">{result.warning}</p> : null}
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink/60">The medication and diet plan will appear here after generation.</p>
        )}
      </section>
    </div>
  );
}
