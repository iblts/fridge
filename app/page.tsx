'use client'

import { Journals } from '@/components/Journals'
import { useCreateFridge, useFridges } from '@/shared/api/fridge'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { getNoun } from '@/utils/helpers'
import Link from 'next/link'
import { useState } from 'react'

type Tab = 'fridges' | 'journals'

export default function DashboardPage() {
	const { data: fridges, isLoading, refetch } = useFridges()
	const createFridge = useCreateFridge()
	const user = useCurrentUser()

	const [name, setName] = useState('')
	const [activeTab, setActiveTab] = useState<Tab>('fridges')

	function handleCreate() {
		if (!name.trim()) return
		createFridge.mutate(name)
		refetch()
		setName('')
	}

	return (
		<main className='min-h-screen bg-stone-200 p-6 pt-20 flex justify-center'>
			<div className='w-full max-w-4xl'>
				<div className='flex gap-2 mb-6 bg-stone-300 p-2 rounded-xl border border-gray-400 w-fit'>
					<TabButton
						active={activeTab === 'fridges'}
						onClick={() => setActiveTab('fridges')}
					>
						Мои холодильники
					</TabButton>

					<TabButton
						active={activeTab === 'journals'}
						onClick={() => setActiveTab('journals')}
					>
						Журналы
					</TabButton>
				</div>

				{/* Content */}
				<div className='bg-stone-300 rounded-xl border border-gray-400 p-6 shadow-xl'>
					{/* FRIDGES */}
					{activeTab === 'fridges' && (
						<div className='space-y-5'>
							<h2 className='text-2xl font-semibold text-black'>
								Мои холодильники
							</h2>

							{/* Create */}
							<div className='bg-stone-200 rounded-lg p-4 border border-stone-300'>
								<h3 className='text-black mb-3'>Создать холодильник</h3>

								<form
									className='flex gap-2'
									onSubmit={e => {
										e.preventDefault()
										handleCreate()
									}}
								>
									<input
										value={name}
										onChange={e => setName(e.target.value)}
										placeholder='Название холодильника'
										className='flex-1 border border-stone-300 rounded-lg p-2 bg-stone-100 text-black focus:outline-none focus:border-stone-400'
									/>

									<button
										onClick={handleCreate}
										disabled={createFridge.isPending}
										className='bg-red-900 hover:bg-red-950 text-white px-5 rounded-lg transition disabled:opacity-50'
									>
										{createFridge.isPending ? 'Создание...' : 'Создать'}
									</button>
								</form>
							</div>

							{/* List */}
							{isLoading ? (
								<p className='text-stone-900'>Загрузка...</p>
							) : fridges?.length ? (
								<div className='flex gap-3 flex-wrap'>
									{fridges.map(fridge => (
										<Link
											key={fridge.id}
											href={`/fridge/${fridge.id}`}
											className='p-4 border border-stone-300 rounded-lg hover:border-stone-400 transition bg-stone-200 flex flex-col justify-between basis-2xs grow shrink'
										>
											<header className='flex gap-1 justify-between items-center w-full'>
												<p className='text-black font-medium'>{fridge.name}</p>
												<span className='text-red-900'>Открыть →</span>
											</header>
											{fridge.food_count && fridge.food_count > 0 && (
												<p className='text-sm text-stone-900 mt-2'>
													{fridge.food_count}{' '}
													{getNoun(
														fridge.food_count,
														'продукт',
														'продукта',
														'продуктов'
													)}
												</p>
											)}
										</Link>
									))}
								</div>
							) : (
								<p className='text-stone-900'>У вас пока нет холодильников</p>
							)}
						</div>
					)}

					{/* JOURNALS */}
					{activeTab === 'journals' && (
						<div className='space-y-4'>
							<h2 className='text-2xl font-semibold text-black'>Журналы</h2>

							{user?.id ? (
								<Journals
									userId={user.id}
									userName={user.name || 'Пользователь'}
								/>
							) : (
								<p className='text-stone-900'>Загрузка пользователя...</p>
							)}
						</div>
					)}
				</div>
			</div>
		</main>
	)
}

function TabButton({
	active,
	children,
	onClick,
}: {
	active: boolean
	children: React.ReactNode
	onClick: () => void
}) {
	return (
		<button
			onClick={onClick}
			className={`
				px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer
				${active ? 'bg-red-900 text-white shadow' : 'text-black'}
			`}
		>
			{children}
		</button>
	)
}
