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
