
import { Plus, Utensils } from 'lucide-react';

export default function NutritionPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Planes Nutricionales</h1>
                <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((plan) => (
                    <div key={plan} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Utensils className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Déficit</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Plan Pérdida de Grasa</h3>
                        <p className="text-sm text-gray-500 mb-4">2000 kcal • 5 comidas</p>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <span className="text-xs text-gray-400">Asignado a: 3 clientes</span>
                            <button className="text-blue-600 text-sm font-medium hover:underline">Ver detalles</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
