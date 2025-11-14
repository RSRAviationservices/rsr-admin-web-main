import { create } from 'zustand'

import { checkAdminSession } from '@/api/services/auth.api'
import type { Admin } from '@/types/admin'

interface AuthState {
  admin: Admin | null
  isAuthenticated: boolean
  isInitialized: boolean
  actions: {
    // Login logic is now handled by useLoginMutation
    logout: (shouldCallApi?: boolean) => void
    checkSession: () => Promise<void>
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  isInitialized: false,
  actions: {
    logout: (shouldCallApi = true) => {
      if (shouldCallApi) {
        console.warn('API logout should be handled by useLogoutMutation.')
      }
      set({ admin: null, isAuthenticated: false })
    },
    checkSession: async () => {
      try {
        const { data } = await checkAdminSession()
        set({ admin: data, isAuthenticated: true, isInitialized: true })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        set({ admin: null, isAuthenticated: false, isInitialized: true })
      }
    }
  }
}))
