import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const result = await db.query(`
      SELECT
        c.id,
        c.name,
        c.unit_id,
        u.symbol as unit_symbol
      FROM categories c
      LEFT JOIN units u ON c.unit_id = u.id
      ORDER BY c.name
    `)

		return NextResponse.json(result.rows)
	} catch (error) {
		console.error('Error fetching categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		)
	}
}
