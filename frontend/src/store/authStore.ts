import { create } from "zustand";

import { api, type AuthConfig } from "../services/api";
import {
  clearStoredAuthSnapshot,
  getStoredAuthSnapshot,
  getStoredDemoProfile,
  setStoredDemoProfile,
  setStoredAuthSnapshot,
  type AuthMode
} from "../lib/authStorage";
import { supabase } from "../lib/supabase";

type AuthUser = {
  id: string;
  email: string | null;
};

type AuthState = {
  initialized: boolean;
  loading: boolean;
  authConfig: AuthConfig | null;
  mode: AuthMode;
  user: AuthUser | null;
  error: string | null;
  initialize: () => Promise<void>;
  refreshAuthConfig: () => Promise<AuthConfig>;
  continueDemo: () => void;
  saveDemoProfile: (profile: { name: string; email: string }) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

let subscriptionBound = false;

function syncStoredSnapshot(mode: AuthMode, user: AuthUser | null, accessToken: string | null) {
  setStoredAuthSnapshot({ mode, user, accessToken });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  loading: false,
  authConfig: null,
  mode: getStoredAuthSnapshot().mode,
  user: getStoredAuthSnapshot().user,
  error: null,
  async refreshAuthConfig() {
    const authConfig = await api.getAuthConfig();
    set({ authConfig });
    return authConfig;
  },
  async initialize() {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const authConfig = await get().refreshAuthConfig();
      const demoProfile = getStoredDemoProfile();

      if (supabase && authConfig.auth_ready) {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        const session = data.session;
        const user = session?.user ? { id: session.user.id, email: session.user.email ?? null } : null;
        const mode: AuthMode = user ? "authenticated" : demoProfile ? "demo" : "anonymous";
        syncStoredSnapshot(user ? "authenticated" : "anonymous", user, session?.access_token ?? null);
        set({ authConfig, mode, user, initialized: true, loading: false });

        if (!subscriptionBound) {
          subscriptionBound = true;
          supabase.auth.onAuthStateChange((_event, nextSession) => {
            const nextUser = nextSession?.user ? { id: nextSession.user.id, email: nextSession.user.email ?? null } : null;
            const nextMode: AuthMode = nextUser ? "authenticated" : getStoredDemoProfile() ? "demo" : "anonymous";
            syncStoredSnapshot(nextUser ? "authenticated" : "anonymous", nextUser, nextSession?.access_token ?? null);
            set({ mode: nextMode, user: nextUser, initialized: true });
          });
        }
        return;
      }

      const fallbackMode: AuthMode = demoProfile ? "demo" : "anonymous";
      clearStoredAuthSnapshot();
      set({ authConfig, mode: fallbackMode, user: null, initialized: true, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to initialize authentication.",
        initialized: true,
        loading: false
      });
    }
  },
  continueDemo() {
    const demoProfile = getStoredDemoProfile();
    set({ mode: demoProfile ? "demo" : "anonymous", user: null });
  },
  saveDemoProfile(profile) {
    setStoredDemoProfile(profile);
    set({ mode: "demo", user: null });
  },
  async signInWithGoogle() {
    if (!supabase) {
      throw new Error("Supabase auth client is not configured.");
    }
    set({ error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      set({ error: error.message });
      throw error;
    }
  },
  async signInWithPassword(email, password) {
    if (!supabase) {
      throw new Error("Supabase auth client is not configured.");
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
    const user = data.user ? { id: data.user.id, email: data.user.email ?? null } : null;
    syncStoredSnapshot("authenticated", user, data.session?.access_token ?? null);
    set({ mode: "authenticated", user, loading: false });
  },
  async signUpWithPassword(email, password) {
    if (!supabase) {
      throw new Error("Supabase auth client is not configured.");
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
    const user = data.user ? { id: data.user.id, email: data.user.email ?? null } : null;
    syncStoredSnapshot(user ? "authenticated" : "anonymous", user, data.session?.access_token ?? null);
    set({ mode: user ? "authenticated" : "anonymous", user, loading: false });
  },
  async signOut() {
    set({ loading: true, error: null });
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      clearStoredAuthSnapshot();
      set({ mode: getStoredDemoProfile() ? "demo" : "anonymous", user: null, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Unable to sign out." });
      throw error;
    }
  }
}));
