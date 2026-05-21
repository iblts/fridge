import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Need } from '../types/api'

export function useNeeds() {
	return useQuery<Need[]>({
		queryKey: ['need'],
		queryFn: async () => {
			const res = await fetch('/api/need')
			if (!res.ok) throw new Error('Failed to fetch needs')
			return res.json()
		},
	})
}

export function useAddNeed() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: async (data: { foods_name: string; count: number }) => {
			const res = await fetch('/api/need', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			if (!res.ok) {
				const error = await res.json().catch(() => null)
				throw new Error(error?.error || 'Failed to add need')
			}

			return res.json() as Promise<Need>
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['need'] })
		},
	})
}

export function useUpdateNeedCount() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: async (data: { need_id: number; count: number }) => {
			const res = await fetch('/api/need', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			if (!res.ok) {
				const error = await res.json().catch(() => null)
				throw new Error(error?.error || 'Failed to update need')
			}

			return res.json() as Promise<Need>
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['need'] })
		},
	})
}

export function useDeleteNeed() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: async (needId: number) => {
			const res = await fetch(`/api/need?id=${needId}`, {
				method: 'DELETE',
			})

			if (!res.ok) {
				const error = await res.json().catch(() => null)
				throw new Error(error?.error || 'Failed to delete need')
			}

			return res.json() as Promise<Need>
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['need'] })
		},
	})
}
