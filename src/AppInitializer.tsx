import { useEffect } from 'react'

import LoadingPage from './pages/common/LoadingPage'
import AppRoutes from './routes'

import { useAuthStore } from '@/store/authStore'

export default function AppInitializer() {
  const { isInitialized, actions } = useAuthStore()

  useEffect(() => {
    actions.checkSession()
  }, [actions])

  if (!isInitialized) {
    return <LoadingPage />
  }

  return <AppRoutes />
}
