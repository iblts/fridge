import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/getUserFromRequest'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const auth = await getUserFromRequest()

		if (!auth) {
			return NextResponse.json({ user: null }, { status: 401 })
		}

		const { rows } = await db.query(
			`
			SELECT
				u.id,
				u.name,
				u.email,
				u.role_id,
				r.name AS role,
				u.family_group_id
			FROM users u
			JOIN roles r ON r.id = u.role_id
			WHERE u.id = $1
			`,
			[auth.userId]
		)

		if (rows.length === 0) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const user = rows[0]

		return NextResponse.json({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role // уже приходит как 'admin', 'editor' или 'viewer' из JOIN
		})
	} catch (error) {
		console.error('Error fetching user:', error)
		return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
	}
}