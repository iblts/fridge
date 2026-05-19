import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const result = await db.query(`
      SELECT
        pd.foods_id,
        pd.foods_name,
        pd.category_id,
        c.name as category_name,
        pd.unit_id,
        u.name as unit_name,
        u.symbol as unit_symbol
      FROM product_directory pd
      LEFT JOIN categories c ON pd.category_id = c.id
      LEFT JOIN units u ON COALESCE(pd.unit_id, c.unit_id) = u.id
      ORDER BY category_name, pd.foods_name
    `)

		return NextResponse.json(result.rows)
	} catch (error) {
		console.error('Error fetching product directory:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch products' },
			{ status: 500 }
		)
	}
}
