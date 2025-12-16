'use client'

import { Header } from '@/components/Header'
import MeProvider from '@/components/MeProvider'
import QueryProvider from '@/components/QueryProvider'
import { Montserrat } from 'next/font/google'
import './globals.css'

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
					<Header />
					<MeProvider>{children}</MeProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
