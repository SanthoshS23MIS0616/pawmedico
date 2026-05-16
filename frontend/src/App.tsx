import { useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { useAppPreferences } from "./hooks/useAppPreferences";
import { AnimalSelectPage } from "./pages/AnimalSelectPage";
import { BreedFinderPage } from "./pages/BreedFinderPage";
import { BreedRecommenderPage } from "./pages/BreedRecommenderPage";
import { BreedSelectPage } from "./pages/BreedSelectPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NearbyVetsPage } from "./pages/NearbyVetsPage";
import { PawBotPage } from "./pages/PawBotPage";
import { PrescriptionPage } from "./pages/PrescriptionPage";
import { SkinDiseasePage } from "./pages/SkinDiseasePage";
import { SymptomCheckerPage } from "./pages/SymptomCheckerPage";
import { VaccinationsPage } from "./pages/VaccinationsPage";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const preferences = useAppPreferences();
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  return (
    <div className={`min-h-screen text-ink dark:text-paper ${preferences.theme === "dark" ? "dark" : ""}`}>
      <Navbar preferences={preferences} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/animal-gallery" element={<AnimalSelectPage />} />
          <Route path="/breed-gallery/:animal" element={<BreedSelectPage />} />
          <Route path="/skin-disease" element={<SkinDiseasePage />} />
          <Route path="/breed-finder" element={<BreedFinderPage />} />
          <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
          <Route path="/breed-recommender" element={<BreedRecommenderPage />} />
          <Route path="/prescription" element={<PrescriptionPage />} />
          <Route path="/pawbot" element={<PawBotPage />} />
          <Route path="/nearby-vets" element={<NearbyVetsPage />} />
          <Route path="/vaccinations" element={<VaccinationsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="*"
            element={
              <div className="rounded-3xl bg-white p-10 shadow-panel">
                <p className="text-lg font-semibold">Page not found.</p>
                <NavLink className="mt-3 inline-flex text-coral underline" to="/">
                  Return home
                </NavLink>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
