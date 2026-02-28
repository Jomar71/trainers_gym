'use client'

import { useState } from 'react'
import { Plus, Trash, Dumbbell, Save } from 'lucide-react'
import { createRoutine, CreateRoutineInput } from '@/app/actions/routines'
import { useRouter } from 'next/navigation'

export default function RoutineForm({ onSuccess }: { onSuccess?: () => void }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [exercises, setExercises] = useState<any[]>([])

    const addExercise = () => {
        setExercises([...exercises, {
            name: '',
            sets: 3,
            reps: 10,
            weight: 0,
            restTime: 60,
            videoUrl: '',
            notes: ''
        }])
    }

    const updateExercise = (index: number, field: string, value: any) => {
        const newExercises = [...exercises]
        newExercises[index] = { ...newExercises[index], [field]: value }
        setExercises(newExercises)
    }

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: CreateRoutineInput = {
            name,
            description,
            exercises: exercises.map(ex => ({
                ...ex,
                sets: Number(ex.sets),
                reps: Number(ex.reps),
                weight: Number(ex.weight),
                restTime: Number(ex.restTime)
            }))
        }

        const result = await createRoutine(payload)

        setLoading(false)
        if (result.success) {
            setName('')
            setDescription('')
            setExercises([])
            router.refresh()
            if (onSuccess) onSuccess()
        } else {
            alert("Error al crear rutina")
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Rutina</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de la Rutina</label>
                    <input
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej. Hipertrofia Pecho"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                    />
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-semibold text-gray-800">Ejercicios</h3>
                        <button type="button" onClick={addExercise} className="text-sm text-blue-600 flex items-center hover:text-blue-800">
                            <Plus className="h-4 w-4 mr-1" /> Agregar Ejercicio
                        </button>
                    </div>

                    <div className="space-y-4">
                        {exercises.map((ex, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-lg relative">
                                <button
                                    type="button"
                                    onClick={() => removeExercise(i)}
                                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                >
                                    <Trash className="h-4 w-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <input
                                        placeholder="Nombre del ejercicio"
                                        value={ex.name}
                                        onChange={e => updateExercise(i, 'name', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300"
                                        required
                                    />
                                    <input
                                        placeholder="Video URL (YouTube)"
                                        value={ex.videoUrl}
                                        onChange={e => updateExercise(i, 'videoUrl', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300"
                                    />
                                </div>

                                <div className="grid grid-cols-4 gap-2 text-sm">
                                    <div>
                                        <label className="block text-gray-500">Series</label>
                                        <input type="number" value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} className="w-full p-1 rounded border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500">Reps</label>
                                        <input type="number" value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} className="w-full p-1 rounded border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500">Peso (kg)</label>
                                        <input type="number" value={ex.weight} onChange={e => updateExercise(i, 'weight', e.target.value)} className="w-full p-1 rounded border border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500">Descanso (s)</label>
                                        <input type="number" value={ex.restTime} onChange={e => updateExercise(i, 'restTime', e.target.value)} className="w-full p-1 rounded border border-gray-300" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {exercises.length === 0 && (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                No hay ejercicios agregados.
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : (
                        <>
                            <Save className="h-4 w-4 mr-2" /> Guardar Rutina
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
