import { db } from '@/lib/db'
import { getUserFromRequest } from '@/shared/api/getUserFromRequest'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const auth = await getUserFromRequest()
	const id = (await params).id

	const { rows } = await db.query(
		`
    SELECT f.*
    FROM fridges f
    JOIN users u ON u.id = $1
    WHERE
      (f.creator_id = $1
      OR (
        f.family_group_id IS NOT NULL
        AND f.family_group_id = u.family_group_id
			)) AND f.id = $2
    `,
		[auth?.userId, id]
	)

	return NextResponse.json(rows[0])
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const auth = await getUserFromRequest()
	const id = (await params).id
	let creatorCondition = ''

	if (!auth) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
	}
	if (auth.roleId !== 1) creatorCondition = 'AND f.creator_id = $1'

	await db.query(
		`
			DELETE FROM fridges f WHERE f.id = $2 ${creatorCondition}
    `,
		[auth?.userId, id]
	)

	return NextResponse.json({ success: true })
}
