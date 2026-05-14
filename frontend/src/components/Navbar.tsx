import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/skin-disease", label: "Skin AI" },
  { to: "/breed-finder", label: "Breed Finder" },
  { to: "/symptom-checker", label: "Symptoms" },
  { to: "/prescription", label: "Prescription" },
  { to: "/pawbot", label: "PawBot" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-lg font-black text-white">PM</div>
          <div>
            <p className="font-display text-lg font-black">PawMedic Pro</p>
            <p className="text-sm text-ink/60">Your AI-powered veterinary companion</p>
          </div>
        </NavLink>
        <nav className="flex flex-wrap gap-2">
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
          <NavLink to="/login" className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white">
            Login
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
