'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
	email: z.email(),
	password: z.string().min(1),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
	const router = useRouter()
	const qc = useQueryClient()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	async function onSubmit(data: FormData) {
		const res = await fetch('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(data),
		})

		if (!res.ok) {
			setError('root', { message: 'Неверный email или пароль' })
			return
		}

		await qc.invalidateQueries({ queryKey: ['me'] })
		router.push('/')
	}

	return (
		<main className='flex min-h-screen items-center justify-center'>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='w-full max-w-sm space-y-4 rounded-xl border border-stone-400 p-6 bg-stone-300'
			>
				<h1 className='text-xl font-semibold'>Вход</h1>

				<input
					{...register('email')}
					placeholder='Email'
					className='w-full rounded border p-2 bg-stone-100 text-black border-stone-400 outline-0 focus-visible:border-stone-500'
				/>
				{errors.email && (
					<p className='text-sm text-red-800'>{errors.email.message}</p>
				)}

				<input
					type='password'
					{...register('password')}
					placeholder='Пароль'
					className='w-full rounded border p-2 bg-stone-100 text-black border-stone-400 outline-0 focus-visible:border-stone-500'
				/>
				{errors.password && (
					<p className='text-sm text-red-800'>{errors.password.message}</p>
				)}

				{errors.root && (
					<p className='text-sm text-red-800'>{errors.root.message}</p>
				)}

				<button
					disabled={isSubmitting}
					className='w-full rounded bg-red-900 py-2 text-white disabled:opacity-50 cursor-pointer hover:bg-red-800 transition-colors focus-visible:bg-red-800 outline-0'
				>
					Войти
				</button>
			</form>
		</main>
	)
}
