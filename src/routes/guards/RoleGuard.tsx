import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AdminRole } from '@/types/admin';

interface RoleGuardProps {
  allowedRoles: AdminRole[];
  fallbackPath?: string;
}

export default function RoleGuard({ allowedRoles, fallbackPath = '/dashboard' }: RoleGuardProps) {
  const { admin, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!admin || !allowedRoles.includes(admin.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
