
import { Plus, Search, MoreHorizontal, MessageCircle } from 'lucide-react';
import ClientForm from '@/components/clients/client-form';
import { getClients } from '@/app/actions/clients';

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                {/* Toggle form button could go here */}
            </div>

            <ClientForm />

            {/* Search Bar - Placeholder for logic */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Clients List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {clients.map((client) => (
                        <li key={client.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {client.user.name?.substring(0, 2).toUpperCase() || 'UN'}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">{client.user.name || 'Sin Nombre'}</p>
                                    <p className="text-xs text-gray-500">{client.user.email}</p>
                                    {client.goal && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                            {client.goal}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {client.phone ? (
                                    <a
                                        href={`https://wa.me/${client.phone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                        title="Abrir WhatsApp"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                    </a>
                                ) : (
                                    <button className="p-2 text-gray-300 cursor-not-allowed" title="Sin teléfono">
                                        <MessageCircle className="h-5 w-5" />
                                    </button>
                                )}
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}

                    {clients.length === 0 && (
                        <li className="p-8 text-center text-gray-500">
                            No tienes clientes registrados aún.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
