'use client'

import { useMe } from '@/shared/api/useMe'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MeProvider({ children }: React.PropsWithChildren) {
	const { data, isLoading } = useMe()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !data) {
			router.push('/login')
		}
	}, [isLoading, data, router])

	if (isLoading || !data) return null

	return children
}
