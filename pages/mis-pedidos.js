import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../lib/CartContext'
import ProductImage from '../components/ProductImage'
import Link from 'next/link'
import {
    Package,
    Calendar,
    DollarSign,
    ShoppingBag,
    Clock,
    CheckCircle,
    ClipboardList,
    Hash,
    ArrowLeft
} from 'lucide-react'

export default function MisPedidos() {
    const { user } = useCart()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Assume user is loaded from context. 
        // If context takes time, we might need to wait or rely on localStorage directly for speed if context is async/slow init.
        // But context should be fast enough.

        const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}')

        if (currentUser.name) {
            fetch(`/api/orders?clientName=${encodeURIComponent(currentUser.name)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrders(data.data)
                    }
                    setLoading(false)
                })
                .catch(err => {
                    console.error(err)
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [user])

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pendiente':
                return (
                    <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                        <Clock size={12} /> PENDIENTE
                    </span>
                )
            case 'Registrado':
                return (
                    <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                        <ClipboardList size={12} /> REGISTRADO
                    </span>
                )
            case 'Ordenado':
                return (
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                        <CheckCircle size={12} /> ORDENADO
                    </span>
                )
            default:
                return (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                        {status}
                    </span>
                )
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-cyan-600">
                            <Package size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 leading-none">Mis Pedidos</h1>
                            <p className="text-gray-500 text-sm mt-1">Historial de tus compras recientes</p>
                        </div>
                    </div>

                    <Link href="/productos">
                        <button className="group flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 hover:text-cyan-600 transition-all text-sm shadow-sm">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Regresar al Catálogo
                        </button>
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Package size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No tienes pedidos aún</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Cuando realices una compra, aparecerá aquí con todos los detalles de seguimiento.</p>
                        <Link href="/productos">
                            <button className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 hover:-translate-y-1 transition-all">
                                Explorar Productos
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Top Bar: Order ID & Status */}
                                <div className="px-6 py-4 flex flex-wrap justify-between items-center bg-gray-50/50 border-b border-gray-100 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white p-1.5 rounded-md border border-gray-200 text-gray-400">
                                            <Hash size={16} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 font-bold uppercase block tracking-wider">Pedido</span>
                                            <span className="font-mono text-gray-900 font-bold text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>

                                    <div>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>

                                {/* Meta Info Grid */}
                                <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-100 bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-300"><Calendar size={18} /></div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Fecha</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(order.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-300"><DollarSign size={18} /></div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total</span>
                                            <span className="text-sm font-bold text-gray-900">${order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-300"><ShoppingBag size={18} /></div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Items</span>
                                            <span className="text-sm font-medium text-gray-900">{order.items.reduce((acc, item) => acc + item.quantity, 0)} productos</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-300"><ClipboardList size={18} /></div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Catálogo</span>
                                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 rounded-full text-xs inline-block">
                                                {order.catalogName || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items List */}
                                <div className="p-6 bg-gray-50/10">
                                    <div className="grid gap-4">
                                        {order.items.map((item, index) => {
                                            const product = {
                                                name: item.name || item.product?.name || 'Producto no disponible',
                                                key: item.key || item.product?.key || '00000',
                                                price: item.priceAtOrder,
                                                image: item.image || item.product?.image || '/assets/placeholder.jpg',
                                                variant: item.product?.variant
                                            }

                                            return (
                                                <div key={index} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                                        <ProductImage product={product} className="object-cover w-full h-full" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 text-sm md:text-base leading-tight">{product.name}</h4>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">#{product.key}</span>
                                                            {product.variant && (
                                                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{product.variant}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right pl-2">
                                                        <span className="block text-xs text-gray-500 font-medium mb-0.5">{item.quantity} x</span>
                                                        <span className="font-bold text-cyan-600 text-sm whitespace-nowrap">${item.priceAtOrder}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
