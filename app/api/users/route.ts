import { db } from '@/lib/db'
import { getUserFromRequest } from '@/shared/api/getUserFromRequest'
import { ROLE } from '@/utils/constants'
import { registerSchema, updateUserSchema } from '@/utils/schema'
import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_JOURNALS = [
	{
		name: 'Убытие',
		description:
			'Журнал учета продуктов, которые были взяты из холодильника',
	},
	{
		name: 'Принятие',
		description: 'Журнал учета добавленных продуктов в холодильник',
	},
	{
		name: 'Перемещение',
		description:
			'Журнал учета перемещения продуктов между холодильниками',
	},
]

async function requireAdmin() {
	const auth = await getUserFromRequest()

	if (!auth) {
		return {
			auth: null,
			response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
		}
	}

	if (auth.roleId !== ROLE.ADMIN) {
		return {
			auth,
			response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
		}
	}

	return { auth, response: null }
}

export async function GET() {
	const { response } = await requireAdmin()

	if (response) return response

	const { rows } = await db.query(
		`
		SELECT
			u.id,
			u.name,
			u.email,
			u.role_id,
			r.name AS role,
			u.created_at
		FROM users u
		JOIN roles r ON r.id = u.role_id
		ORDER BY u.created_at DESC, u.name
		`
	)

	return NextResponse.json(rows)
}

export async function POST(req: Request) {
	const { response } = await requireAdmin()

	if (response) return response

	const body = await req.json()
	const parsed = registerSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Invalid user data' },
			{ status: 400 }
		)
	}

	const name = parsed.data.name.trim()
	const email = parsed.data.email.trim().toLowerCase()
	const hash = await bcrypt.hash(parsed.data.password, 10)
	const client = await db.connect()

	try {
		await client.query('BEGIN')

		const existingUser = await client.query(
			'SELECT id FROM users WHERE email = $1',
			[email]
		)

		if (existingUser.rows.length > 0) {
			await client.query('ROLLBACK')
			return NextResponse.json(
				{ error: 'User already exists' },
				{ status: 400 }
			)
		}

		const userResult = await client.query(
			`
			INSERT INTO users (name, email, password_hash, role_id)
			VALUES ($1, $2, $3, $4)
			RETURNING id, name, email, role_id, created_at
			`,
			[name, email, hash, ROLE.VIEWER]
		)

		const user = userResult.rows[0]

		for (const journal of DEFAULT_JOURNALS) {
			await client.query(
				`
				INSERT INTO journals (name, description, user_id)
				VALUES ($1, $2, $3)
				`,
				[journal.name, journal.description, user.id]
			)
		}

		await client.query('COMMIT')

		return NextResponse.json({
			...user,
			role: 'viewer',
		})
	} catch (error) {
		await client.query('ROLLBACK')
		console.error('Error creating user:', error)
		return NextResponse.json(
			{ error: 'Failed to create user' },
			{ status: 500 }
		)
	} finally {
		client.release()
	}
}

export async function PUT(req: Request) {
	const { auth, response } = await requireAdmin()

	if (response) return response

	const body = await req.json()
	const parsed = updateUserSchema.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Invalid user data' },
			{ status: 400 }
		)
	}

	const { id, role_id } = parsed.data
	const name = parsed.data.name.trim()

	if (name.length < 2) {
		return NextResponse.json(
			{ error: 'Invalid user data' },
			{ status: 400 }
		)
	}

	const client = await db.connect()

	try {
		await client.query('BEGIN')

		const targetUser = await client.query(
			'SELECT id, role_id FROM users WHERE id = $1',
			[id]
		)

		if (targetUser.rows.length === 0) {
			await client.query('ROLLBACK')
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const currentRoleId = targetUser.rows[0].role_id
		const isOwnRoleChange = id === auth?.userId && role_id !== currentRoleId

		if (isOwnRoleChange) {
			await client.query('ROLLBACK')
			return NextResponse.json(
				{ error: 'Cannot change current user role' },
				{ status: 400 }
			)
		}

		if (currentRoleId === ROLE.ADMIN && role_id !== ROLE.ADMIN) {
			const admins = await client.query(
				'SELECT COUNT(*)::int AS count FROM users WHERE role_id = $1',
				[ROLE.ADMIN]
			)

			if (admins.rows[0].count <= 1) {
				await client.query('ROLLBACK')
				return NextResponse.json(
					{ error: 'Cannot remove the last admin' },
					{ status: 400 }
				)
			}
		}

		const { rows } = await client.query(
			`
			UPDATE users u
			SET name = $1,
					role_id = $2
			FROM roles r
			WHERE u.id = $3
				AND r.id = $2
			RETURNING
				u.id,
				u.name,
				u.email,
				u.role_id,
				r.name AS role,
				u.created_at
			`,
			[name, role_id, id]
		)

		await client.query('COMMIT')

		return NextResponse.json(rows[0])
	} catch (error) {
		await client.query('ROLLBACK')
		console.error('Error updating user:', error)
		return NextResponse.json(
			{ error: 'Failed to update user' },
			{ status: 500 }
		)
	} finally {
		client.release()
	}
}

export async function DELETE(req: NextRequest) {
	const { auth, response } = await requireAdmin()

	if (response) return response

	const userId = req.nextUrl.searchParams.get('id')

	if (!userId) {
		return NextResponse.json({ error: 'User id is required' }, { status: 400 })
	}

	if (userId === auth?.userId) {
		return NextResponse.json(
			{ error: 'Cannot delete current user' },
			{ status: 400 }
		)
	}

	const client = await db.connect()

	try {
		await client.query('BEGIN')

		const targetUser = await client.query(
			'SELECT id, role_id FROM users WHERE id = $1',
			[userId]
		)

		if (targetUser.rows.length === 0) {
			await client.query('ROLLBACK')
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		if (targetUser.rows[0].role_id === ROLE.ADMIN) {
			const admins = await client.query(
				'SELECT COUNT(*)::int AS count FROM users WHERE role_id = $1',
				[ROLE.ADMIN]
			)

			if (admins.rows[0].count <= 1) {
				await client.query('ROLLBACK')
				return NextResponse.json(
					{ error: 'Cannot delete the last admin' },
					{ status: 400 }
				)
			}
		}

		await client.query('DELETE FROM food_logs WHERE user_id = $1', [userId])
		await client.query('DELETE FROM fridges WHERE creator_id = $1', [userId])
		await client.query('DELETE FROM users WHERE id = $1', [userId])

		await client.query('COMMIT')

		return NextResponse.json({ success: true })
	} catch (error) {
		await client.query('ROLLBACK')
		console.error('Error deleting user:', error)
		return NextResponse.json(
			{ error: 'Failed to delete user' },
			{ status: 500 }
		)
	} finally {
		client.release()
	}
}
