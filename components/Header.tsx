'use client'

import LogoImage from '@/assets/logo.png'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
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
		<header className='px-6 py-2 shadow bg-white fixed top-0 left-0 right-0 z-10'>
			<nav className='w-full flex items-center justify-between'>
				<Link href='/' className='text-white font-bold text-lg'>
					<Image
						src={LogoImage}
						width={300}
						height={140}
						alt='Сибирский цемент'
						className='w-auto h-10'
					/>
				</Link>
				<ul className='flex gap-4 items-center justify-end'>
					{!user && (
						<>
							<li>
								<Link href='/login'>Войти</Link>
							</li>
						</>
					)}

					{user && user.role === 'admin' && (
						<>
							<li>
								<Link href='/food'>Продукты</Link>
							</li>
							<li>
								<Link href='/users'>Пользователи</Link>
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
