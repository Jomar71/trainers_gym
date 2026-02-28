import { Dumbbell, Calendar, User, LogOut, Home, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Mobile-first Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    TrainerHub
                </h1>
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 pb-20">
                {children}
            </main>

            {/* Bottom Navigation for Clients */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-2 z-20 safe-area-bottom">
                <Link href="/client/dashboard" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                    <Home className="h-6 w-6" />
                    <span className="text-xs mt-1">Inicio</span>
                </Link>
                <Link href="/client/routines" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
                    <Dumbbell className="h-6 w-6" />
                    <span className="text-xs mt-1">Rutinas</span>
                </Link>
                <Link href="/client/nutrition" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
                    <Utensils className="h-6 w-6" />
                    <span className="text-xs mt-1">Nutrición</span>
                </Link>
                <Link href="/client/calendar" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
                    <Calendar className="h-6 w-6" />
                    <span className="text-xs mt-1">Citas</span>
                </Link>
            </nav>
        </div>
    )
}