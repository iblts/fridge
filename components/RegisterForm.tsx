'use client'

import { registerSchema } from '@/utils/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export function RegisterForm() {
	const form = useForm({
		resolver: zodResolver(registerSchema),
	})

	async function onSubmit(data: any) {
		await fetch('/api/auth/register', {
			method: 'POST',
			body: JSON.stringify(data),
		})
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<input {...form.register('name')} placeholder='Name' />
			<input {...form.register('email')} placeholder='Email' />
			<input type='password' {...form.register('password')} />
			<button>Register</button>
		</form>
	)
}
