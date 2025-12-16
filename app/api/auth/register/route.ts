import { db } from '@/lib/db'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const { name, email, password } = await req.json()

	const hash = await bcrypt.hash(password, 10)

	await db.query(
		`INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)`,
		[name, email, hash]
	)

	return NextResponse.json({ ok: true })
}
