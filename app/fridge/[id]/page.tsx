'use client'

import { useAddFood, useFoods } from '@/shared/api/food'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function FridgePage() {
	const { id } = useParams<{ id: string }>()
	const { data: foods } = useFoods(id)
	const addFood = useAddFood(id)
	const user = useAuthStore(s => s.user)

	const [name, setName] = useState('')
	const [quantity, setQuantity] = useState(1)

	const canEdit = user?.role === 'admin' || user?.role === 'editor'

	return (
		<main className='p-6 space-y-6'>
			<h1 className='text-2xl font-semibold'>Холодильник</h1>

			{canEdit && (
				<div className='flex gap-2'>
					<input
						placeholder='Продукт'
						value={name}
						onChange={e => setName(e.target.value)}
						className='border rounded p-2'
					/>
					<input
						type='number'
						value={quantity}
						onChange={e => setQuantity(+e.target.value)}
						className='border rounded p-2 w-24'
					/>
					<button
						onClick={() => addFood.mutate({ name, quantity })}
						className='bg-black text-white px-4 rounded'
					>
						Добавить
					</button>
				</div>
			)}

			<ul className='space-y-2'>
				{foods?.map((f: any) => (
					<li key={f.id} className='border rounded p-3 flex justify-between'>
						<span>{f.name}</span>
						<span>x{f.quantity}</span>
					</li>
				))}
			</ul>
		</main>
	)
}
