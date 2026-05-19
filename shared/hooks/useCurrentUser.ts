import { useEffect } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';

export function useCurrentUser() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Загружаем пользователя из localStorage или API
    const loadUser = async () => {
      try {
        // Пробуем получить из localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }

        // Если нет в localStorage, пробуем получить из API
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