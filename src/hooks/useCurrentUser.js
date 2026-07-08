import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(async (data) => {
    const updated = await base44.auth.updateMe(data);
    setUser(updated);
    return updated;
  }, []);

  return { user, loading, setUser, updateUser, refetch: fetchUser };
}