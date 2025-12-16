import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/getUserFromRequest'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const auth = await getUserFromRequest()
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
		[auth?.userId, fridgeId]
	)

	return NextResponse.json(rows)
}

export async function POST(req: Request) {
	const { name, quantity, fridgeId, expiration_date } = await req.json()

	const { rows } = await db.query(
		`
    INSERT INTO foods (name, quantity, fridge_id, expiration_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
		[name, quantity, fridgeId, expiration_date]
	)

	return NextResponse.json(rows[0])
}

export async function PUT(req: Request) {
	const { id, quantity, name, expiration_date } = await req.json()

	await db.query(
		`
    UPDATE foods
    SET name = $1,
        quantity = $2,
        expiration_date = $3
    WHERE id = $4
    `,
		[name, quantity, expiration_date, id]
	)

	return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
	const { foodId } = await req.json()

	await db.query(`DELETE FROM foods WHERE id = $1`, [foodId])

	return NextResponse.json({ ok: true })
}
