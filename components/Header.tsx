'use client'

import { useAuthStore } from '@/shared/store/useAuthStore'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const Header = () => {
	const user = useAuthStore(s => s.user)
	const setUser = useAuthStore(s => s.setUser)
	const router = useRouter()
	const qc = useQueryClient()

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' })
		setUser(null)
		qc.clear()
		router.push('/login')
	}

	return (
		<header className='p-6 border-b'>
			<nav>
				<ul className='flex gap-4 items-center'>
					<li>
						<Link href='/'>Главная</Link>
					</li>

					{!user && (
						<>
							<li>
								<Link href='/login'>Войти</Link>
							</li>
							<li>
								<Link href='/register'>Регистрация</Link>
							</li>
						</>
					)}

					{user && (
						<li>
							<button onClick={logout} className='cursor-pointer'>
								Выйти
							</button>
						</li>
					)}
				</ul>
			</nav>
		</header>
	)
}
