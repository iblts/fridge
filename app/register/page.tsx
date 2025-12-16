'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
	name: z.string().min(2, 'Минимум 2 символа'),
	email: z.email(),
	password: z.string().min(6, 'Минимум 6 символов'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
	const router = useRouter()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	})

	async function onSubmit(data: FormData) {
		const res = await fetch('/api/auth/register', {
			method: 'POST',
			body: JSON.stringify(data),
		})

		if (!res.ok) {
			setError('root', { message: 'Ошибка регистрации' })
			return
		}

		router.push('/login')
	}

	return (
		<main className='flex min-h-screen items-center justify-center'>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='w-full max-w-sm space-y-4 rounded-xl border p-6'
			>
				<h1 className='text-xl font-semibold'>Регистрация</h1>

				<input
					{...register('name')}
					placeholder='Имя'
					className='w-full rounded border p-2'
				/>
				{errors.name && (
					<p className='text-sm text-red-500'>{errors.name.message}</p>
				)}

				<input
					{...register('email')}
					placeholder='Email'
					className='w-full rounded border p-2'
				/>
				{errors.email && (
					<p className='text-sm text-red-500'>{errors.email.message}</p>
				)}

				<input
					type='password'
					{...register('password')}
					placeholder='Пароль'
					className='w-full rounded border p-2'
				/>
				{errors.password && (
					<p className='text-sm text-red-500'>{errors.password.message}</p>
				)}

				{errors.root && (
					<p className='text-sm text-red-500'>{errors.root.message}</p>
				)}

				<button
					disabled={isSubmitting}
					className='w-full rounded bg-black py-2 text-white disabled:opacity-50'
				>
					Зарегистрироваться
				</button>
			</form>
		</main>
	)
}
