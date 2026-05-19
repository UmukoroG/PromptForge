import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ToastProvider } from '@/components/toast-provider'
import './globals.css'

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'promptForge - AI-Powered Creative Platform',
  description: 'Transform your ideas with AI. Generate conversations, code, and music with promptForge.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={font.className}>
          <ToastProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
