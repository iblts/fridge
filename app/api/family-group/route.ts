import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/getUserFromRequest'
import { ROLE } from '@/utils/constants'
import { NextResponse } from 'next/server'

export async function GET() {
	const auth = await getUserFromRequest()

	const { rows } = await db.query(
		`
    SELECT fg.*
    FROM family_groups fg
    JOIN users u ON u.family_group_id = fg.id
    WHERE u.id = $1
    `,
		[auth?.userId]
	)

	return NextResponse.json(rows[0] ?? null)
}

export async function POST(req: Request) {
	const auth = await getUserFromRequest()
	const { name } = await req.json()

	const client = await db.connect()
	try {
		await client.query('BEGIN')

		const { rows } = await client.query(
			`
      INSERT INTO family_groups (name)
      VALUES ($1)
      RETURNING id
      `,
			[name]
		)

		await client.query(
			`
      UPDATE users
      SET family_group_id = $1,
          role_id = $2
      WHERE id = $3
      `,
			[rows[0].id, ROLE.ADMIN, auth?.userId]
		)

		await client.query('COMMIT')
		return NextResponse.json({ ok: true })
	} catch {
		await client.query('ROLLBACK')
		return NextResponse.json({ error: 'Failed' }, { status: 500 })
	} finally {
		client.release()
	}
}
