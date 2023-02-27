import './globals.css';
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import Login from '@/components/auth/Login';
import Navbar from '@/components/nav/Navbar';

export const metadata: Metadata = {
  title: 'Aninagori',
  description: 'Share your favourite Animemory with friends',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <html lang='en'>
        <head />
        <body>
          <Login />
          {/* Todo: use favicon without children */}
          <div className='hidden'>{children}</div>
        </body>
      </html>
    )
  }

  return (
    <html lang='en'>
      <head />
      <body>
        <SessionProvider session={session}>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
