import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/getUserFromRequest'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const auth = await getUserFromRequest()

		if (!auth) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { foodId, fromFridgeId, toFridgeId, quantity, unit_symbol } = body

		if (!foodId || !fromFridgeId || !toFridgeId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			)
		}

		const userResult = await db.query('SELECT name FROM users WHERE id = $1', [
			auth.userId,
		])

		const userName = userResult.rows[0]?.name || 'Пользователь'

		const foodResult = await db.query(
			`SELECT f.*, fd.name as from_fridge_name 
       FROM foods f
       LEFT JOIN fridges fd ON f.fridge_id = fd.id
       WHERE f.id = $1`,
			[foodId]
		)

		if (foodResult.rows.length === 0) {
			return NextResponse.json({ error: 'Food not found' }, { status: 404 })
		}

		const food = foodResult.rows[0]

		const toFridgeResult = await db.query(
			'SELECT name FROM fridges WHERE id = $1',
			[toFridgeId]
		)

		const toFridgeName =
			toFridgeResult.rows[0]?.name || 'Неизвестный холодильник'

		const updateResult = await db.query(
			`UPDATE foods 
       SET fridge_id = $1 
       WHERE id = $2 
       RETURNING *`,
			[toFridgeId, foodId]
		)

		await db.query(
			`INSERT INTO food_logs (action_type, product_name, quantity, unit_symbol, from_fridge_id, to_fridge_id, user_id, user_name, fridge_name, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
			[
				'move',
				food.name,
				quantity || food.quantity,
				unit_symbol || food.unit_symbol || 'шт',
				fromFridgeId,
				toFridgeId,
				auth.userId,
				userName,
				`${food.from_fridge_name} → ${toFridgeName}`,
			]
		)

		return NextResponse.json({
			success: true,
			message: 'Product moved successfully',
			food: updateResult.rows[0],
		})
	} catch (error) {
		console.error('Error moving food:', error)
		return NextResponse.json({ error: 'Failed to move food' }, { status: 500 })
	}
}
