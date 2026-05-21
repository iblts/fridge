import { z } from 'zod'

export const registerSchema = z.object({
	name: z.string().min(2),
	email: z.email(),
	password: z.string().min(6),
})

export const updateUserSchema = z.object({
	id: z.uuid(),
	name: z.string().min(2),
	role_id: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})
