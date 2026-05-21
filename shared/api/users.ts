import { registerSchema, updateUserSchema } from '@/utils/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import type { User } from '../types/api'

export type CreateUserInput = z.infer<typeof registerSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

export function useUsers() {
	return useQuery<User[]>({
		queryKey: ['users'],
		queryFn: async () => {
			const res = await fetch('/api/users')

			if (!res.ok) {
				const error = await res.json().catch(() => null)
				throw new Error(error?.error || 'Failed to fetch users')
			}

			return res.json()
		},
	})
}

export function useCreateUser() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreateUserInput) => {
			const res = await fetch('/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			if (!res.ok) {
				const error = await res.json().catch(() => null)
				throw new Error(error?.error || 'Failed to create user')
			}

			return res.json() as Promise<User>
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['users'] })
		},
	})
}

export function useDeleteUser() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: async (userId: string) => {
			const res = await fetch(`/api/users?id=${userId}`, {
				method: 'DELETE',
			})

			if (!res.ok) {
				const error = await res.json().catch(() => null)
				throw new Error(error?.error || 'Failed to delete user')
			}

			return res.json() as Promise<{ success: boolean }>
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['users'] })
		},
	})
}

export function useUpdateUser() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: async (data: UpdateUserInput) => {
			const res = await fetch('/api/users', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			if (!res.ok) {
				const error = await res.json().catch(() => null)
				throw new Error(error?.error || 'Failed to update user')
			}

			return res.json() as Promise<User>
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['users'] })
			qc.invalidateQueries({ queryKey: ['me'] })
		},
	})
}
