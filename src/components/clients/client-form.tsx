'use client'

import { useState } from 'react'
import { Plus, User, Mail, Target, Save } from 'lucide-react'
import { createClient } from '@/app/actions/clients'
import { useRouter } from 'next/navigation'

export default function ClientForm({ onSuccess }: { onSuccess?: () => void }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        goal: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await createClient(formData)

        setLoading(false)
        if (result.success) {
            setFormData({ name: '', email: '', phone: '', goal: '' })
            router.refresh()
            if (onSuccess) onSuccess()
        } else {
            alert("Error: " + result.error)
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Registrar Nuevo Cliente
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Juan Pérez"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-bold ml-1">📱</span>
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej. 521234567890"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Objetivo Principal</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Target className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="goal"
                            value={formData.goal}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej. Pérdida de peso, Ganancia muscular"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Guardando...' : (
                        <>
                            <Save className="h-4 w-4 mr-2" /> Guardar Cliente
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
