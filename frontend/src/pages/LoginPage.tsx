import { useEffect, useState } from "react";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { api } from "../services/api";

export function LoginPage() {
  const [status, setStatus] = useState<{ configured: boolean; google_login_ready: boolean; demo_mode_available: boolean } | null>(null);
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getAuthConfig().then(setStatus).catch(() => setStatus({ configured: false, google_login_ready: false, demo_mode_available: true }));
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-coral">Authentication</p>
        <h1 className="mt-3 text-3xl font-black">Supabase auth readiness</h1>
        {!status ? <div className="mt-6"><LoadingSpinner label="Checking backend auth configuration..." /></div> : null}
        {status ? (
          <div className="mt-6 space-y-4 text-sm text-ink/75">
            <div className="rounded-2xl bg-sand p-4">
              <p className="font-bold">Supabase configured: {status.configured ? "Yes" : "No"}</p>
              <p className="mt-2">Google login ready: {status.google_login_ready ? "Yes" : "No"}</p>
            </div>
            <p>Add your real `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to enable production login flows.</p>
          </div>
        ) : null}
      </section>

      <section className="panel p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Demo mode</p>
        <h2 className="mt-3 text-2xl font-black">Continue without backend auth</h2>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={demoName} onChange={(event) => setDemoName(event.target.value)} placeholder="Pet parent name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={demoEmail} onChange={(event) => setDemoEmail(event.target.value)} placeholder="owner@example.com" />
          </div>
          <button
            className="button-primary"
            onClick={() => {
              localStorage.setItem("pawmedic-demo-user", JSON.stringify({ name: demoName, email: demoEmail }));
              setSaved(true);
            }}
          >
            Save demo profile
          </button>
          {saved ? <p className="text-sm font-semibold text-emerald-700">Demo profile saved locally for this browser.</p> : null}
        </div>
      </section>
    </div>
  );
}
