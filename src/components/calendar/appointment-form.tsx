'use client'

import { useState } from 'react'
import { Plus, Clock, Calendar as CalendarIcon, User, Save } from 'lucide-react'
import { createAppointment } from '@/app/actions/calendar'
import { useRouter } from 'next/navigation'

interface ClientOption {
    id: string
    user: { name: string | null }
}

export default function AppointmentForm({ clients, onSuccess }: { clients: ClientOption[], onSuccess?: () => void }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 60,
        notes: ''
    })

    // Simple quick helper for current date
    const today = new Date().toISOString().split('T')[0]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await createAppointment({
            clientId: formData.clientId,
            date: formData.date,
            time: formData.time,
            duration: Number(formData.duration),
            notes: formData.notes
        })

        setLoading(false)
        if (result.success) {
            // Reset logic or just refresh
            router.refresh()
            if (onSuccess) onSuccess()
            else alert("Cita agendada correctamente")
        } else {
            alert("Error: " + result.error)
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Nueva Cita
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Client Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            name="clientId"
                            required
                            value={formData.clientId}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Seleccionar Cliente</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.user.name || 'Sin Nombre'}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                name="date"
                                required
                                min={today}
                                value={formData.date}
                                onChange={handleChange}
                                className="block w-full pl-10 rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hora</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="time"
                                name="time"
                                required
                                value={formData.time}
                                onChange={handleChange}
                                className="block w-full pl-10 rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Notas (Opcional)</label>
                    <textarea
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detalles de la sesión..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Agendando...' : (
                        <>
                            <Save className="h-4 w-4 mr-2" /> Agendar Cita
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
