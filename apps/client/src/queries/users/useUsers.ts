import { useQuery } from '@tanstack/react-query';

import { api } from 'lib/api';

import { QUERY_KEYS } from './index';

export type UserRole = 'public' | 'user' | 'admin';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string | null;
}

async function fetchUsers(): Promise<UserRow[]> {
  const res = await api.users.$get();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(),
    queryFn: fetchUsers,
  });
}
