import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fridge } from '../types/api'

export function useFridges() {
	return useQuery<Fridge[]>({
		queryKey: ['fridges'],
		queryFn: async () => {
			const res = await fetch('/api/fridge')
			if (!res.ok) throw new Error()
			return res.json()
		},
	})
}

export function useFridgeById(id: string) {
	return useQuery<Fridge>({
		queryKey: ['fridges', id],
		queryFn: async () => {
			const res = await fetch(`/api/fridge/${id}`)
			if (!res.ok) throw new Error()
			return res.json()
		},
	})
}

export function useCreateFridge() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: async (name: string) => {
			const res = await fetch('/api/fridge', {
				method: 'POST',
				body: JSON.stringify({ name }),
			})
			if (!res.ok) throw new Error()
			return res.json()
		},

		onMutate: async name => {
			await qc.cancelQueries({ queryKey: ['fridges'] })

			const prev = qc.getQueryData<Fridge[]>(['fridges'])

			qc.setQueryData(['fridges'], (old: Fridge[]) => [
				...(old ?? []),
				{ id: 'temp', name },
			])

			return { prev }
		},

		onError: (_, __, ctx) => {
			qc.setQueryData(['fridges'], ctx?.prev)
		},

		onSettled: () => {
			qc.invalidateQueries({ queryKey: ['fridges'] })
		},
	})
}
