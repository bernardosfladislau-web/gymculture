import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export function useCurrentUser() {
  const { user, setUser, checkUserAuth } = useAuth();

  const updateUser = useCallback(async (data) => {
    const updated = await base44.auth.updateMe(data);
    setUser(updated);
    return updated;
  }, [setUser]);

  const refetch = useCallback(async () => {
    return checkUserAuth();
  }, [checkUserAuth]);

  return { user, loading: false, setUser, updateUser, refetch };
}