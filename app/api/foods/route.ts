import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const foodsName =
			typeof body.foods_name === 'string'
				? body.foods_name.trim()
				: typeof body.name === 'string'
					? body.name.trim()
					: ''

		if (!foodsName) {
			return NextResponse.json(
				{ error: 'Название продукта обязательно' },
				{ status: 400 }
			)
		}

		if (foodsName.length > 100) {
			return NextResponse.json(
				{ error: 'Название продукта должно быть не длиннее 100 символов' },
				{ status: 400 }
			)
		}

		const categoryId =
			body.category_id === undefined ||
			body.category_id === null ||
			body.category_id === ''
				? null
				: Number(body.category_id)

		if (categoryId === null || !Number.isInteger(categoryId)) {
			return NextResponse.json(
				{ error: 'Выберите категорию продукта' },
				{ status: 400 }
			)
		}

		const unitId =
			body.unit_id === undefined || body.unit_id === null || body.unit_id === ''
				? null
				: Number(body.unit_id)

		if (unitId === null || !Number.isInteger(unitId)) {
			return NextResponse.json(
				{ error: 'Выберите единицу измерения по умолчанию' },
				{ status: 400 }
			)
		}

		const result = await db.query(
			`
      WITH inserted AS (
        INSERT INTO product_directory (foods_name, category_id, unit_id)
        VALUES ($1, $2, $3)
        RETURNING foods_id, foods_name, category_id, unit_id
      )
      SELECT
        inserted.foods_id,
        inserted.foods_name,
        inserted.category_id,
        c.name as category_name,
        inserted.unit_id,
        u.name as unit_name,
        u.symbol as unit_symbol
      FROM inserted
      LEFT JOIN categories c ON inserted.category_id = c.id
      LEFT JOIN units u ON inserted.unit_id = u.id
    `,
			[foodsName, categoryId, unitId]
		)

		return NextResponse.json(result.rows[0], { status: 201 })
	} catch (error) {
		if ((error as { code?: string }).code === '23505') {
			return NextResponse.json(
				{ error: 'Такой продукт уже есть в справочнике' },
				{ status: 409 }
			)
		}

		if ((error as { code?: string }).code === '23503') {
			return NextResponse.json(
				{ error: 'Выбранная категория или единица измерения не найдена' },
				{ status: 400 }
			)
		}

		console.error('Error creating product:', error)
		return NextResponse.json(
			{ error: 'Failed to create product' },
			{ status: 500 }
		)
	}
}
