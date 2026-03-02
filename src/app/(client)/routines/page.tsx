import { getClientDashboardData } from '@/app/actions/client-portal'
import { Dumbbell, Clock, CheckCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ClientRoutinesPage() {
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

    const { routines } = data

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tus Rutinas</h1>
                <p className="text-gray-600">Ejercicios asignados por tu entrenador</p>
            </div>

            {routines.length > 0 ? (
                <div className="space-y-6">
                    {routines.map(routine => (
                        <div key={routine.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{routine.name}</h2>
                                        {routine.description && (
                                            <p className="text-gray-600 mt-1">{routine.description}</p>
                                        )}
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        Activa
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="font-semibold text-gray-800 mb-3">Ejercicios</h3>
                                <div className="space-y-3">
                                    {routine.exercises.map((exercise, idx) => (
                                        <div key={idx} className="flex items-start pt-3 last:pb-0">
                                            <div className="bg-gray-100 p-2 rounded-lg mr-3">
                                                <Dumbbell className="h-4 w-4 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-900">{exercise.name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {exercise.sets}×{exercise.reps}
                                                    </span>
                                                </div>
                                                {exercise.notes && (
                                                    <p className="text-sm text-gray-600 mt-1">{exercise.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
                                <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                                    Comenzar rutina
                                    <CheckCircle className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Sin rutinas asignadas</h3>
                    <p className="mt-2 text-gray-500">
                        Tu entrenador aún no te ha asignado ninguna rutina. Regresa más tarde.
                    </p>
                </div>
            )}
        </div>
    )
}