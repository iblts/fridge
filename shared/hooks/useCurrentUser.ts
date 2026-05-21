import { useEffect } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';

export function useCurrentUser() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }

        const res = await fetch('/api/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    if (!user) {
      loadUser();
    }
  }, [user, setUser]);

  return user;
}