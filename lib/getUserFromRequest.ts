'use server'

import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export type AuthUser = {
	userId: string
	roleId: number
}

export async function getUserFromRequest(): Promise<AuthUser | null> {
	const token = (await cookies()).get('token')?.value
	if (!token) return null

	try {
		return jwt.verify(token, process.env.JWT_SECRET!) as AuthUser
	} catch {
		return null
	}
}
