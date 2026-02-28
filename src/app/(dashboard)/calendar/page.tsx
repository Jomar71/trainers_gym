
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import AppointmentForm from '@/components/calendar/appointment-form';
import { getAppointments } from '@/app/actions/calendar';
import { getClients } from '@/app/actions/clients';

export default async function CalendarPage() {
    const appointments = await getAppointments();
    const clients = await getClients(); // Needed for the form dropdown

    // Group appointments by date for display
    const appointmentsByDate = appointments.reduce((acc, appt) => {
        const dateStr = appt.startTime.toISOString().split('T')[0];
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(appt);
        return acc;
    }, {} as Record<string, typeof appointments>);

    const sortedDates = Object.keys(appointmentsByDate).sort();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Form & Calendar Picker (Future) */}
                <div className="lg:col-span-1 space-y-6">
                    <AppointmentForm clients={clients.map(c => ({ id: c.id, user: { name: c.user.name } }))} />

                    {/* MVP: Simple static calendar for visual structure */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hidden lg:block">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumen Mensual</h3>
                        <div className="text-center text-gray-400 py-10 bg-gray-50 rounded">
                            Calendario Visual (Próximamente)
                        </div>
                    </div>
                </div>

                {/* Right Column: Appointment List (Agenda View) */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Próximos Turnos</h2>

                    <div className="space-y-6">
                        {sortedDates.map(date => (
                            <div key={date}>
                                <h3 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">
                                    {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                                <div className="space-y-3">
                                    {appointmentsByDate[date].map(appt => (
                                        <div key={appt.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                            <div className="flex items-center">
                                                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg font-semibold text-sm w-16 text-center">
                                                    {appt.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-semibold text-gray-900">{appt.client.user.name || 'Cliente'}</p>
                                                    <p className="text-xs text-gray-500 flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {Math.round((appt.endTime.getTime() - appt.startTime.getTime()) / 60000)} min
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${appt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        appt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {appt.status === 'SCHEDULED' ? 'Pendiente' : appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {sortedDates.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
                                <p className="mt-1 text-sm text-gray-500">Comienza agendando un nuevo turno desde el formulario.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
