import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/getUserFromRequest'
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
