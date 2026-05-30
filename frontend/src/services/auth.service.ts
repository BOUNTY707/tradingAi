import api from '@/lib/api'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { email: string; password: string; firstName: string; lastName: string }

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload)
    return data.data as { user: any; token: string }
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload)
    return data.data as { user: any; token: string }
  },

  async loginWithGoogle(accessToken: string) {
    const { data } = await api.post('/auth/google', { accessToken })
    return data.data as { user: any; token: string }
  },

  async logout() {
    await api.post('/auth/logout')
  },

  async me() {
    const { data } = await api.get('/auth/me')
    return data.data
  },

  async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(token: string, password: string) {
    const { data } = await api.post('/auth/reset-password', { token, password })
    return data
  },
}
