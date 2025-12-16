import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
	;(await cookies()).set('token', '', {
		httpOnly: true,
		expires: new Date(0),
		path: '/',
	})

	return NextResponse.json({ ok: true })
}
