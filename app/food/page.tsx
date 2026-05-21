'use client'

import {
	useCategories,
	useCreateProduct,
	useProductDirectory,
	useUnits,
} from '@/shared/api/directory'
import {
	useAddNeed,
	useDeleteNeed,
	useNeeds,
	useUpdateNeedCount,
} from '@/shared/api/need'
import { Need, ProductDirectory } from '@/shared/types/api'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

export default function FoodPage() {
	const {
		data: products,
		isLoading: productsLoading,
		refetch,
	} = useProductDirectory()
	const [selectedUnit, setSelectedUnit] = useState('')
	const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)
	const [newProductName, setNewProductName] = useState('')
	const [newProductCategoryId, setNewProductCategoryId] = useState('')
	const [newProductUnitId, setNewProductUnitId] = useState('')
	const [createProductError, setCreateProductError] = useState('')
	const createProduct = useCreateProduct()
	const {
		data: needs,
		isError: needsError,
		isLoading: needsLoading,
		refetch: refetchNeeds,
	} = useNeeds()

	const { data: categories } = useCategories()
	const { data: units } = useUnits()

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

	return (
		<main className='pt-16 px-4 pb-4 space-y-6'>
			<header className='flex w-full justify-between'>
				<h1 className='text-xl font-semibold'>Продукты</h1>
				<button
					type='button'
					onClick={openCreateProductPopup}
					className='text-sm text-red-900 hover:underline mb-1'
				>
					Создать новый
				</button>
			</header>

			<section className='rounded-xl border border-stone-400 bg-stone-300 p-4 shadow'>
				<h2 className='mb-3 text-lg font-semibold text-black'>
					Нужно пополнить
				</h2>

				{needsLoading ? (
					<p className='text-stone-900'>Загрузка...</p>
				) : needsError ? (
					<p className='text-red-900'>Не удалось загрузить список пополнения</p>
				) : needs?.length ? (
					<ul className='divide-y divide-stone-400 rounded-lg border border-stone-400 bg-stone-200'>
						{needs.map(item => (
							<NeedItem key={item.need_id} item={item} />
						))}
					</ul>
				) : (
					<p className='text-stone-900'>Сейчас ничего не нужно пополнять</p>
				)}
			</section>

			<section>
				<h2 className='mb-3 text-lg font-semibold text-black'>
					Справочник продуктов
				</h2>
				{productsLoading ? (
					<p>Загрузка...</p>
				) : (
					<ul>
						{products?.map(product => (
							<ProductDirectoryItem
								key={product.foods_id}
								product={product}
								onSuccess={refetchNeeds}
							/>
						))}
					</ul>
				)}
			</section>

			{isCreateProductOpen &&
				createPortal(
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
									<h4
										id='create-product-title'
										className='text-lg font-semibold'
									>
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
								<p className='mt-2 text-sm text-red-900'>
									{createProductError}
								</p>
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
					</div>,
					document.body
				)}
		</main>
	)
}

function ProductDirectoryItem({
	product,
	onSuccess,
}: {
	product: ProductDirectory
	onSuccess?: () => void
}) {
	const [isNeedPopupOpen, setIsNeedPopupOpen] = useState(false)
	const [count, setCount] = useState('')
	const [error, setError] = useState('')
	const addNeed = useAddNeed()

	function closeNeedPopup() {
		setIsNeedPopupOpen(false)
		setCount('')
		setError('')
		addNeed.reset()
	}

	function handleAddNeed(e: React.FormEvent) {
		e.preventDefault()

		const countNumber = Number(count)

		if (!Number.isFinite(countNumber) || countNumber <= 0) {
			setError('Введите количество больше 0')
			return
		}

		setError('')
		addNeed.mutate(
			{
				foods_name: product.foods_name,
				count: countNumber,
			},
			{
				onSuccess: () => {
					closeNeedPopup()
					onSuccess?.()
				},
				onError: mutationError => {
					setError(mutationError.message)
				},
			}
		)
	}

	return (
		<>
			<li className='flex items-center justify-between gap-4 p-4 text-black transition-colors border-b border-stone-400'>
				<div>
					<p className='font-medium'>{product.foods_name}</p>
					{product.category_name && (
						<p className='text-sm text-stone-700'>{product.category_name}</p>
					)}
				</div>
				<button
					type='button'
					onClick={() => setIsNeedPopupOpen(true)}
					className='p-1 cursor-pointer'
					title='Добавить в список пополнения'
				>
					<PlusIcon />
				</button>
			</li>

			{isNeedPopupOpen &&
				createPortal(
					<div
						className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
						role='dialog'
						aria-modal='true'
						aria-labelledby='add-product-need-title'
					>
						<form
							onSubmit={handleAddNeed}
							className='w-full max-w-md rounded-lg border border-stone-400 bg-stone-200 p-5 text-black shadow-xl'
						>
							<div className='mb-4 flex items-start justify-between gap-4'>
								<div>
									<h4
										id='add-product-need-title'
										className='text-lg font-semibold'
									>
										Добавить к пополнению
									</h4>
									<p className='mt-1 text-sm text-stone-700'>
										{product.foods_name}
									</p>
								</div>
								<button
									type='button'
									onClick={closeNeedPopup}
									className='rounded px-2 py-1 text-xl leading-none text-stone-700 hover:bg-stone-300'
									aria-label='Закрыть'
								>
									×
								</button>
							</div>

							<label className='mb-1 block text-sm font-medium'>
								Нужное количество
							</label>
							<div className='flex items-center gap-2'>
								<input
									type='number'
									min='0.01'
									step='any'
									value={count}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										setCount(e.target.value)
										setError('')
									}}
									className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black placeholder-stone-500 focus:border-stone-500 focus:outline-none'
									placeholder='Введите количество'
									autoFocus
								/>
								<span className='min-w-8 text-sm text-stone-900'>
									{product.unit_symbol || ''}
								</span>
							</div>

							{error && <p className='mt-2 text-sm text-red-900'>{error}</p>}

							<div className='mt-5 flex justify-end gap-2'>
								<button
									type='button'
									onClick={closeNeedPopup}
									className='rounded-lg bg-stone-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-stone-700'
								>
									Отмена
								</button>
								<button
									type='submit'
									disabled={addNeed.isPending}
									className='rounded-lg bg-red-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800 disabled:opacity-50'
								>
									{addNeed.isPending ? 'Добавление...' : 'Добавить'}
								</button>
							</div>
						</form>
					</div>,
					document.body
				)}
		</>
	)
}

function NeedItem({ item }: { item: Need }) {
	const [count, setCount] = useState(String(item.count))
	const [error, setError] = useState('')
	const updateNeedCount = useUpdateNeedCount()
	const deleteNeed = useDeleteNeed()
	const countNumber = Number(count)
	const isCountChanged = countNumber !== Number(item.count)
	const isCountValid = Number.isFinite(countNumber) && countNumber > 0

	function handleSave(e: React.FormEvent) {
		e.preventDefault()

		if (!isCountValid) {
			setError('Введите количество больше 0')
			return
		}

		setError('')
		updateNeedCount.mutate(
			{ need_id: item.need_id, count: countNumber },
			{
				onError: mutationError => {
					setError(mutationError.message)
				},
			}
		)
	}

	function handleDone() {
		setError('')
		deleteNeed.mutate(item.need_id, {
			onError: mutationError => {
				setError(mutationError.message)
			},
		})
	}

	return (
		<li className='p-4 text-black'>
			<form
				onSubmit={handleSave}
				className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
			>
				<span className='font-medium'>{item.foods_name}</span>

				<div className='flex flex-wrap items-center gap-2'>
					<input
						type='number'
						min='0.01'
						step='any'
						value={count}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setCount(e.target.value)
							setError('')
						}}
						className='w-28 rounded-lg border border-stone-400 bg-stone-100 p-2 text-black focus:border-stone-500 focus:outline-none'
						aria-label={`Количество для ${item.foods_name}`}
					/>
					<span className='min-w-8 text-sm text-stone-900'>
						{item.unit_symbol || ''}
					</span>

					<button
						type='submit'
						disabled={
							updateNeedCount.isPending || !isCountChanged || !isCountValid
						}
						className='rounded-lg bg-red-900 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800 disabled:opacity-50'
					>
						{updateNeedCount.isPending ? 'Сохранение...' : 'Сохранить'}
					</button>

					<button
						type='button'
						onClick={handleDone}
						disabled={deleteNeed.isPending}
						className='rounded-lg bg-stone-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:opacity-50'
					>
						{deleteNeed.isPending ? 'Удаление...' : 'Пополнено'}
					</button>
				</div>
			</form>

			{error && <p className='mt-2 text-sm text-red-900'>{error}</p>}
		</li>
	)
}
