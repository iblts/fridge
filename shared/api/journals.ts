import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Journal {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FoodLog {
  id: number;
  action_type: 'add' | 'remove' | 'move';
  product_name: string;
  quantity: number;
  unit_symbol: string;
  from_fridge_id: string | null;
  to_fridge_id: string | null;
  user_id: string;
  user_name: string;
  fridge_name: string | null;
  created_at: string;
}

// Получить журналы пользователя
export function useJournals(userId: string) {
  return useQuery<Journal[]>({
    queryKey: ['journals', userId],
    queryFn: async () => {
      const res = await fetch(`/api/journals?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch journals');
      return res.json();
    },
    enabled: !!userId,
  });
}

// Получить записи конкретного журнала
export function useJournalLogs(journalId: string) {
  return useQuery<FoodLog[]>({
    queryKey: ['journals', journalId, 'logs'],
    queryFn: async () => {
      const res = await fetch(`/api/journals/${journalId}/logs`);
      if (!res.ok) throw new Error('Failed to fetch journal logs');
      return res.json();
    },
    enabled: !!journalId,
  });
}

// Создать журналы для нового пользователя
export function useCreateUserJournals() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to create journals');
      return res.json();
    },
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: ['journals', userId] });
    },
  });
}

// Записать действие в журнал
export function useAddFoodLog() {
  return useMutation({
    mutationFn: async (data: Omit<FoodLog, 'id' | 'created_at'>) => {
      const res = await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add food log');
      return res.json();
    },
  });
}