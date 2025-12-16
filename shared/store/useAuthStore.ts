import { create } from 'zustand'

type User = {
	id: string
	name: string
	email: string
	role: 'admin' | 'editor' | 'viewer'
}

type State = {
	user: User | null
	setUser: (u: User | null) => void
}

export const useAuthStore = create<State>(set => ({
	user: null,
	setUser: user => set({ user }),
}))
