
import { Plus, Dumbbell } from 'lucide-react';
import RoutineForm from '@/components/routines/routine-form'; // Adjust path if needed
import { getRoutines } from '@/app/actions/routines';

// This is a Server Component
export default async function RoutinesPage() {
    const routines = await getRoutines();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Rutinas</h1>
                {/* In a real app, this button might trigger a modal managed by a client component wrapper */}
            </div>

            {/* Form Section - For MVP simplicity, we render it directly. 
          Ideally, this would be in a Dialog/Modal */}
            <div className="border-b border-gray-200 pb-8">
                <RoutineForm />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mt-8">Mis Rutinas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routines.map((routine) => (
                    <div key={routine.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Dumbbell className="h-6 w-6" />
                            </div>
                            {routine.isTemplate && (
                                <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">Plantilla</span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{routine.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {routine.exercises.length} ejercicios
                            {routine.description && ` • ${routine.description}`}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <span className="text-xs text-gray-400">
                                {new Date(routine.createdAt).toLocaleDateString()}
                            </span>
                            <button className="text-blue-600 text-sm font-medium hover:underline">Ver detalles</button>
                        </div>
                    </div>
                ))}

                {routines.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No tienes rutinas creadas aún. ¡Crea la primera arriba!
                    </div>
                )}
            </div>
        </div>
    )
}
