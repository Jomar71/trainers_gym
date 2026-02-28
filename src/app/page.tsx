import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth()

  // If user is logged in, redirect to appropriate dashboard
  if (session?.user) {
    // Since role is stored in JWT token (according to our auth.ts config), 
    // we'll need to access it differently if the session doesn't contain it
    // Default to CLIENT if no role is defined
    const userRole = session.user.role ?? 'CLIENT';
    
    if (userRole === 'TRAINER') {
      redirect('/dashboard')
    } else {
      // Regular client goes to client portal
      redirect('/client/dashboard')
    }
  }

  // If not logged in, redirect to login page
  redirect('/login')
}