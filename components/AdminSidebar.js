import React from 'react'
import { useRouter } from 'next/router'
import { Package, Users, ShoppingBag, FileText, Settings, LogOut, X, Menu } from 'lucide-react'

export default function AdminSidebar({ activeTab, setActiveTab, isOpen, onClose }) {
    const router = useRouter()

    const menuItems = [
        { id: 'orders', label: 'Pedidos', icon: <Package size={20} /> },
        { id: 'contacts', label: 'Prospectos', icon: <Users size={20} /> },
        { id: 'products', label: 'Productos', icon: <ShoppingBag size={20} /> },
        { id: 'cms', label: 'Contenido Inicio', icon: <FileText size={20} /> },
        { id: 'settings', label: 'Configuración', icon: <Settings size={20} /> },
    ]

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        localStorage.removeItem('admin_auth')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-[80px] left-0 h-[calc(100vh-80px)]
                w-64 bg-white border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out z-50
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col
            `}>
                {/* Mobile Header inside sidebar */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center lg:hidden bg-gray-50">
                    <span className="font-bold text-gray-700">Menú</span>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 overflow-y-auto flex-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id)
                                if (onClose) onClose() // Close sidebar on mobile select
                            }}
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

                <div className="p-4 border-t border-gray-100 lg:hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors font-bold"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
