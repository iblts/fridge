import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const result = await db.query(`
      SELECT id, name, symbol 
      FROM units 
      ORDER BY id
    `)

		return NextResponse.json(result.rows)
	} catch (error) {
		console.error('Error fetching units:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch units' },
			{ status: 500 }
		)
	}
}
