import { verifyToken } from '@/lib/auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
	const token = req.cookies.get('token')?.value

	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		verifyToken(token)
		return NextResponse.next()
	} catch {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
	}
}

export const config = {
	matcher: ['/api/fridge/:path*', '/api/food/:path*'],
}
