import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const { t } = useTranslation();
  const { authConfig, user, mode, loading, error, signInWithGoogle, signInWithPassword, signUpWithPassword, signOut, saveDemoProfile } = useAuthStore((state) => ({
    authConfig: state.authConfig,
    user: state.user,
    mode: state.mode,
    loading: state.loading,
    error: state.error,
    signInWithGoogle: state.signInWithGoogle,
    signInWithPassword: state.signInWithPassword,
    signUpWithPassword: state.signUpWithPassword,
    signOut: state.signOut,
    saveDemoProfile: state.saveDemoProfile
  }));

  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const readiness = useMemo(
    () => [
      { label: t("loginConfigured"), value: authConfig?.configured ? "Yes" : "No" },
      { label: t("loginGoogleReady"), value: authConfig?.google_login_ready ? "Yes" : "No" },
      { label: t("loginEmailReady"), value: authConfig?.email_password_ready ? "Yes" : "No" },
      { label: t("loginStorageReady"), value: authConfig?.storage_ready ? "Yes" : "No" }
    ],
    [authConfig, t]
  );

  async function submitAuth(event: FormEvent) {
    event.preventDefault();
    if (authMode === "signin") {
      await signInWithPassword(email, password);
      return;
    }
    await signUpWithPassword(email, password);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-coral">Authentication</p>
        <h1 className="mt-3 text-3xl font-black">{t("loginTitle")}</h1>
        {!authConfig ? (
          <div className="mt-6">
            <LoadingSpinner label="Checking backend auth configuration..." />
          </div>
        ) : (
          <div className="mt-6 space-y-4 text-sm text-ink/75 dark:text-paper/75">
            <div className="grid gap-3 rounded-2xl bg-sand p-4 md:grid-cols-2">
              {readiness.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/50">{item.label}</p>
                  <p className="mt-1 font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
            <p>{t("loginBody")}</p>
            {user ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold">{t("loginSignedInAs")}</p>
                <p className="mt-1">{user.email ?? user.id}</p>
                <button className="button-secondary mt-4" type="button" onClick={() => void signOut()}>
                  {t("navLogout")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {authConfig.google_login_ready ? (
                  <button className="button-primary w-full" type="button" onClick={() => void signInWithGoogle()} disabled={loading}>
                    {t("loginGoogle")}
                  </button>
                ) : null}
                {authConfig.email_password_ready ? (
                  <form className="space-y-4" onSubmit={submitAuth}>
                    <div>
                      <label className="label">{t("loginEmail")}</label>
                      <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </div>
                    <div>
                      <label className="label">{t("loginPassword")}</label>
                      <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                    </div>
                    <button className="button-primary w-full" type="submit" disabled={loading}>
                      {authMode === "signin" ? t("loginSignIn") : t("loginCreate")}
                    </button>
                    <button className="button-secondary w-full" type="button" onClick={() => setAuthMode((current) => (current === "signin" ? "signup" : "signin"))}>
                      {authMode === "signin" ? t("loginSwitchToCreate") : t("loginSwitchToSignIn")}
                    </button>
                  </form>
                ) : null}
              </div>
            )}
            {loading ? <LoadingSpinner label="Updating session..." /> : null}
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-700">{error}</p> : null}
          </div>
        )}
      </section>

      <section className="panel p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">{t("loginDemoTitle")}</p>
        <h2 className="mt-3 text-2xl font-black">{mode === "demo" ? t("navDemo") : t("loginDemoTitle")}</h2>
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">{t("loginDemoBody")}</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">{t("loginName")}</label>
            <input className="input" value={demoName} onChange={(event) => setDemoName(event.target.value)} placeholder="Pet parent name" />
          </div>
          <div>
            <label className="label">{t("loginEmail")}</label>
            <input className="input" value={demoEmail} onChange={(event) => setDemoEmail(event.target.value)} placeholder="owner@example.com" />
          </div>
          <button
            className="button-primary"
            onClick={() => {
              saveDemoProfile({ name: demoName, email: demoEmail });
              setSaved(true);
            }}
            type="button"
          >
            {t("loginSaveDemo")}
          </button>
          {saved ? <p className="text-sm font-semibold text-emerald-700">{t("loginDemoSaved")}</p> : null}
        </div>
      </section>
    </div>
  );
}
