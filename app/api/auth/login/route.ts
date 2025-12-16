import { signToken } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const { email, password } = await req.json()

	const { rows } = await db.query(
		`SELECT id, password_hash, role_id FROM users WHERE email = $1`,
		[email]
	)

	const user = rows[0]
	if (!user)
		return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

	const valid = await bcrypt.compare(password, user.password_hash)
	if (!valid)
		return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

	const token = signToken({
		userId: user.id,
		roleId: user.role_id,
	})

	;(await cookies()).set('token', token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	})

	return NextResponse.json({ ok: true })
}
