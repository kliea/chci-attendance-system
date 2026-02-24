import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: true,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.profile?.role ?? null,
    isManager: (state) => ['admin', 'manager', 'supervisor'].includes(state.profile?.role),
    isEmployee: (state) => state.profile?.role === 'employee',
    fullName: (state) => state.profile?.full_name ?? '',
  },

  actions: {
    async init() {
      this.loading = true
      this.error = null
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          this.user = session.user
          await this.fetchProfile()
        } else {
          this.user = null
          this.profile = null
        }
      } catch (err) {
        this.user = null
        this.profile = null
        this.error = err?.message ?? 'Failed to load session'
      }
      this.loading = false
    },

    async fetchProfile() {
      if (!this.user?.id) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .maybeSingle()
      if (error) {
        this.error = error.message
        this.profile = null
        return
      }
      this.profile = data ?? null
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
      await supabase.auth.signOut()
      this.user = null
      this.profile = null
      this.error = null
    },

    clearError() {
      this.error = null
    },
  },
})
