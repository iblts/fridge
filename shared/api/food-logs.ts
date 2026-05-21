import { useMutation } from '@tanstack/react-query';

export interface FoodLog {
  action_type: 'add' | 'remove' | 'move';
  product_name: string;
  quantity: number;
  unit_symbol: string;
  from_fridge_id: string | null;
  to_fridge_id: string | null;
  user_id: string;
  user_name: string;
  fridge_name: string | null;
}

export function useAddFoodLog() {
  return useMutation({
    mutationFn: async (data: FoodLog) => {
      const res = await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add food log');
      }
      return res.json();
    },
  });
}