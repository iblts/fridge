'use client'

import { useDeleteFood, useMoveFood, useUpdateFood } from '@/shared/api/food'
import { useAddFoodLog } from '@/shared/api/food-logs'
import { useFridgeById, useFridges } from '@/shared/api/fridge'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Food } from '@/shared/types/api'
import clsx from 'clsx'
import {
	ArrowUpDownIcon,
	CalendarFoldIcon,
	HourglassIcon,
	PencilIcon,
	Trash2Icon,
	TriangleAlertIcon,
} from 'lucide-react'
import { useState } from 'react'

interface FoodItemProps {
	food: Food
	fridgeId: string
}

function formatDate(dateString: string | undefined): string {
	if (!dateString) return ''
	const date = new Date(dateString)
	return date.toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}

function getExpiredStatus(dateString: string | undefined): 1 | 2 | 3 {
	if (!dateString) return 1

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const expiryDate = new Date(dateString)
	expiryDate.setHours(0, 0, 0, 0)

	if (expiryDate < today) return 3

	const threeDaysLater = new Date(today)
	threeDaysLater.setDate(today.getDate() + 3)

	if (expiryDate <= threeDaysLater) return 2

	return 1
}

export function FoodItem({ food, fridgeId }: FoodItemProps) {
	const user = useAuthStore(s => s.user)
	const { data: fridge, refetch } = useFridgeById(fridgeId)
	const { data: allFridges, isLoading: fridgesLoading } = useFridges()

	const canEdit =
		user?.role === 'admin' ||
		user?.role === 'editor' ||
		fridge?.creator_id === user?.id

	const updateFood = useUpdateFood(fridgeId)
	const deleteFood = useDeleteFood(fridgeId)
	const moveFood = useMoveFood()
	const addFoodLog = useAddFoodLog()

	const [edit, setEdit] = useState(false)
	const [move, setMove] = useState(false)
	const [name, setName] = useState(food.name ?? '')
	const [quantity, setQuantity] = useState<string>(
		food.quantity?.toString() ?? ''
	)
	const [date, setDate] = useState(
		new Date(food.expiration_date?.split('T')[0] ?? '')
	)
	const [selectedFridgeId, setSelectedFridgeId] = useState('')

	function save() {
		updateFood.mutate({
			id: food.id,
			name,
			quantity: parseFloat(quantity),
			expiration_date: date.toISOString().split('T')[0],
		})
		setEdit(false)
	}

	function handleMove() {
		if (!selectedFridgeId) {
			alert('Выберите холодильник для перемещения')
			return
		}

		if (confirm(`Переместить "${food.name}" в выбранный холодильник?`)) {
			moveFood.mutate(
				{
					foodId: food.id,
					fromFridgeId: fridgeId,
					toFridgeId: selectedFridgeId,
					quantity: food.quantity,
					unit_symbol: food.unit_symbol,
				},
				{
					onSuccess: () => {
						setMove(false)
						setSelectedFridgeId('')
						refetch()
					},
				}
			)
		}
	}

	function handleDelete() {
		if (confirm(`Вы уверены, что хотите удалить продукт "${food.name}"?`)) {
			deleteFood.mutate(food.id, {
				onSuccess: () => {
					if (user) {
						addFoodLog.mutate({
							action_type: 'remove',
							product_name: food.name,
							quantity: food.quantity,
							unit_symbol: food.unit_symbol || 'шт',
							from_fridge_id: fridgeId,
							to_fridge_id: null,
							user_id: user.id,
							user_name: user.name,
							fridge_name: fridge?.name || 'Неизвестный холодильник',
						})
					}
				},
			})
		}
	}

	const formattedDate = formatDate(food.expiration_date)
	const expired = getExpiredStatus(food.expiration_date) === 3
	const almostExpired = getExpiredStatus(food.expiration_date) === 2

	const availableFridges = allFridges?.filter(f => f.id !== fridgeId) || []

	if (!canEdit) {
		return (
			<li className='flex justify-between items-center gap-4 p-4 text-black hover:bg-stone-400 transition-colors border-b border-stone-500'>
				<span className='font-medium'>{food.name}</span>
				<div className='flex items-center gap-4'>
					<span className='text-stone-900'>
						{food.quantity} {food.unit_symbol || 'шт'}
					</span>
					{food.expiration_date && (
						<span
							className={clsx('text-sm', {
								'text-orange-700': almostExpired,
								'text-red-900': expired,
								'text-stone-900': !expired && !almostExpired,
							})}
						>
							{expired ? 'Просрочен! ' : 'годен до '}
							{formattedDate}
						</span>
					)}
				</div>
			</li>
		)
	}

	return (
		<li
			className={clsx(
				'p-4 text-black transition-colors border-b border-stone-400',
				{
					'hover:bg-stone-100': !edit && !move,
					'cursor-pointer': !edit && !move,
				}
			)}
			onClick={!edit && !move ? () => setEdit(true) : undefined}
		>
			{edit ? (
				<div className='space-y-3'>
					<input
						value={name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setName(e.target.value)
						}
						className='border border-stone-400 rounded py-2 px-4 w-full bg-stone-100 text-black focus:outline-none focus:border-stone-500'
						placeholder='Название'
					/>
					<div className='flex gap-3'>
						<input
							type='number'
							step='any'
							value={quantity}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setQuantity(e.target.value)
							}
							className='border border-stone-400 rounded py-2 px-4 bg-stone-100 text-black focus:outline-none focus:border-stone-500 flex-1'
							placeholder='Количество'
						/>
						<input
							type='date'
							value={date.toISOString().split('T')[0]}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setDate(new Date(e.target.value))
							}
							className='border border-stone-400 rounded py-2 px-4 bg-stone-100 text-black focus:outline-none focus:border-stone-500 flex-1'
						/>
					</div>
					<div className='flex gap-2'>
						<button
							onClick={save}
							disabled={updateFood.isPending}
							className='text-sm bg-red-900 text-white cursor-pointer rounded-lg px-4 py-2 font-bold hover:bg-red-800 transition-colors disabled:opacity-50'
						>
							{updateFood.isPending ? 'Сохранение...' : 'Сохранить'}
						</button>
						<button
							onClick={() => setEdit(false)}
							className='text-sm bg-stone-600 text-white cursor-pointer rounded-lg px-4 py-2 font-bold hover:bg-stone-700 transition-colors'
						>
							Отмена
						</button>
					</div>
				</div>
			) : move ? (
				<div className='space-y-3'>
					<div>
						<label className='block text-sm font-medium mb-2 text-black'>
							Выберите холодильник для перемещения
						</label>
						{fridgesLoading ? (
							<div className='text-stone-400'>Загрузка холодильников...</div>
						) : availableFridges.length === 0 ? (
							<div className='text-yellow-400 text-sm'>
								Нет доступных холодильников для перемещения. Создайте новый
								холодильник на главной странице.
							</div>
						) : (
							<select
								value={selectedFridgeId}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
									setSelectedFridgeId(e.target.value)
								}
								className='border border-stone-400 rounded p-2 w-full bg-stone-100 text-black focus:outline-none focus:border-stone-500'
							>
								<option value='' className='bg-stone-100 text-black'>
									Выберите холодильник
								</option>
								{availableFridges.map(f => (
									<option
										key={f.id}
										value={f.id}
										className='bg-stone-100 text-black'
									>
										{f.name}
									</option>
								))}
							</select>
						)}
					</div>
					<div className='flex gap-2'>
						<button
							onClick={handleMove}
							disabled={moveFood.isPending || !selectedFridgeId}
							className='text-sm bg-red-900 text-white cursor-pointer rounded-lg px-4 py-2 font-bold hover:bg-red-800 transition-colors disabled:opacity-50'
						>
							{moveFood.isPending ? 'Перемещение...' : 'Переместить'}
						</button>
						<button
							onClick={() => setMove(false)}
							className='text-sm bg-stone-600 text-white cursor-pointer rounded-lg px-4 py-2 font-bold hover:bg-stone-700 transition-colors'
						>
							Отмена
						</button>
					</div>
				</div>
			) : (
				<div className='flex justify-between items-center gap-4'>
					<div className='grid grid-cols-[1fr_120px_180px] items-center gap-3 flex-1'>
						<span className='font-medium'>{food.name}</span>

						<span className='text-stone-900 text-sm'>
							{food.quantity} {food.unit_symbol || 'шт'}
						</span>

						{food.expiration_date && (
							<span
								className={clsx('text-sm', {
									'text-orange-700': almostExpired,
									'text-red-900': expired,
									'text-stone-900': !expired && !almostExpired,
								})}
							>
								{expired ? (
									<span className='flex items-center gap-1'>
										<TriangleAlertIcon color='#82181a' size={20} />
										{formattedDate}
									</span>
								) : almostExpired ? (
									<span className='flex items-center gap-1'>
										<TriangleAlertIcon color='#ce3500' size={20} />
										годен до {formattedDate}
									</span>
								) : (
									<span className='flex items-center gap-1'>
										<CalendarFoldIcon size={20} />
										годен до {formattedDate}
									</span>
								)}
							</span>
						)}
					</div>
					<div className='flex items-center gap-2'>
						<button
							onClick={e => {
								e.stopPropagation()
								setEdit(true)
							}}
							className='p-1 cursor-pointer'
							title='Редактировать'
						>
							<PencilIcon />
						</button>
						{availableFridges.length > 0 && (
							<button
								onClick={e => {
									e.stopPropagation()
									setMove(true)
								}}
								className='transition-colors p-1 cursor-pointer'
								title='Переместить в другой холодильник'
							>
								<ArrowUpDownIcon />
							</button>
						)}
						<button
							onClick={e => {
								e.stopPropagation()
								handleDelete()
							}}
							disabled={deleteFood.isPending}
							className='cursor-pointer p-1 disabled:opacity-50'
							title='Удалить'
						>
							{deleteFood.isPending ? <HourglassIcon /> : <Trash2Icon />}
						</button>
					</div>
				</div>
			)}
		</li>
	)
}
