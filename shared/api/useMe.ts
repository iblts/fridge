import { useAuthStore } from '@/shared/store/useAuthStore'
import { useQuery } from '@tanstack/react-query'

export function useMe() {
	const setUser = useAuthStore(s => s.setUser)

	return useQuery({
		queryKey: ['me'],
		queryFn: async () => {
			const res = await fetch('/api/me')
			if (!res.ok) return null
			const data = await res.json()
			setUser(data)
			return data
		},
		retry: false,
	})
}
