import { create } from "zustand";

import { DashboardResponse, Pet, api } from "../services/api";

type PetStore = {
  pets: Pet[];
  dashboard: DashboardResponse | null;
  selectedPetId: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectPet: (petId: string | null) => void;
};

export const usePetStore = create<PetStore>((set) => ({
  pets: [],
  dashboard: null,
  selectedPetId: null,
  loading: false,
  error: null,
  async refresh() {
    set({ loading: true, error: null });
    try {
      const dashboard = await api.getDashboard();
      set({
        dashboard,
        pets: dashboard.pets,
        selectedPetId: dashboard.pets[0]?.id ?? null,
        loading: false
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load dashboard", loading: false });
    }
  },
  selectPet(petId) {
    set({ selectedPetId: petId });
  }
}));
