import { getClientDashboardData } from '@/app/actions/client-portal'
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ClientCalendarPage() {
    const data = await getClientDashboardData()

    if (!data) {
        redirect('/login')
    }

    if ('error' in data) {
        return (
            <div className="p-6 text-center text-red-500">
                <p>No se pudo cargar tu perfil. Contacta a tu entrenador.</p>
            </div>
        )
    }

    const { appointments } = data

    // Mock data for upcoming appointments - in a real app this would come from the DB
    const mockAppointments = [
        {
            id: '2',
            title: 'Sesión de seguimiento',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Two days from now
            time: '11:00 AM',
            trainer: 'María López',
            location: 'Gimnasio Central'
        },
        {
            id: '3',
            title: 'Evaluación física',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Five days from now
            time: '09:30 AM',
            trainer: 'María López',
            location: 'Consultorio 3'
        }
    ]

    const allAppointments = [...appointments, ...mockAppointments].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tu Calendario</h1>
                <p className="text-gray-600">Próximas sesiones con tu entrenador</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <CalendarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Sesiones este mes</p>
                            <p className="text-2xl font-bold text-gray-900">{allAppointments.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                            <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Con tu entrenador</p>
                            <p className="text-xl font-bold text-gray-900">{data.client.trainer.user.name}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                            <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Próxima cita</p>
                            {allAppointments[0] ? (
                                <p className="text-lg font-bold text-gray-900">
                                    {allAppointments[0].date.toLocaleDateString()}
                                </p>
                            ) : (
                                <p className="text-lg font-bold text-gray-900">-</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Citas</h2>
                
                {allAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {allAppointments.map(app => (
                            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex">
                                    <div className="bg-blue-50 rounded-lg p-4 mr-5">
                                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{app.title}</h3>
                                        
                                        <div className="mt-2 flex items-center text-sm text-gray-600">
                                            <Clock className="h-4 w-4 mr-2" />
                                            {app.date.toLocaleDateString()} • {app.time}
                                        </div>
                                        
                                        <div className="mt-1 flex items-center text-sm text-gray-600">
                                            <User className="h-4 w-4 mr-2" />
                                            Con {app.trainer}
                                        </div>
                                        
                                        {app.location && (
                                            <div className="mt-1 flex items-center text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                {app.location}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Sin citas programadas</h3>
                        <p className="mt-2 text-gray-500">
                            No tienes sesiones programadas próximamente.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}