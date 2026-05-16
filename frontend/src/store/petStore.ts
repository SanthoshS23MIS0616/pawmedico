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

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  dashboard: null,
  selectedPetId: null,
  loading: false,
  error: null,
  async refresh() {
    set({ loading: true, error: null });
    try {
      const dashboard = await api.getDashboard();
      const existingSelection = get().selectedPetId;
      const nextSelectedId = dashboard.pets.some((pet) => pet.id === existingSelection) ? existingSelection : dashboard.pets[0]?.id ?? null;
      set({
        dashboard,
        pets: dashboard.pets,
        selectedPetId: nextSelectedId,
        loading: false
      });
    } catch (error) {
      set({ error: api.normalizeError(error), loading: false });
    }
  },
  selectPet(petId) {
    set({ selectedPetId: petId });
  }
}));
