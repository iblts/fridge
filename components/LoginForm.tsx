'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

export function LoginForm() {
	const form = useForm()
	const qc = useQueryClient()

	async function onSubmit(data: any) {
		await fetch('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(data),
		})

		qc.invalidateQueries({ queryKey: ['me'] })
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<input {...form.register('email')} />
			<input type='password' {...form.register('password')} />
			<button>Login</button>
		</form>
	)
}
