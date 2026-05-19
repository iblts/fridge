'use client'

import { FoodItem } from '@/components/FoodItem'
import { AddFoodForm } from '@/components/food/AddFoodForm'
import { useFoods } from '@/shared/api/food'
import { useDeleteFridge, useFridgeById } from '@/shared/api/fridge'
import { Food } from '@/shared/types/api'
import { Trash2Icon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

export default function FridgePage() {
	const params = useParams()
	const fridgeId = params.id as string
	const router = useRouter()

	const { data: fridge, isLoading: fridgeLoading } = useFridgeById(fridgeId)
	const { data: foods, isLoading: foodsLoading } = useFoods(fridgeId)
	const { mutateAsync: deleteFridge } = useDeleteFridge()

	if (fridgeLoading || foodsLoading) {
		return <div className='p-6'>Загрузка...</div>
	}

	if (!fridge) {
		return <div className='p-6'>Холодильник не найден</div>
	}

	const sortedFoods = foods?.sort((a: Food, b: Food) => {
		const aExpired = a.expiration_date
			? new Date(a.expiration_date) < new Date()
			: false
		const bExpired = b.expiration_date
			? new Date(b.expiration_date) < new Date()
			: false

		if (aExpired && !bExpired) return -1
		if (!aExpired && bExpired) return 1

		if (a.expiration_date && b.expiration_date) {
			return (
				new Date(a.expiration_date).getTime() -
				new Date(b.expiration_date).getTime()
			)
		}
		return 0
	})

	const handleDeleteFridge = async () => {
		if (!confirm('Вы уверены, что хотите удалить холодильник?')) return
		const res = await deleteFridge(fridgeId)
		if (res.success) router.push('/')
	}

	return (
		<main className='p-6 space-y-6 max-w-4xl mx-auto pt-20'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-semibold'>{fridge.name}</h1>
				<button
					className='border-0 bg-red-900 rounded p-2 cursor-pointer hover:bg-red-800'
					onClick={handleDeleteFridge}
				>
					<Trash2Icon color='#fff' />
				</button>
			</div>

			<AddFoodForm fridgeId={fridgeId} fridgeName={fridge.name} />

			<div className='space-y-2'>
				<h2 className='text-xl font-medium flex items-center gap-2'>
					Продукты
					{foods && foods.length > 0 && (
						<span className='text-sm text-stone-900 font-normal'>
							({foods.length}{' '}
							{foods.length === 1
								? 'продукт'
								: foods.length < 5
								? 'продукта'
								: 'продуктов'}
							)
						</span>
					)}
				</h2>

				<div className='bg-stone-300 rounded-lg overflow-hidden shadow-lg'>
					{sortedFoods && sortedFoods.length > 0 ? (
						<ul className='divide-y divide-stone-800'>
							{sortedFoods.map((food: Food) => (
								<FoodItem key={food.id} food={food} fridgeId={fridgeId} />
							))}
						</ul>
					) : (
						<div className='text-center py-12'>
							<p className='text-stone-800'>
								В холодильнике пока нет продуктов
							</p>
							<p className='text-stone-900 text-sm mt-2'>
								Добавьте первый продукт с помощью формы выше
							</p>
						</div>
					)}
				</div>
			</div>
		</main>
	)
}
