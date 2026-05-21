'use client'

import {
	useCreateUser,
	useDeleteUser,
	useUpdateUser,
	useUsers,
} from '@/shared/api/users'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { registerSchema } from '@/utils/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { CreateUserInput } from '@/shared/api/users'
import type { User } from '@/shared/types/api'

const roleLabels: Record<User['role'], string> = {
	admin: 'Администратор',
	editor: 'Редактор',
	viewer: 'Пользователь',
}

const roleOptions = [
	{ id: 1, label: roleLabels.admin },
	{ id: 2, label: roleLabels.editor },
	{ id: 3, label: roleLabels.viewer },
] as const

export default function UsersPage() {
	const currentUser = useAuthStore(s => s.user)
	const { data: users, isError, isLoading } = useUsers()
	const createUser = useCreateUser()
	const deleteUser = useDeleteUser()
	const {
		register,
		handleSubmit,
		reset,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm<CreateUserInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	})

	function onSubmit(data: CreateUserInput) {
		clearErrors('root')

		createUser.mutate(data, {
			onSuccess: () => {
				reset()
			},
			onError: error => {
				setError('root', { message: error.message })
			},
		})
	}

	function handleDelete(user: User) {
		const shouldDelete = window.confirm(
			`Удалить пользователя ${user.name}?`
		)

		if (!shouldDelete) return

		deleteUser.mutate(user.id)
	}

	return (
		<main className='min-h-screen bg-stone-200 p-6 pt-20 flex justify-center'>
			<div className='w-full max-w-5xl space-y-6'>
				<header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<h1 className='text-2xl font-semibold text-black'>Пользователи</h1>
				</header>

				<section className='rounded-xl border border-stone-400 bg-stone-300 p-6 shadow-xl'>
					<div className='mb-4 flex items-center gap-2'>
						<UserPlus className='size-5 text-red-900' />
						<h2 className='text-lg font-semibold text-black'>
							Зарегистрировать пользователя
						</h2>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className='grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]'
					>
						<div>
							<input
								{...register('name')}
								placeholder='Имя'
								className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black placeholder-stone-600 focus:border-stone-500 focus:outline-none'
							/>
							{errors.name && (
								<p className='mt-1 text-sm text-red-900'>
									{errors.name.message}
								</p>
							)}
						</div>

						<div>
							<input
								{...register('email')}
								placeholder='Email'
								className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black placeholder-stone-600 focus:border-stone-500 focus:outline-none'
							/>
							{errors.email && (
								<p className='mt-1 text-sm text-red-900'>
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<input
								type='password'
								{...register('password')}
								placeholder='Пароль'
								className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black placeholder-stone-600 focus:border-stone-500 focus:outline-none'
							/>
							{errors.password && (
								<p className='mt-1 text-sm text-red-900'>
									{errors.password.message}
								</p>
							)}
						</div>

						<button
							type='submit'
							disabled={createUser.isPending}
							className='h-10 rounded-lg bg-red-900 px-4 text-sm font-bold text-white transition-colors hover:bg-red-800 disabled:opacity-50'
						>
							{createUser.isPending ? 'Создание...' : 'Создать'}
						</button>
					</form>

					{errors.root && (
						<p className='mt-3 text-sm text-red-900'>{errors.root.message}</p>
					)}
				</section>

				<section className='rounded-xl border border-stone-400 bg-stone-300 p-6 shadow-xl'>
					<h2 className='mb-4 text-lg font-semibold text-black'>
						Список пользователей
					</h2>

					{isLoading ? (
						<p className='text-stone-900'>Загрузка...</p>
					) : isError ? (
						<p className='text-red-900'>Не удалось загрузить пользователей</p>
					) : users?.length ? (
						<ul className='divide-y divide-stone-400 overflow-hidden rounded-lg border border-stone-400 bg-stone-200'>
							{users.map(user => (
								<UserItem
									key={user.id}
									user={user}
									currentUserId={currentUser?.id}
									isDeleting={deleteUser.isPending}
									onDelete={handleDelete}
								/>
							))}
						</ul>
					) : (
						<p className='text-stone-900'>Пользователей пока нет</p>
					)}

					{deleteUser.isError && (
						<p className='mt-3 text-sm text-red-900'>
							{deleteUser.error.message}
						</p>
					)}
				</section>
			</div>
		</main>
	)
}

function UserItem({
	currentUserId,
	isDeleting,
	onDelete,
	user,
}: {
	currentUserId?: string
	isDeleting: boolean
	onDelete: (user: User) => void
	user: User
}) {
	const updateUser = useUpdateUser()
	const [name, setName] = useState(user.name)
	const [roleId, setRoleId] = useState(String(user.role_id))
	const [error, setError] = useState('')
	const trimmedName = name.trim()
	const selectedRoleId = Number(roleId)
	const isCurrentUser = user.id === currentUserId
	const hasChanges =
		trimmedName !== user.name || selectedRoleId !== user.role_id
	const isNameValid = trimmedName.length >= 2
	const isOwnRoleChange = isCurrentUser && selectedRoleId !== user.role_id
	const updateErrorMessage = updateUser.error?.message

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!isNameValid) {
			setError('Имя должно быть не короче 2 символов')
			return
		}

		if (isOwnRoleChange) {
			setError('Нельзя изменить роль текущего пользователя')
			return
		}

		setError('')
		updateUser.mutate(
			{
				id: user.id,
				name: trimmedName,
				role_id: selectedRoleId as 1 | 2 | 3,
			},
			{
				onSuccess: updatedUser => {
					setName(updatedUser.name)
					setRoleId(String(updatedUser.role_id))
				},
				onError: mutationError => {
					setError(mutationError.message)
				},
			}
		)
	}

	return (
		<li className='p-4 text-black'>
			<form
				onSubmit={handleSubmit}
				className='grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(10rem,0.7fr)_auto]'
			>
				<div>
					<label className='mb-1 block text-sm font-medium text-stone-800'>
						Имя
					</label>
					<input
						value={name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setName(e.target.value)
							setError('')
						}}
						className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black focus:border-stone-500 focus:outline-none'
					/>
				</div>

				<div>
					<label className='mb-1 block text-sm font-medium text-stone-800'>
						Email
					</label>
					<p className='truncate rounded-lg border border-stone-300 bg-stone-100 p-2 text-stone-700'>
						{user.email}
					</p>
				</div>

				<div>
					<label className='mb-1 block text-sm font-medium text-stone-800'>
						Роль
					</label>
					<select
						value={roleId}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
							setRoleId(e.target.value)
							setError('')
						}}
						className='w-full rounded-lg border border-stone-400 bg-stone-100 p-2 text-black focus:border-stone-500 focus:outline-none'
					>
						{roleOptions.map(role => (
							<option
								key={role.id}
								value={role.id}
								className='bg-stone-100 text-black'
							>
								{role.label}
							</option>
						))}
					</select>
				</div>

				<div className='flex items-end gap-2'>
					<button
						type='submit'
						disabled={
							updateUser.isPending ||
							!hasChanges ||
							!isNameValid ||
							isOwnRoleChange
						}
						className='rounded-lg p-2 text-red-900 transition-colors hover:bg-stone-300 disabled:opacity-40'
						title='Сохранить изменения'
					>
						<Save className='size-5' />
					</button>
					<button
						type='button'
						onClick={() => onDelete(user)}
						disabled={isDeleting || isCurrentUser}
						className='rounded-lg p-2 text-red-900 transition-colors hover:bg-stone-300 disabled:opacity-40'
						title={
							isCurrentUser
								? 'Нельзя удалить текущего пользователя'
								: 'Удалить пользователя'
						}
					>
						<Trash2 className='size-5' />
					</button>
				</div>
			</form>

			{(error || updateErrorMessage) && (
				<p className='mt-2 text-sm text-red-900'>
					{error || updateErrorMessage}
				</p>
			)}
		</li>
	)
}
