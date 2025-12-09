import React from 'react'

export default function AdminSidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'orders', label: 'Pedidos', icon: '📦' },
        { id: 'products', label: 'Productos', icon: '🛍️' },
        { id: 'cms', label: 'Contenido Inicio', icon: '📝' },
        // settings tab usually merged with others or kept separate. 
        // Existing admin had "Configuración" section usually combined. 
        // I'll keep it consistent with "settings" if I implement it.
        // User asked for "una pestaña de opciones".
        { id: 'settings', label: 'Configuración', icon: '⚙️' },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block shrink-0 min-h-[calc(100vh-64px)]">
            <nav className="p-4 space-y-2 sticky top-0">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === item.id
                                ? 'bg-blue-900 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    )
}
