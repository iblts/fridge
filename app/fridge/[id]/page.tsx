'use client'

import { FoodItem } from '@/components/FoodItem'
import { useAddFood, useFoods } from '@/shared/api/food'
import { useFridgeById } from '@/shared/api/fridge'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Food } from '@/shared/types/api'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function FridgePage() {
	const { id } = useParams<{ id: string }>()
	const { data: foods } = useFoods(id)
	const { data: fridge } = useFridgeById(id)
	const addFood = useAddFood(id)
	const user = useAuthStore(s => s.user)

	const [name, setName] = useState('')
	const [quantity, setQuantity] = useState(1)
	const [date, setDate] = useState('')

	const canEdit =
		user?.role === 'admin' ||
		user?.role === 'editor' ||
		fridge?.creator_id === user?.id

	return (
		<main className='p-6 space-y-6'>
			<h1 className='text-2xl font-semibold'>Холодильник</h1>

			{canEdit && (
				<div className='flex gap-2'>
					<input
						placeholder='Продукт'
						value={name}
						onChange={e => setName(e.target.value)}
						className='border rounded py-2 px-4'
					/>
					<input
						type='number'
						inputMode='decimal'
						value={quantity}
						onChange={e => setQuantity(+e.target.value)}
						className='border rounded py-2 px-4 w-24'
					/>
					<input
						value={date}
						placeholder='Годен до'
						onChange={e => setDate(e.target.value)}
						className='border rounded py-2 px-4 w-48'
					/>
					<button
						onClick={() => {
							addFood.mutate({
								name,
								quantity,
								expiration_date: date ?? Date.now().toString(),
							})
							setName('')
							setQuantity(1)
							setDate('')
						}}
						className='bg-black text-white px-4 rounded'
					>
						Добавить
					</button>
				</div>
			)}

			<ul className='space-y-2'>
				{foods?.map((f: Food) => (
					<FoodItem key={f.id} food={f} fridgeId={id} />
				))}
			</ul>
		</main>
	)
}
