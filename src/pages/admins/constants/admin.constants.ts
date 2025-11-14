import { AdminRole, AdminStatus } from '@/types/admin';

export const adminStatusOptions = [
  { label: 'Active', value: AdminStatus.ACTIVE },
  { label: 'Suspended', value: AdminStatus.SUSPENDED },
];

export const adminRoleOptions = [
  { label: 'Super Admin', value: AdminRole.SUPER_ADMIN },
  { label: 'Admin', value: AdminRole.ADMIN },
];
