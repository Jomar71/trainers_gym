'use client'

import { Users, Calendar, Dumbbell } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Bienvenido, Entrenador</h1>
                <p className="text-gray-600 mt-2">Panel de control de TrainerHub Integral</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">0</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <Link href="/clients" className="text-sm text-blue-600 hover:underline mt-4 inline-block">
                        Ver clientes →
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Rutinas Creadas</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">0</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <Dumbbell className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <Link href="/routines" className="text-sm text-green-600 hover:underline mt-4 inline-block">
                        Crear rutina →
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Turnos Hoy</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">0</h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full">
                            <Calendar className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                    <Link href="/calendar" className="text-sm text-purple-600 hover:underline mt-4 inline-block">
                        Ver agenda →
                    </Link>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Comienza a usar TrainerHub</h2>
                <p className="mb-6 text-blue-100">Sigue estos pasos para configurar tu cuenta:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/clients" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors">
                        <div className="flex items-center space-x-3">
                            <Users className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">1. Agregar Clientes</p>
                                <p className="text-sm text-blue-100">Registra tus primeros alumnos</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/routines" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors">
                        <div className="flex items-center space-x-3">
                            <Dumbbell className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">2. Crear Rutinas</p>
                                <p className="text-sm text-blue-100">Diseña planes de entrenamiento</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/calendar" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors">
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">3. Agendar Turnos</p>
                                <p className="text-sm text-blue-100">Organiza tu calendario</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
