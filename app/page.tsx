'use client'

import { useCreateFridge, useFridges } from '@/shared/api/fridge'
import { useAuthStore } from '@/shared/store/useAuthStore'
import Link from 'next/link'
import { useState } from 'react'

export default function DashboardPage() {
	const { data: fridges } = useFridges()
	const createFridge = useCreateFridge()
	const user = useAuthStore(s => s.user)

	const [name, setName] = useState('')

	return (
		<main className='p-6 space-y-6'>
			<h1 className='text-2xl font-semibold'>Мои холодильники</h1>

			{user?.role !== 'viewer' && (
				<div className='flex gap-2'>
					<input
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder='Название'
						className='border rounded p-2'
					/>
					<button
						onClick={() => createFridge.mutate(name)}
						className='bg-black text-white px-4 rounded'
					>
						Создать
					</button>
				</div>
			)}

			<ul className='grid gap-3'>
				{fridges?.map((f: any) => (
					<li key={f.id} className='border rounded p-4'>
						<Link href={`/fridge/${f.id}`} className='font-medium'>
							{f.name}
						</Link>
					</li>
				))}
			</ul>
		</main>
	)
}
