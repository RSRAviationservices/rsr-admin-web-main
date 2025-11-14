import apiClient from '../client'

import type { LoginFormValues } from '@/pages/auth/hooks/useLoginForm'
import type { Admin } from '@/types/admin'

// The login endpoint now returns the admin data directly, not a token.
export const loginAdmin = (values: LoginFormValues): Promise<{ data: Admin }> => {
  return apiClient.post('/admin/auth/login', values)
}

// The logout endpoint clears the session cookie on the backend.
export const logoutAdmin = (): Promise<void> => {
  return apiClient.post('/admin/auth/logout')
}

// This endpoint verifies the cookie and returns the current admin's data.
export const checkAdminSession = (): Promise<{ data: Admin }> => {
  return apiClient.get('/admin/auth/me')
}
