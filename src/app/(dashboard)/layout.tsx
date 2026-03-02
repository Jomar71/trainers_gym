import LogoutButton from '@/components/logout-button';
import { auth } from '@/lib/auth';
import { BarChart3, Calendar, Dumbbell, Users, Utensils } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    
    // If user is not logged in, redirect to login
    if (!session?.user) {
      redirect('/login')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role ?? 'CLIENT'
    
    // If user is a CLIENT, redirect to client portal
    if (userRole === 'CLIENT') {
      redirect('/client/dashboard')
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-blue-600">TrainerHub</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md">
                        <BarChart3 className="mr-3 h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/clients" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md">
                        <Users className="mr-3 h-5 w-5" />
                        Clientes
                    </Link>
                    <Link href="/routines" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md">
                        <Dumbbell className="mr-3 h-5 w-5" />
                        Rutinas
                    </Link>
                    <Link href="/nutrition" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md">
                        <Utensils className="mr-3 h-5 w-5" />
                        Nutrición
                    </Link>
                    <Link href="/calendar" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md">
                        <Calendar className="mr-3 h-5 w-5" />
                        Agenda
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
