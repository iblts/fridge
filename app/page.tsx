'use client'

import { useCreateFridge, useFridges } from '@/shared/api/fridge'
import Link from 'next/link'
import { useState } from 'react'

export default function DashboardPage() {
	const { data: fridges } = useFridges()
	const createFridge = useCreateFridge()
	const [name, setName] = useState('')

	function handleCreate() {
		if (!name.trim()) return
		createFridge.mutate(name)
		setName('')
	}

	return (
		<main className='p-6 space-y-6'>
			<h1 className='text-2xl font-semibold'>Мои холодильники</h1>

			<div className='flex gap-2'>
				<input
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder='Название'
					className='border rounded p-2'
				/>
				<button
					onClick={handleCreate}
					className='bg-black text-white px-4 rounded'
				>
					Создать
				</button>
			</div>

			<ul className='grid gap-3'>
				{fridges?.map(f => (
					<li key={f.id} className='border rounded'>
						<Link
							href={`/fridge/${f.id}`}
							className='font-medium w-full h-full block p-4'
						>
							{f.name}
						</Link>
					</li>
				))}
			</ul>
		</main>
	)
}
