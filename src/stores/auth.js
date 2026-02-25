import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.profile?.role ?? null,
    isManager: (state) =>
      ["admin", "manager", "supervisor"].includes(state.profile?.role),
    isEmployee: (state) => state.profile?.role === "employee",
    fullName: (state) => state.profile?.full_name ?? "",
  },

  actions: {
    async init() {
      if (this.loading) return;

      this.loading = true;
      this.error = null;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          this.user = session.user;
          // Only fetch profile if we don't have one
          if (!this.profile || this.profile.id !== this.user.id) {
            await this.fetchProfile();
          }
        } else {
          this.user = null;
          this.profile = null;
        }
      } catch (err) {
        console.error("Auth init error:", err);
        this.user = null;
        this.profile = null;
        this.error = err?.message ?? "Failed to load session";
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      if (!this.user?.id) return;

      // Prevent refetch if we already have profile
      if (this.profile && this.profile.id === this.user.id) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", this.user.id)
          .maybeSingle();

        if (error) {
          console.error("Profile fetch error:", error);
          // Create minimal profile from auth user data to prevent crashes
          this.profile = {
            id: this.user.id,
            email: this.user.email,
            full_name: this.user.user_metadata?.full_name || "User",
            role: "employee", // Default role
          };
          return;
        }

        this.profile = data;
      } catch (err) {
        console.error("Profile fetch exception:", err);
        // Create minimal profile to prevent crashes
        this.profile = {
          id: this.user.id,
          email: this.user.email,
          full_name: this.user.user_metadata?.full_name || "User",
          role: "employee", // Default role
        };
      }
    },

    async signIn(email, password) {
      this.error = null
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        this.error = error.message
        return { ok: false, error: error.message }
      }
      this.user = data.user
      await this.fetchProfile()
      return { ok: true }
    },

    async signUp(email, password, { fullName = '', bioId = null } = {}) {
      this.error = null
      const meta = { full_name: fullName }
      if (bioId) meta.bio_id = bioId
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: meta },
      })
      if (error) {
        this.error = error.message
        return { ok: false, error: error.message }
      }
      if (!data.user) {
        this.error = 'Sign up failed'
        return { ok: false, error: 'Sign up failed' }
      }
      this.user = data.user
      // Profile is created by DB trigger (handle_new_user) so we don't hit RLS on insert
      await this.fetchProfile()
      return { ok: true }
    },

    async signOut() {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Sign out error:", err);
      } finally {
        this.user = null;
        this.profile = null;
        this.error = null;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
