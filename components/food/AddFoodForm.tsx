'use client'

import {
	useCategories,
	useCreateProduct,
	useProductDirectory,
	useUnits,
} from '@/shared/api/directory'
import { useAddFoodWithDetails } from '@/shared/api/food'
import { useAddFoodLog } from '@/shared/api/food-logs'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { ru } from 'date-fns/locale/ru'
import { useState } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'

registerLocale('ru', ru)

interface AddFoodFormProps {
	fridgeId: string
	fridgeName?: string
	onSuccess?: () => void
}

type ProductOption = {
	value: string
	label: string
	unitSymbol: string | null
}

export function AddFoodForm({
	fridgeId,
	fridgeName,
	onSuccess,
}: AddFoodFormProps) {
	const [selectedProduct, setSelectedProduct] = useState('')
	const [quantity, setQuantity] = useState('')
	const [selectedUnit, setSelectedUnit] = useState('')
	const [expirationDate, setExpirationDate] = useState<Date | null>(null)
	const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)
	const [newProductName, setNewProductName] = useState('')
	const [newProductCategoryId, setNewProductCategoryId] = useState('')
	const [newProductUnitId, setNewProductUnitId] = useState('')
	const [createProductError, setCreateProductError] = useState('')

	const {
		data: products,
		isLoading: productsLoading,
		refetch,
	} = useProductDirectory()
	const { data: units, isLoading: unitsLoading } = useUnits()
	const { data: categories, isLoading: categoriesLoading } = useCategories()
	const addFood = useAddFoodWithDetails(fridgeId)
	const addFoodLog = useAddFoodLog()
	const createProduct = useCreateProduct()
	const user = useAuthStore(s => s.user)
	const options = products?.map(product => ({
		value: product.foods_name,
		label: `${product.foods_name} ${
			product.category_name ? `(${product.category_name})` : ''
		}`,
		unitSymbol: product.unit_symbol,
	}))
	const selectedProductOption =
		options?.find(option => option.value === selectedProduct) || null

	const handleProductChange = (option: ProductOption | null) => {
		setSelectedProduct(option?.value || '')

		if (option?.unitSymbol) {
			setSelectedUnit(option.unitSymbol)
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!selectedProduct || !quantity || !selectedUnit) return

		const quantityNum = parseFloat(quantity)
		const expirationDateStr = expirationDate?.toISOString().split('T')[0]

		addFood.mutate(
			{
				name: selectedProduct,
				quantity: quantityNum,
				unit_symbol: selectedUnit,
				expiration_date: expirationDateStr,
			},
			{
				onSuccess: () => {
					if (user) {
						addFoodLog.mutate({
							action_type: 'add',
							product_name: selectedProduct,
							quantity: quantityNum,
							unit_symbol: selectedUnit,
							from_fridge_id: null,
							to_fridge_id: fridgeId,
							user_id: user.id,
							user_name: user.name,
							fridge_name: fridgeName || 'Неизвестный холодильник',
						})
					}

					setSelectedProduct('')
					setQuantity('')
					setSelectedUnit('')
					setExpirationDate(null)
					onSuccess?.()
				},
			}
		)
	}

	const openCreateProductPopup = () => {
		const currentUnit = units?.find(unit => unit.symbol === selectedUnit)

		setNewProductUnitId(currentUnit ? String(currentUnit.id) : '')
		setIsCreateProductOpen(true)
	}

	const closeCreateProductPopup = () => {
		setIsCreateProductOpen(false)
		setNewProductName('')
		setNewProductCategoryId('')
		setNewProductUnitId('')
		setCreateProductError('')
		createProduct.reset()
	}

	const handleCreateProduct = (e: React.FormEvent) => {
		e.preventDefault()

		const productName = newProductName.trim()

		if (!productName) {
			setCreateProductError('Введите название продукта')
			return
		}

		if (!newProductCategoryId) {
			setCreateProductError('Выберите категорию продукта')
			return
		}

		if (!newProductUnitId) {
			setCreateProductError('Выберите единицу измерения по умолчанию')
			return
		}

		setCreateProductError('')

		createProduct.mutate(
			{
				foods_name: productName,
				category_id: Number(newProductCategoryId),
				unit_id: Number(newProductUnitId),
			},
			{
				onSuccess: product => {
					refetch()
					setSelectedProduct(product.foods_name)
					if (product.unit_symbol) {
						setSelectedUnit(product.unit_symbol)
					}
					closeCreateProductPopup()
				},
				onError: error => {
					setCreateProductError(error.message)
				},
			}
		)
	}

	if (productsLoading || unitsLoading || categoriesLoading) {
		return <div>Загрузка...</div>
	}

	return (
		<>
			<form onSubmit={handleSubmit} className='space-y-4 p-4 border rounded-lg'>
				<h3 className='font-semibold text-lg'>Добавить продукт</h3>

				<div>
					<div className='flex gap-2'>
						<label className='block text-sm font-medium mb-1'>Продукт</label>
						<button
							type='button'
							onClick={openCreateProductPopup}
							className='text-sm text-red-900 hover:underline mb-1'
						>
							Создать новый
						</button>
					</div>
					<Select
						options={options ?? []}
						value={selectedProductOption}
						onChange={handleProductChange}
						isClearable
						isSearchable
						placeholder='Выберите продукт...'
						required
						styles={{
							control: base => ({
								...base,
								borderColor: '#a1a1aa',
								borderWidth: '1px',
								borderRadius: '0.5rem',
								padding: '0.25rem',
								backgroundColor: '#f5f5f4',
								color: '#000',
							}),
							option: (base, state) => ({
								...base,
								backgroundColor: state.isSelected ? '#7f1d1d' : '#f5f5f4',
								color: state.isSelected ? '#fff' : '#000',
							}),
						}}
					/>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div>
						<label className='block text-sm font-medium mb-1'>Количество</label>
						<input
							min={1}
							type='number'
							step='1'
							value={quantity}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setQuantity(e.target.value)
							}
							className='w-full border border-stone-400 rounded-lg p-2 bg-stone-100 text-black focus:outline-none focus:border-stone-500 placeholder-stone-500'
							placeholder='Введите количество'
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Единица измерения
						</label>
						<select
							value={selectedUnit}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								setSelectedUnit(e.target.value)
							}
							className='w-full border border-stone-400 rounded-lg p-2 bg-stone-100 text-black focus:outline-none focus:border-stone-500'
							required
						>
							<option value='' className='bg-stone-100 text-black'>
								Выберите единицу
							</option>
							{units?.map(unit => (
								<option
									key={unit.id}
									value={unit.symbol}
									className='bg-stone-100 text-black'
								>
									{unit.name} ({unit.symbol})
								</option>
							))}
						</select>
					</div>
				</div>

				<div>
					<label className='block text-sm font-medium mb-1'>Годен до</label>
					<DatePicker
						selected={expirationDate}
						onChange={(date: Date | null) => setExpirationDate(date)}
						dateFormat='dd.MM.yyyy'
						locale={'ru'}
						placeholderText='Выберите дату'
						className='w-full border border-stone-400 rounded-lg p-2 bg-stone-100 text-black focus:outline-none focus:border-stone-500'
						minDate={new Date()}
					/>
				</div>

				<button
					type='submit'
					disabled={addFood.isPending}
					className='w-full bg-red-900 text-white py-2 rounded-lg hover:bg-red-800 cursor-pointer disabled:opacity-50 transition-colors'
				>
					{addFood.isPending ? 'Добавление...' : 'Добавить продукт'}
				</button>
			</form>

			{isCreateProductOpen && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
					role='dialog'
					aria-modal='true'
					aria-labelledby='create-product-title'
				>
					<form
						onSubmit={handleCreateProduct}
						className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-stone-400 bg-stone-200 p-5 text-black shadow-xl'
					>
						<div className='mb-4 flex items-start justify-between gap-4'>
							<div>
								<h4 id='create-product-title' className='text-lg font-semibold'>
									Новый продукт
								</h4>
								<p className='mt-1 text-sm text-stone-700'>
									Продукт появится в списке выбора.
								</p>
							</div>
							<button
								type='button'
								onClick={closeCreateProductPopup}
								className='rounded px-2 py-1 text-xl leading-none text-stone-700 hover:bg-stone-300'
								aria-label='Закрыть'
							>
								×
							</button>
						</div>

						<label className='mb-1 block text-sm font-medium'>
							Название продукта
						</label>
						<input
							value={newProductName}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setNewProductName(e.target.value)
								setCreateProductError('')
							}}
							className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black placeholder-stone-500 focus:border-stone-500 focus:outline-none'
							placeholder='Например, молоко'
							maxLength={100}
							autoFocus
						/>

						<div className='mt-4 grid gap-4 sm:grid-cols-2'>
							<div>
								<label className='mb-1 block text-sm font-medium'>
									Категория
								</label>
								<select
									value={newProductCategoryId}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
										const categoryId = e.target.value
										const category = categories?.find(
											item => String(item.id) === categoryId
										)

										setNewProductCategoryId(categoryId)
										setCreateProductError('')

										if (category?.unit_id) {
											setNewProductUnitId(String(category.unit_id))
										}
									}}
									className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black focus:border-stone-500 focus:outline-none'
								>
									<option value='' className='bg-stone-100 text-black'>
										Выберите категорию
									</option>
									{categories?.map(category => (
										<option
											key={category.id}
											value={category.id}
											className='bg-stone-100 text-black'
										>
											{category.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='mb-1 block text-sm font-medium'>
									Единица по умолчанию
								</label>
								<select
									value={newProductUnitId}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
										setNewProductUnitId(e.target.value)
										setCreateProductError('')
									}}
									className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black focus:border-stone-500 focus:outline-none'
								>
									<option value='' className='bg-stone-100 text-black'>
										Выберите единицу
									</option>
									{units?.map(unit => (
										<option
											key={unit.id}
											value={unit.id}
											className='bg-stone-100 text-black'
										>
											{unit.name} ({unit.symbol})
										</option>
									))}
								</select>
							</div>
						</div>

						{createProductError && (
							<p className='mt-2 text-sm text-red-900'>{createProductError}</p>
						)}

						<div className='mt-5 flex justify-end gap-2'>
							<button
								type='button'
								onClick={closeCreateProductPopup}
								className='rounded-lg bg-stone-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-stone-700'
							>
								Отмена
							</button>
							<button
								type='submit'
								disabled={createProduct.isPending}
								className='rounded-lg bg-red-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800 disabled:opacity-50'
							>
								{createProduct.isPending ? 'Создание...' : 'Создать'}
							</button>
						</div>
					</form>
				</div>
			)}
		</>
	)
}
