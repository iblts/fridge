import { db } from '@/lib/db'
import bcrypt from 'bcrypt'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				try {
					const result = await db.query(
						'SELECT id, name, email, password_hash, role_id FROM users WHERE email = $1',
						[credentials.email]
					)

					const user = result.rows[0]

					if (!user) {
						return null
					}

					const passwordMatch = await bcrypt.compare(
						credentials.password,
						user.password_hash
					)

					if (!passwordMatch) {
						return null
					}

					return {
						id: user.id,
						email: user.email,
						name: user.name,
						role_id: user.role_id,
					}
				} catch (error) {
					console.error('Auth error:', error)
					return null
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	jwt: {
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async jwt({ token, user }) {
			// При первом входе добавляем id и role_id в токен
			if (user) {
				token.id = user.id
				token.role_id = user.role_id
			}
			return token
		},
		async session({ session, token }) {
			// Добавляем id и role_id из токена в сессию
			if (session.user) {
				session.user.id = token.id as string
				session.user.role_id = token.role_id as number
			}
			return session
		},
	},
	pages: {
		signIn: '/login',
		error: '/login',
	},
	secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
