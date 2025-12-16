export const ROLE = {
	ADMIN: 1,
	EDITOR: 2,
	VIEWER: 3,
} as const

export const unauthorizedPaths = ['/login', '/register']
