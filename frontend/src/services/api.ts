import axios, { AxiosHeaders } from "axios";

import { getStoredAccessToken, getStoredDemoUserId } from "../lib/authStorage";

export type DashboardResponse = {
  metrics: { label: string; value: string }[];
  pets: Pet[];
  recent_records: HealthRecord[];
  upcoming_vaccinations: Vaccination[];
  appointments: Appointment[];
  weight_logs: WeightLog[];
};

export type AuthConfig = {
  provider: string;
  configured: boolean;
  sdk_available: boolean;
  auth_ready: boolean;
  database_ready: boolean;
  storage_ready: boolean;
  google_login_ready: boolean;
  email_password_ready: boolean;
  demo_mode_available: boolean;
  live_mode: boolean;
  storage_bucket: string;
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

export type PetInput = Omit<Pet, "id" | "created_at" | "owner_id">;

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

export type NearbyVet = {
  name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  opening_hours?: string | null;
  open_now?: boolean | null;
  map_link: string;
  source: string;
};

export type PhotoUploadResponse = {
  provider: string;
  public_url: string;
  file_path: string;
};

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const apiBase = new URL(API_URL, window.location.origin);
const publicApiOrigin = apiBase.origin;

function authHeaders() {
  const headers: Record<string, string> = {};
  const token = getStoredAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const demoUserId = getStoredDemoUserId();
    if (demoUserId) {
      headers["X-Demo-User"] = demoUserId;
    }
  }
  return headers;
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers ?? {});
  for (const [key, value] of Object.entries(authHeaders())) {
    headers.set(key, value);
  }
  config.headers = headers;
  return config;
});

function normalizeError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || error.response?.data || error.message;
  }
  return error instanceof Error ? error.message : "Request failed";
}

export function resolveAssetUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${publicApiOrigin}${path}`;
  return path;
}

export const api = {
  publicApiOrigin,
  resolveAssetUrl,
  getHealth: async () => (await apiClient.get("/health")).data as { status: string; gemini_configured: boolean },
  getAuthConfig: async () => (await apiClient.get<AuthConfig>("/auth/config")).data,
  getDashboard: async () => (await apiClient.get<DashboardResponse>("/dashboard")).data,
  getPets: async () => (await apiClient.get<Pet[]>("/pets")).data,
  createPet: async (payload: PetInput) => (await apiClient.post<Pet>("/pets", payload)).data,
  updatePet: async (petId: string, payload: Partial<PetInput>) => (await apiClient.patch<Pet>(`/pets/${petId}`, payload)).data,
  createHealthRecord: async (petId: string, payload: { date: string; symptoms: string[]; diagnosis: string; severity: string; notes?: string }) =>
    (await apiClient.post<HealthRecord>(`/pets/${petId}/records`, payload)).data,
  createWeightLog: async (petId: string, payload: { weight_kg: number; recorded_date: string }) =>
    (await apiClient.post<WeightLog>(`/pets/${petId}/weights`, payload)).data,
  getVaccinations: async () => (await apiClient.get<Vaccination[]>("/vaccinations")).data,
  createVaccination: async (payload: { pet_id: string; vaccine_name: string; given_date: string; next_due_date: string; reminder_sent?: boolean }) =>
    (await apiClient.post<Vaccination>("/vaccinations", payload)).data,
  getAppointments: async () => (await apiClient.get<Appointment[]>("/appointments")).data,
  createAppointment: async (payload: { pet_id: string; vet_name: string; vet_location: string; date: string; status?: string }) =>
    (await apiClient.post<Appointment>("/appointments", payload)).data,
  getSymptomCatalog: async (breed?: string) =>
    (
      await apiClient.get<{ breed?: string | null; symptoms: string[]; all_breeds: string[] }>("/symptoms/catalog", {
        params: breed ? { breed } : undefined
      })
    ).data,
  predictSymptoms: async (payload: { animal: string; breed?: string | null; symptoms: string[] }) =>
    (
      await apiClient.post<{
        disease: string;
        severity: string;
        confidence: number;
        vet_link?: string | null;
        matched_symptoms: string[];
        advice: string[];
        source: string;
      }>("/symptoms/predict", payload)
    ).data,
  recommendBreeds: async (payload: Record<string, number>) =>
    (
      await apiClient.post<{
        matches: { name: string; similarity: number; url: string; summary: string }[];
        source: string;
        warning?: string | null;
        dataset_size?: number | null;
      }>("/recommender/breeds", payload)
    ).data,
  generatePrescription: async (payload: Record<string, unknown>) =>
    (
      await apiClient.post<{
        disease: string;
        explanation: string;
        prescription_plan: Array<Record<string, string>>;
        diet_plan: Array<Record<string, string>>;
        pdf_url?: string | null;
        source: string;
        warning?: string | null;
      }>("/prescriptions/generate", payload)
    ).data,
  chat: async (payload: { message: string; pet_id?: string | null; language: "en" | "ta" | "hi" }) =>
    (await apiClient.post<{ reply: string; source: string; warning?: string | null }>("/chat", payload)).data,
  chatStream: async (
    payload: { message: string; pet_id?: string | null; language: "en" | "ta" | "hi" },
    handlers: { onChunk: (chunk: string) => void; onDone?: () => void; onError?: (message: string) => void }
  ) => {
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
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
  findNearbyVets: async (payload: { latitude: number; longitude: number; radius_km: number }) =>
    (await apiClient.post<{ vets: NearbyVet[]; warning?: string | null }>("/vets/nearby", payload)).data,
  uploadSkinImage: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await apiClient.post("/analysis/analyze-skin", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },
  uploadBreedImage: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await apiClient.post("/breed/identify", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },
  uploadPetPhoto: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await apiClient.post<PhotoUploadResponse>("/pets/photos/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },
  normalizeError
};
