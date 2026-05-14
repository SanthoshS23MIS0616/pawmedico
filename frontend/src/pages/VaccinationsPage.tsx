import { FormEvent, useEffect, useState } from "react";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { api, Appointment, Pet, Vaccination } from "../services/api";

export function VaccinationsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [vaccineForm, setVaccineForm] = useState({ pet_id: "", vaccine_name: "", given_date: "", next_due_date: "", reminder_sent: false });
  const [appointmentForm, setAppointmentForm] = useState({ pet_id: "", vet_name: "", vet_location: "", date: "", status: "requested" });

  async function refresh() {
    setLoading(true);
    const [petsData, vaccinationData, appointmentData] = await Promise.all([api.getPets(), api.getVaccinations(), api.getAppointments()]);
    setPets(petsData);
    setVaccinations(vaccinationData);
    setAppointments(appointmentData);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitVaccination(event: FormEvent) {
    event.preventDefault();
    await api.createVaccination(vaccineForm);
    setVaccineForm({ pet_id: "", vaccine_name: "", given_date: "", next_due_date: "", reminder_sent: false });
    await refresh();
  }

  async function submitAppointment(event: FormEvent) {
    event.preventDefault();
    await api.createAppointment(appointmentForm);
    setAppointmentForm({ pet_id: "", vet_name: "", vet_location: "", date: "", status: "requested" });
    await refresh();
  }

  return (
    <div className="space-y-6">
      {loading ? <LoadingSpinner label="Loading reminders and appointments..." /> : null}
      <section className="grid gap-6 lg:grid-cols-2">
        <form className="panel p-8" onSubmit={submitVaccination}>
          <h1 className="text-2xl font-black">Vaccination reminders</h1>
          <div className="mt-6 space-y-4">
            <select className="input" value={vaccineForm.pet_id} onChange={(event) => setVaccineForm((value) => ({ ...value, pet_id: event.target.value }))} required>
              <option value="">Choose pet</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Vaccine name" value={vaccineForm.vaccine_name} onChange={(event) => setVaccineForm((value) => ({ ...value, vaccine_name: event.target.value }))} required />
            <input className="input" type="date" value={vaccineForm.given_date} onChange={(event) => setVaccineForm((value) => ({ ...value, given_date: event.target.value }))} required />
            <input className="input" type="date" value={vaccineForm.next_due_date} onChange={(event) => setVaccineForm((value) => ({ ...value, next_due_date: event.target.value }))} required />
          </div>
          <button className="button-primary mt-5" type="submit">
            Save vaccination
          </button>
        </form>

        <form className="panel p-8" onSubmit={submitAppointment}>
          <h2 className="text-2xl font-black">Appointment request</h2>
          <div className="mt-6 space-y-4">
            <select className="input" value={appointmentForm.pet_id} onChange={(event) => setAppointmentForm((value) => ({ ...value, pet_id: event.target.value }))} required>
              <option value="">Choose pet</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Vet name" value={appointmentForm.vet_name} onChange={(event) => setAppointmentForm((value) => ({ ...value, vet_name: event.target.value }))} required />
            <input className="input" placeholder="Clinic location" value={appointmentForm.vet_location} onChange={(event) => setAppointmentForm((value) => ({ ...value, vet_location: event.target.value }))} required />
            <input className="input" type="datetime-local" value={appointmentForm.date} onChange={(event) => setAppointmentForm((value) => ({ ...value, date: event.target.value }))} required />
          </div>
          <button className="button-primary mt-5" type="submit">
            Request appointment
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-8">
          <h3 className="text-xl font-black">Upcoming vaccinations</h3>
          <div className="mt-5 space-y-3">
            {vaccinations.length ? vaccinations.map((item) => <div key={item.id} className="rounded-2xl bg-sand p-4 text-sm">{item.vaccine_name} • Due {item.next_due_date}</div>) : <p className="text-sm text-ink/60">No vaccinations scheduled yet.</p>}
          </div>
        </div>
        <div className="panel p-8">
          <h3 className="text-xl font-black">Appointment queue</h3>
          <div className="mt-5 space-y-3">
            {appointments.length ? appointments.map((item) => <div key={item.id} className="rounded-2xl bg-sand p-4 text-sm">{item.vet_name} • {item.vet_location} • {item.date}</div>) : <p className="text-sm text-ink/60">No appointment requests yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
