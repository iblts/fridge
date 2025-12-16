'use client'

import { useUpdateFood } from '@/shared/api/food'
import { useFridgeById } from '@/shared/api/fridge'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Food } from '@/shared/types/api'
import clsx from 'clsx'
import { useState } from 'react'

interface FoodItemProps {
	food: Food
	fridgeId: string
}

export function FoodItem({ food, fridgeId }: FoodItemProps) {
	const user = useAuthStore(s => s.user)
	const { data: fridge } = useFridgeById(fridgeId)

	const canEdit =
		user?.role === 'admin' ||
		user?.role === 'editor' ||
		fridge?.creator_id === user?.id

	const updateFood = useUpdateFood(fridgeId)

	const [edit, setEdit] = useState(false)
	const [name, setName] = useState(food.name ?? '')
	const [quantity, setQuantity] = useState(food.quantity ?? '')
	const [date, setDate] = useState(food.expiration_date ?? '')

	function save() {
		updateFood.mutate({
			id: food.id,
			name,
			quantity,
			expiration_date: date,
		})
		setEdit(false)
	}

	if (!canEdit) {
		return (
			<li className='flex justify-between gap-2 border p-3 rounded'>
				<span>{food.name}</span>
				<span> {food.quantity}шт</span>
				{food.expiration_date && <span>, годен до {food.expiration_date}</span>}
			</li>
		)
	}

	return (
		<li
			className={clsx('border p-3 rounded space-y-2 flex gap-4', {
				'cursor-pointer': !edit,
			})}
			onClick={edit ? undefined : () => setEdit(true)}
		>
			{edit ? (
				<>
					<input
						value={name}
						onChange={e => setName(e.target.value)}
						className='border rounded py-2 px-4 w-full m-0'
					/>
					<input
						type='number'
						value={quantity}
						inputMode='decimal'
						onChange={e => setQuantity(prev => +e.target.value || prev)}
						className='border rounded py-2 px-4 w-full m-0'
					/>
					<input
						value={date}
						placeholder='Годен до'
						onChange={e => setDate(e.target.value)}
						className='border rounded py-2 px-4 w-full m-0'
					/>
					<button
						onClick={save}
						className='text-sm text-green-600 cursor-pointer border-2 rounded-lg p-2 font-bold'
					>
						Сохранить
					</button>
				</>
			) : (
				<div className='flex justify-between gap-2'>
					<span>{food.name},</span>
					<span>
						{food.quantity}шт{!!food.expiration_date && ','}
					</span>
					{food.expiration_date && <span>годен до {food.expiration_date}</span>}
				</div>
			)}
		</li>
	)
}
