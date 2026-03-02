import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()

  // If user is not logged in, redirect to login page
  if (!session?.user) {
    redirect('/login')
  }

  // Access the role property from the session user, with fallback to 'CLIENT'
  const userRole = session.user?.role ?? 'CLIENT'
  
  if (userRole === 'TRAINER') {
    redirect('/dashboard')
  } else {
    // Regular client goes to client portal
    redirect('/client/dashboard')
  }
}