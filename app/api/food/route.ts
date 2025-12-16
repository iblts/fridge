import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/getUserFromRequest'
import { ROLE } from '@/utils/constants'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const { userId } = await getUserFromRequest()
	const { searchParams } = new URL(req.url)
	const fridgeId = searchParams.get('fridgeId')

	const { rows } = await db.query(
		`
    SELECT fd.*
    FROM foods fd
    JOIN fridges f ON f.id = fd.fridge_id
    JOIN users u ON u.id = $1
    WHERE fd.fridge_id = $2
      AND (
        f.creator_id = $1
        OR f.family_group_id = u.family_group_id
      )
    `,
		[userId, fridgeId]
	)

	return NextResponse.json(rows)
}

export async function POST(req: Request) {
	const { userId, roleId } = await getUserFromRequest()
	if (roleId === ROLE.VIEWER)
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

	const { name, quantity, fridgeId, expirationDate } = await req.json()

	const { rows } = await db.query(
		`
    INSERT INTO foods (name, quantity, fridge_id, expiration_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
		[name, quantity, fridgeId, expirationDate]
	)

	return NextResponse.json(rows[0])
}

export async function PUT(req: Request) {
	const { roleId } = await getUserFromRequest()
	if (roleId === ROLE.VIEWER)
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

	const { foodId, quantity, expirationDate } = await req.json()

	await db.query(
		`
    UPDATE foods
    SET quantity = $1,
        expiration_date = $2
    WHERE id = $3
    `,
		[quantity, expirationDate, foodId]
	)

	return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
	const { roleId } = await getUserFromRequest()
	if (roleId === ROLE.VIEWER)
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

	const { foodId } = await req.json()

	await db.query(`DELETE FROM foods WHERE id = $1`, [foodId])

	return NextResponse.json({ ok: true })
}
