import { NavLink, Route, Routes } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { BreedFinderPage } from "./pages/BreedFinderPage";
import { BreedRecommenderPage } from "./pages/BreedRecommenderPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NearbyVetsPage } from "./pages/NearbyVetsPage";
import { PawBotPage } from "./pages/PawBotPage";
import { PrescriptionPage } from "./pages/PrescriptionPage";
import { SkinDiseasePage } from "./pages/SkinDiseasePage";
import { SymptomCheckerPage } from "./pages/SymptomCheckerPage";
import { VaccinationsPage } from "./pages/VaccinationsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(123,198,164,0.18),_transparent_35%),linear-gradient(180deg,_#fff8ef_0%,_#f6f2e8_100%)] text-ink">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
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
