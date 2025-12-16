'use client'

import MeProvider from '@/components/MeProvider'
import QueryProvider from '@/components/QueryProvider'
import { Montserrat } from 'next/font/google'

const montserratFont = Montserrat({
	subsets: ['latin', 'cyrillic'],
	variable: '--font-montserrat',
	weight: ['400', '700'],
})

export default function AppLayout({ children }: React.PropsWithChildren) {
	return (
		<html lang='ru'>
			<body className={`${montserratFont.className} antialiased`}>
				<QueryProvider>
					<MeProvider>{children}</MeProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
