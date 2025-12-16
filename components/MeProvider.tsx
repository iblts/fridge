'use client'

import { useMe } from '@/shared/api/useMe'
import { unauthorizedPaths } from '@/utils/constants'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MeProvider({ children }: React.PropsWithChildren) {
	const { data, isLoading } = useMe()
	const router = useRouter()
	const pathname = usePathname()
	const isUnauthorizedPath = unauthorizedPaths.includes(pathname)

	useEffect(() => {
		if (isUnauthorizedPath) return
		if (!isLoading && !data) {
			router.push('/login')
		}
	}, [isLoading, data, router, isUnauthorizedPath])

	if ((isLoading || !data) && !isUnauthorizedPath) return null

	return children
}
