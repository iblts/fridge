import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function isPositiveNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value > 0
}

async function getNeedById(needId: number) {
	const result = await db.query(
		`
      SELECT
        n.need_id,
        n.foods_id,
        pd.foods_name,
        COALESCE(pd.unit_id, c.unit_id) as unit_id,
        u.name as unit_name,
        u.symbol as unit_symbol,
        n.count,
        n.done
      FROM need n
      INNER JOIN product_directory pd ON n.foods_id = pd.foods_id
      LEFT JOIN categories c ON pd.category_id = c.id
      LEFT JOIN units u ON COALESCE(pd.unit_id, c.unit_id) = u.id
      WHERE n.need_id = $1
    `,
		[needId]
	)

	return result.rows[0]
}

export async function GET() {
	try {
		const result = await db.query(`
      SELECT
        n.need_id,
        n.foods_id,
        pd.foods_name,
        COALESCE(pd.unit_id, c.unit_id) as unit_id,
        u.name as unit_name,
        u.symbol as unit_symbol,
        n.count,
        n.done
      FROM need n
      INNER JOIN product_directory pd ON n.foods_id = pd.foods_id
      LEFT JOIN categories c ON pd.category_id = c.id
      LEFT JOIN units u ON COALESCE(pd.unit_id, c.unit_id) = u.id
      WHERE COALESCE(n.done, false) = false
      ORDER BY pd.foods_name
    `)

		return NextResponse.json(result.rows)
	} catch (error) {
		console.error('Error fetching needs:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch needs' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const foodsName =
			typeof body.foods_name === 'string'
				? body.foods_name.trim()
				: typeof body.product_name === 'string'
					? body.product_name.trim()
					: ''
		const count = Number(body.count)

		if (!foodsName) {
			return NextResponse.json(
				{ error: 'Название продукта обязательно' },
				{ status: 400 }
			)
		}

		if (!isPositiveNumber(count)) {
			return NextResponse.json(
				{ error: 'Количество должно быть больше 0' },
				{ status: 400 }
			)
		}

		const productResult = await db.query(
			`
      SELECT foods_id
      FROM product_directory
      WHERE foods_name = $1
      LIMIT 1
    `,
			[foodsName]
		)

		if (productResult.rows.length === 0) {
			return NextResponse.json(
				{ error: 'Продукт не найден в справочнике' },
				{ status: 404 }
			)
		}

		const foodsId = productResult.rows[0].foods_id
		const existingResult = await db.query(
			`
      SELECT need_id
      FROM need
      WHERE foods_id = $1 AND COALESCE(done, false) = false
      LIMIT 1
    `,
			[foodsId]
		)

		const needResult =
			existingResult.rows.length > 0
				? await db.query(
						`
          UPDATE need
          SET count = $1, done = false
          WHERE need_id = $2
          RETURNING need_id
        `,
						[count, existingResult.rows[0].need_id]
					)
				: await db.query(
						`
          INSERT INTO need (foods_id, count, done)
          VALUES ($1, $2, false)
          RETURNING need_id
        `,
						[foodsId, count]
					)

		const need = await getNeedById(needResult.rows[0].need_id)
		return NextResponse.json(need, { status: 201 })
	} catch (error) {
		console.error('Error creating need:', error)
		return NextResponse.json(
			{ error: 'Failed to create need' },
			{ status: 500 }
		)
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json()
		const needId = Number(body.need_id)
		const count = Number(body.count)

		if (!Number.isInteger(needId)) {
			return NextResponse.json(
				{ error: 'Некорректный идентификатор записи' },
				{ status: 400 }
			)
		}

		if (!isPositiveNumber(count)) {
			return NextResponse.json(
				{ error: 'Количество должно быть больше 0' },
				{ status: 400 }
			)
		}

		const result = await db.query(
			`
      UPDATE need
      SET count = $1
      WHERE need_id = $2 AND COALESCE(done, false) = false
      RETURNING need_id
    `,
			[count, needId]
		)

		if (result.rows.length === 0) {
			return NextResponse.json(
				{ error: 'Запись не найдена' },
				{ status: 404 }
			)
		}

		const need = await getNeedById(result.rows[0].need_id)
		return NextResponse.json(need)
	} catch (error) {
		console.error('Error updating need:', error)
		return NextResponse.json(
			{ error: 'Failed to update need' },
			{ status: 500 }
		)
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const needId = Number(searchParams.get('id'))

		if (!Number.isInteger(needId)) {
			return NextResponse.json(
				{ error: 'Некорректный идентификатор записи' },
				{ status: 400 }
			)
		}

		const result = await db.query(
			`
      UPDATE need
      SET done = true
      WHERE need_id = $1
      RETURNING need_id
    `,
			[needId]
		)

		if (result.rows.length === 0) {
			return NextResponse.json(
				{ error: 'Запись не найдена' },
				{ status: 404 }
			)
		}

		const need = await getNeedById(result.rows[0].need_id)
		return NextResponse.json(need)
	} catch (error) {
		console.error('Error deleting need:', error)
		return NextResponse.json(
			{ error: 'Failed to delete need' },
			{ status: 500 }
		)
	}
}
