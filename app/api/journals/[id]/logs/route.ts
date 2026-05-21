import { db } from '@/lib/db'
import { getUserFromRequest } from '@/shared/api/getUserFromRequest'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await getUserFromRequest()

		if (!auth) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id: journalId } = await params

		const journalResult = await db.query(
			'SELECT name, user_id FROM journals WHERE id = $1',
			[journalId]
		)

		if (journalResult.rows.length === 0) {
			return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
		}

		const journal = journalResult.rows[0]

		if (journal.user_id !== auth.userId) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		const journalName = journal.name

		let actionType = ''
		if (journalName === 'Убытие') actionType = 'remove'
		else if (journalName === 'Принятие') actionType = 'add'
		else if (journalName === 'Перемещение') actionType = 'move'
		else {
			return NextResponse.json(
				{ error: 'Invalid journal type' },
				{ status: 400 }
			)
		}

		const result = await db.query(
			`SELECT id, action_type, product_name, quantity, unit_symbol, 
              from_fridge_id, to_fridge_id, user_id, user_name, fridge_name, created_at
       FROM food_logs 
       WHERE action_type = $1 AND user_id = $2
       ORDER BY created_at DESC
       LIMIT 100`,
			[actionType, auth.userId]
		)

		return NextResponse.json(result.rows)
	} catch (error) {
		console.error('Error fetching journal logs:', error)
		return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
	}
}
