import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/getUserFromRequest'
import { NextResponse } from 'next/server'

export async function GET() {
	const auth = await getUserFromRequest()

	const { rows } = await db.query(
		`
    SELECT f.*
    FROM fridges f
    JOIN users u ON u.id = $1
    WHERE
      f.creator_id = $1
      OR (
        f.family_group_id IS NOT NULL
        AND f.family_group_id = u.family_group_id
      )
    `,
		[auth?.userId]
	)

	return NextResponse.json(rows)
}

export async function POST(req: Request) {
	const auth = await getUserFromRequest()
	const { name } = await req.json()

	const { rows } = await db.query(
		`
    INSERT INTO fridges (name, creator_id)
    VALUES ($1, $2)
    RETURNING *
    `,
		[name, auth?.userId]
	)

	return NextResponse.json(rows[0])
}

export async function PUT(req: Request) {
	const auth = await getUserFromRequest()
	const { fridgeId, name } = await req.json()

	const { rowCount } = await db.query(
		`
    UPDATE fridges
    SET name = $1
    WHERE id = $2
      AND (creator_id = $3 OR $4 = 1)
    `,
		[name, fridgeId, auth?.userId, auth?.roleId]
	)

	if (!rowCount)
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

	return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
	const auth = await getUserFromRequest()
	const { fridgeId } = await req.json()

	const { rowCount } = await db.query(
		`
    DELETE FROM fridges
    WHERE id = $1
      AND (creator_id = $2 OR $3 = 1)
    `,
		[fridgeId, auth?.userId, auth?.roleId]
	)

	if (!rowCount)
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

	return NextResponse.json({ ok: true })
}
