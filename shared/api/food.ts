import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Food } from '../types/api'

export function useFoods(fridgeId: string) {
  return useQuery({
    queryKey: ['foods', fridgeId],
    queryFn: async () => {
      const res = await fetch(`/api/food?fridgeId=${fridgeId}`)
      if (!res.ok) throw new Error()
      return res.json()
    },
  })
}

export function useAddFood(fridgeId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Food>) => {
      await fetch('/api/food', {
        method: 'POST',
        body: JSON.stringify({ ...data, fridgeId }),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods', fridgeId] }),
  })
}

export function useAddFoodWithDetails(fridgeId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string;
      quantity: number;
      unit_symbol: string;
      expiration_date?: string;
    }) => {
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fridgeId }),
      })
      if (!res.ok) throw new Error('Failed to add food')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods', fridgeId] }),
  })
}

export function useUpdateFood(fridgeId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Food>) => {
      await fetch('/api/food', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods', fridgeId] }),
  })
}

export function useDeleteFood(fridgeId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (foodId: string) => {
      const res = await fetch(`/api/food?id=${foodId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error('Failed to delete food')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['foods', fridgeId] })
    },
  })
}
export function useMoveFood() {
  return useMutation({
    mutationFn: async (data: {
      foodId: string;
      fromFridgeId: string;
      toFridgeId: string;
      quantity?: number;
      unit_symbol?: string;
    }) => {
      const res = await fetch('/api/food/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to move food');
      }
      return res.json();
    },
  });
}