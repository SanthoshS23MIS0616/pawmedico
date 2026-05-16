import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AppLanguage, AppTheme, languageLabels } from "../lib/i18n";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useAuthStore } from "../store/authStore";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/animal-gallery", label: "Animal Gallery" },
  { to: "/skin-disease", label: "Skin AI" },
  { to: "/breed-finder", label: "Breed Finder" },
  { to: "/breed-recommender", label: "Breed Match" },
  { to: "/symptom-checker", label: "Symptoms" },
  { to: "/nearby-vets", label: "Nearby Vets" },
  { to: "/vaccinations", label: "Vaccines" },
  { to: "/prescription", label: "Prescription" },
  { to: "/pawbot", label: "PawBot" }
];

export function Navbar({
  preferences
}: {
  preferences: {
    language: AppLanguage;
    theme: AppTheme;
    setLanguage: (language: AppLanguage) => void;
    setTheme: (theme: AppTheme) => void;
  };
}) {
  const { t } = useTranslation();
  const pwa = usePwaInstall();
  const { mode, user, signOut } = useAuthStore((state) => ({
    mode: state.mode,
    user: state.user,
    signOut: state.signOut
  }));

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-ink/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-lg font-black text-white">PM</div>
          <div>
            <p className="font-display text-lg font-black">PetMedico</p>
            <p className="text-sm text-ink/60 dark:text-paper/70">{t("navTagline")}</p>
          </div>
        </NavLink>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-ink text-white" : "bg-white text-ink hover:bg-sand"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <select className="input !w-auto !rounded-full !py-2 text-xs" value={preferences.language} onChange={(event) => preferences.setLanguage(event.target.value as AppLanguage)}>
            {Object.entries(languageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <span className="rounded-full bg-sand px-4 py-2 text-xs font-semibold text-ink/70 dark:bg-white/5 dark:text-paper/80">
            {mode === "authenticated" ? t("navLive") : t("navDemo")}
          </span>
          <button
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink dark:border-white/10 dark:bg-white/5 dark:text-paper"
            onClick={() => preferences.setTheme(preferences.theme === "light" ? "dark" : "light")}
            type="button"
          >
            {preferences.theme === "light" ? t("themeDark") : t("themeLight")}
          </button>
          {pwa.canInstall ? (
            <button className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink" onClick={() => void pwa.promptInstall()} type="button">
              {t("navInstall")}
            </button>
          ) : null}
          {user ? <span className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink/75 xl:inline-flex">{user.email ?? user.id}</span> : null}
          {user ? (
            <button className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void signOut()}>
              {t("navLogout")}
            </button>
          ) : (
            <NavLink to="/login" className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white">
              {t("navLogin")}
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
