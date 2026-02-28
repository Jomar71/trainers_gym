
import { getClientDashboardData, markRoutineComplete } from '@/app/actions/client-portal'
import { CheckCircle, Clock, CalendarDays, Dumbbell, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ClientDashboardPage() {
    const data = await getClientDashboardData()

    if (!data) {
        redirect('/login')
    }

    if ('error' in data) {
        return (
            <div className="p-6 text-center text-red-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p>No se pudo cargar tu perfil. Contacta a tu entrenador.</p>
            </div>
        )
    }

    const { client, appointments, routines } = data

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold">Hola, {client.user.name?.split(' ')[0]} 👋</h2>
                <p className="text-blue-100 mt-1">
                    {client.goal ? `Objetivo: ${client.goal}` : '¡A entrenar se ha dicho!'}
                </p>
            </div>

            {/* Today's Agenda */}
            <section>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                    Agenda de Hoy
                </h3>

                {appointments.length > 0 ? (
                    <div className="space-y-3">
                        {appointments.map(appt => (
                            <div key={appt.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">Sesión con {data.client.trainer.user.name}</p>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {appt.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                    Confirmado
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
                        No tienes citas para hoy.
                    </div>
                )}
            </section>

            {/* Assigned Routines */}
            <section>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <Dumbbell className="h-5 w-5 mr-2 text-indigo-600" />
                    Tus Rutinas Activas
                </h3>

                {routines.length > 0 ? (
                    <div className="space-y-4">
                        {routines.map(routine => (
                            <div key={routine.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{routine.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{routine.exercises.length} ejercicios</p>
                                    </div>
                                    {/* Action Button - In a real app this would open a Player/Modal */}
                                    <button className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                                        Ver Rutina
                                    </button>
                                </div>

                                <div className="bg-gray-50 px-4 py-2">
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {routine.exercises.slice(0, 2).map((ex, i) => (
                                            <li key={i} className="flex items-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mr-2"></div>
                                                {ex.name}
                                            </li>
                                        ))}
                                        {routine.exercises.length > 2 && (
                                            <li className="text-xs text-gray-400 pl-3.5">+ {routine.exercises.length - 2} más...</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-indigo-50 p-6 rounded-xl text-center text-indigo-800">
                        <p className="font-medium">¡Todo al día!</p>
                        <p className="text-sm opacity-75 mt-1">No tienes rutinas pendientes por completar.</p>
                    </div>
                )}
            </section>
        </div>
    )
}
