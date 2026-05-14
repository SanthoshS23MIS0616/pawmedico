export type DashboardResponse = {
  metrics: { label: string; value: string }[];
  pets: Pet[];
  recent_records: HealthRecord[];
  upcoming_vaccinations: Vaccination[];
  appointments: Appointment[];
  weight_logs: WeightLog[];
};

export type Pet = {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string;
  dob?: string | null;
  weight?: number | null;
  photo_url?: string | null;
  created_at: string;
};

export type HealthRecord = {
  id: string;
  pet_id: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  severity: string;
  notes?: string | null;
  created_at: string;
};

export type WeightLog = {
  id: string;
  pet_id: string;
  weight_kg: number;
  recorded_date: string;
  created_at: string;
};

export type Vaccination = {
  id: string;
  pet_id: string;
  vaccine_name: string;
  given_date: string;
  next_due_date: string;
  reminder_sent: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  pet_id: string;
  vet_name: string;
  vet_location: string;
  date: string;
  status: string;
  created_at: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<{ status: string; gemini_configured: boolean }>("/health"),
  getAuthConfig: () => request<{ configured: boolean; google_login_ready: boolean; demo_mode_available: boolean }>("/auth/config"),
  getDashboard: () => request<DashboardResponse>("/dashboard"),
  getPets: () => request<Pet[]>("/pets"),
  createPet: (payload: Omit<Pet, "id" | "created_at">) => request<Pet>("/pets", { method: "POST", body: JSON.stringify(payload) }),
  createHealthRecord: (petId: string, payload: { date: string; symptoms: string[]; diagnosis: string; severity: string; notes?: string }) =>
    request<HealthRecord>(`/pets/${petId}/records`, { method: "POST", body: JSON.stringify(payload) }),
  createWeightLog: (petId: string, payload: { weight_kg: number; recorded_date: string }) =>
    request<WeightLog>(`/pets/${petId}/weights`, { method: "POST", body: JSON.stringify(payload) }),
  getVaccinations: () => request<Vaccination[]>("/vaccinations"),
  createVaccination: (payload: { pet_id: string; vaccine_name: string; given_date: string; next_due_date: string; reminder_sent?: boolean }) =>
    request<Vaccination>("/vaccinations", { method: "POST", body: JSON.stringify(payload) }),
  getAppointments: () => request<Appointment[]>("/appointments"),
  createAppointment: (payload: { pet_id: string; vet_name: string; vet_location: string; date: string; status?: string }) =>
    request<Appointment>("/appointments", { method: "POST", body: JSON.stringify(payload) }),
  getSymptomCatalog: (breed?: string) => request<{ breed?: string | null; symptoms: string[]; all_breeds: string[] }>(`/symptoms/catalog${breed ? `?breed=${encodeURIComponent(breed)}` : ""}`),
  predictSymptoms: (payload: { animal: string; breed?: string | null; symptoms: string[] }) =>
    request<{ disease: string; severity: string; confidence: number; vet_link?: string | null; matched_symptoms: string[]; advice: string[]; source: string }>("/symptoms/predict", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  recommendBreeds: (payload: Record<string, number>) =>
    request<{ matches: { name: string; similarity: number; url: string; summary: string }[]; source: string; warning?: string | null }>("/recommender/breeds", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  generatePrescription: (payload: Record<string, unknown>) =>
    request<{ disease: string; explanation: string; prescription_plan: any[]; diet_plan: any[]; pdf_url?: string | null; source: string; warning?: string | null }>("/prescriptions/generate", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  chat: (payload: { message: string; pet_id?: string | null; language: "en" | "ta" | "hi" }) =>
    request<{ reply: string; source: string; warning?: string | null }>("/chat", { method: "POST", body: JSON.stringify(payload) }),
  chatStream: async (
    payload: { message: string; pet_id?: string | null; language: "en" | "ta" | "hi" },
    handlers: { onChunk: (chunk: string) => void; onDone?: () => void; onError?: (message: string) => void }
  ) => {
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok || !response.body) {
      throw new Error(await response.text() || "Unable to start stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        if (!part.startsWith("data:")) continue;
        const chunk = part.replace(/^data:\s?/, "");
        if (chunk.startsWith("[ERROR]")) {
          handlers.onError?.(chunk);
        } else {
          handlers.onChunk(chunk);
        }
      }
    }

    handlers.onDone?.();
  },
  findNearbyVets: (payload: { latitude: number; longitude: number; radius_km: number }) =>
    request<{ vets: { name: string; latitude: number; longitude: number; distance_km: number; map_link: string; source: string }[]; warning?: string | null }>("/vets/nearby", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  uploadSkinImage: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_URL}/analysis/analyze-skin`, { method: "POST", body: form });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  uploadBreedImage: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_URL}/breed/identify`, { method: "POST", body: form });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
};
