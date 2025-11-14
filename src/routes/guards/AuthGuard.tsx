import { Navigate, useLocation, Outlet } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'

export default function AuthGuard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  // Define public routes that do not require authentication
  const publicPaths = ['/login']

  const isPublicPath = publicPaths.includes(location.pathname)

  // If the user is authenticated
  if (isAuthenticated) {
    // and tries to access a public path like /login, redirect to dashboard
    if (isPublicPath) {
      return <Navigate to="/" replace />
    }
    // otherwise, render the requested protected route
    return <Outlet />
  }

  // If the user is NOT authenticated
  // and is trying to access a protected route, redirect to login
  if (!isPublicPath) {
    return <Navigate to="/login" replace />
  }

  // otherwise, allow access to the public route (e.g., /login)
  return <Outlet />
}
