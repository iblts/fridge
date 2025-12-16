import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/getUserFromRequest'
import { NextResponse } from 'next/server'

export async function GET() {
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

	return NextResponse.json(rows[0])
}
