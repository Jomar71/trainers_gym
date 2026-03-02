import { getClientDashboardData } from '@/app/actions/client-portal'
import { Utensils, Calendar, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ClientNutritionPage() {
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

    // Mock data for nutrition plans - in a real app this would come from the DB
    const nutritionPlans = [
        {
            id: '1',
            name: 'Plan de Definición',
            description: 'Alimentación enfocada en mantener masa muscular y reducir grasa corporal',
            meals: [
                { time: '8:00 AM', name: 'Desayuno', food: 'Avena con frutos rojos y claras de huevo' },
                { time: '11:00 AM', name: 'Merienda', food: 'Batido de proteínas con plátano' },
                { time: '2:00 PM', name: 'Almuerzo', food: 'Arroz integral con pechuga de pollo y verduras' },
                { time: '5:00 PM', name: 'Merienda', food: 'Yogur griego con nueces' },
                { time: '8:00 PM', name: 'Cena', food: 'Pescado al horno con ensalada' },
            ]
        }
    ]

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tu Plan de Nutrición</h1>
                <p className="text-gray-600">Guía alimenticia asignada por tu entrenador</p>
            </div>

            {nutritionPlans.length > 0 ? (
                <div className="space-y-6">
                    {nutritionPlans.map(plan => (
                        <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                                <p className="text-gray-700 mt-1">{plan.description}</p>
                            </div>

                            <div className="p-5">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <Utensils className="h-5 w-5 mr-2 text-emerald-600" />
                                    Horarios de Comida
                                </h3>
                                
                                <div className="space-y-4">
                                    {plan.meals.map((meal, idx) => (
                                        <div key={idx} className="flex items-start">
                                            <div className="bg-emerald-50 p-3 rounded-lg mr-4">
                                                <Clock className="h-5 w-5 text-emerald-700" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold text-gray-900">{meal.name}</span>
                                                    <span className="text-sm font-medium text-emerald-600">{meal.time}</span>
                                                </div>
                                                <p className="text-gray-700 mt-1">{meal.food}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-between">
                                <button className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Descargar PDF
                                </button>
                                <button className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800">
                                    Registrar consumo
                                    <Calendar className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Sin plan de nutrición</h3>
                    <p className="mt-2 text-gray-500">
                        Tu entrenador aún no te ha asignado un plan de nutrición personalizado.
                    </p>
                </div>
            )}
        </div>
    )
}