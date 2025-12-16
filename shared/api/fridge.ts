import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useFridges() {
	return useQuery({
		queryKey: ['fridges'],
		queryFn: async () => {
			const res = await fetch('/api/fridge')
			if (!res.ok) throw new Error()
			return res.json()
		},
	})
}

export function useCreateFridge() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: async (name: string) => {
			await fetch('/api/fridge', {
				method: 'POST',
				body: JSON.stringify({ name }),
			})
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ['fridges'] }),
	})
}
