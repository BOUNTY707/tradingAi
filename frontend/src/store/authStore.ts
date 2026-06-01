import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserSettings {
  notifications?: {
    signals: boolean
    email: boolean
    browser: boolean
    highConf: boolean
    dailySummary: boolean
  }
  appearance?: {
    theme: string
    accentColor: string
  }
  preferences?: {
    currency: string
    timezone: string
    language: string
    defaultMarket: string
    defaultTimeframe: string
    minConfidence: string
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  isApproved: boolean
  emailVerified: boolean
  settings?: UserSettings | null
  subscription?: {
    status: string
    plan: { name: string; type: string }
    endDate: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'tradeai-auth' },
  ),
)
