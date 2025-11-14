import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { loginAdmin, logoutAdmin } from '../services/auth.api'

import type { LoginFormValues } from '@/pages/auth/hooks/useLoginForm'
import { useAuthStore } from '@/store/authStore'

export function useLoginMutation() {
  const navigate = useNavigate()
  const checkSession = useAuthStore((state) => state.actions.checkSession)

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginAdmin(values),
    onSuccess: async () => {
      await checkSession()
      navigate('/dashboard', { replace: true })
      toast.success('Login successful!')
    },
    onError: (error) => {
      toast.error('Login Failed', { description: error.message })
    }
  })
}

export function useLogoutMutation() {
  const navigate = useNavigate()
  const logoutAction = useAuthStore((state) => state.actions.logout)

  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      logoutAction(false)
      navigate('/login')
      toast.info('You have been logged out.')
    },
    onError: (error) => {
      toast.error('Logout failed', { description: error.message })
      logoutAction(false)
      navigate('/login')
    }
  })
}
