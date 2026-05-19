'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowUpDown, MinusIcon, PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Journal {
	id: string
	name: string
	description: string
	user_id: string
	created_at: string
	updated_at: string
}

interface FoodLog {
	id: number
	action_type: 'add' | 'remove' | 'move'
	product_name: string
	quantity: number
	unit_symbol: string
	from_fridge_id: string | null
	to_fridge_id: string | null
	user_id: string
	user_name: string
	fridge_name: string | null
	created_at: string
}

interface JournalsProps {
	userId: string
	userName: string
}

export function Journals({ userId, userName }: JournalsProps) {
	const [selectedJournalId, setSelectedJournalId] = useState<string | null>(
		null
	)
	const [journals, setJournals] = useState<Journal[]>([])
	const [logs, setLogs] = useState<FoodLog[]>([])
	const [loading, setLoading] = useState(true)
	const [logsLoading, setLogsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!userId) {
			console.log('No userId, skipping fetch')
			setLoading(false)
			setError('User ID не передан')
			return
		}

		const fetchJournals = async () => {
			try {
				setLoading(true)
				setError(null)
				const res = await fetch(`/api/journals?userId=${userId}`)

				if (!res.ok) {
					throw new Error(`Failed to fetch journals: ${res.status}`)
				}

				const data = await res.json()
				console.log('Journals data:', data)
				setJournals(data)
			} catch (err) {
				console.error('Error fetching journals:', err)
				setError(err instanceof Error ? err.message : 'Unknown error')
			} finally {
				setLoading(false)
			}
		}

		fetchJournals()
	}, [userId])

	useEffect(() => {
		if (!selectedJournalId) return

		const fetchLogs = async () => {
			try {
				setLogsLoading(true)
				const res = await fetch(`/api/journals/${selectedJournalId}/logs`)
				if (!res.ok) throw new Error('Failed to fetch logs')
				const data = await res.json()
				setLogs(data)
			} catch (err) {
				console.error('Error fetching logs:', err)
			} finally {
				setLogsLoading(false)
			}
		}

		fetchLogs()
	}, [selectedJournalId])

	if (loading) {
		return (
			<div className='text-stone-900 text-center py-8'>
				Загрузка журналов...
			</div>
		)
	}

	if (error) {
		return <div className='text-red-900 text-center py-8'>Ошибка: {error}</div>
	}

	if (!journals || journals.length === 0) {
		return (
			<div className='text-stone-900 text-center py-8'>
				У вас пока нет журналов
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			<div className='grid grid-cols-3 gap-3'>
				{journals.map(journal => (
					<button
						key={journal.id}
						onClick={() => setSelectedJournalId(journal.id)}
						className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
							selectedJournalId === journal.id
								? 'bg-red-900 border-red-950 text-white'
								: 'bg-stone-200 border-stone-400 text-black hover:bg-stone-100'
						}`}
					>
						<h3 className='font-semibold text-lg'>{journal.name}</h3>
						<p className='text-sm mt-1 opacity-80'>{journal.description}</p>
					</button>
				))}
			</div>

			{selectedJournalId && (
				<div className='mt-6'>
					<h3 className='text-xl font-semibold text-black mb-4'>
						{journals.find(j => j.id === selectedJournalId)?.name}
					</h3>

					{logsLoading ? (
						<div className='text-stone-900 text-center py-8'>
							Загрузка записей...
						</div>
					) : logs && logs.length > 0 ? (
						<div className='bg-stone-200 rounded-lg overflow-hidden border border-stone-400'>
							<div className='divide-y divide-stone-400'>
								{logs.map(log => (
									<div
										key={log.id}
										className='p-4 text-black transition-colors'
									>
										<div className='flex justify-between items-start'>
											<div className='flex-1'>
												<p className='font-medium'>
													{log.action_type === 'add' && (
														<span className='flex items-center gap-1'>
															<PlusIcon color='#82181a' /> Добавлен:{' '}
														</span>
													)}
													{log.action_type === 'remove' && (
														<span className='flex items-center gap-1'>
															<MinusIcon color='#82181a' /> Удален:{' '}
														</span>
													)}
													{log.action_type === 'move' && (
														<span className='flex items-center gap-1'>
															<ArrowUpDown color='#82181a' /> Перемещен:{' '}
														</span>
													)}
													<span className='font-semibold'>
														{log.product_name}
													</span>
												</p>
												<p className='text-sm text-stone-900 mt-1'>
													{log.quantity} {log.unit_symbol}
													{log.from_fridge_id &&
														` ${log.fridge_name || 'Неизвестно'}`}
												</p>
												<p className='text-xs text-stone-600 mt-2'>
													{log.user_name} •{' '}
													{format(
														new Date(log.created_at),
														'dd MMMM yyyy, HH:mm',
														{ locale: ru }
													)}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className='text-center py-8 text-stone-900 bg-stone-100 rounded-lg border border-stone-400'>
							<p>Нет записей в этом журнале</p>
							<p className='text-sm text-stone-600 mt-1'>
								Записи появятся здесь после действий с продуктами
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
