import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../lib/CartContext'
import ProductImage from '../components/ProductImage'
import Link from 'next/link'

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
    }, [user?.name])

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

        <main className="flex-1 container mx-auto px-4 py-24">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

            {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 mb-4">No has realizado ningún pedido aún.</p>
                    <Link href="/productos">
                        <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-cyan-700 transition-colors">
                            Ir a Comprar
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4 text-sm text-gray-600">
                                <div className="flex gap-8">
                                    <div>
                                        <span className="block text-xs uppercase font-bold text-gray-500">Fecha del pedido</span>
                                        <span className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase font-bold text-gray-500">Total</span>
                                        <span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase font-bold text-gray-500">Productos</span>
                                        <span className="font-medium text-gray-900 text-center">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase font-bold text-gray-500">Estatus</span>
                                        {(() => {
                                            const s = (order.status || '').toLowerCase()
                                            const isPending = s === 'pending' || s === 'pendiente'
                                            const isCompleted = s === 'completed' || s === 'ordenado' || s === 'confirmado' || s === 'entregado'

                                            return (
                                                <span className={`font-bold ${isPending ? 'text-yellow-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {isPending ? 'PENDIENTE' : isCompleted ? 'ORDENADO' : order.status}
                                                </span>
                                            )
                                        })()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs uppercase font-bold text-gray-500">Pedido #</span>
                                    <span className="font-mono text-gray-900 block">{order._id.slice(-6).toUpperCase()}</span>
                                    <div className="mt-1">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Catálogo:</span>
                                        <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                                            {order.catalogName || 'General'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="grid gap-6">
                                    {order.items.map((item, index) => {
                                        // Handle case where product might have been deleted, though populate should handle it (returns null if not found)
                                        // Ideally we store everything in order item? For now we relied on ref.
                                        // If product details are populated:
                                        // Use snapshot if available, otherwise fallback to populated product, otherwise default
                                        const product = {
                                            name: item.name || item.product?.name || 'Producto no disponible',
                                            key: item.key || item.product?.key || '00000',
                                            price: item.priceAtOrder, // Use the price paid
                                            image: item.image || item.product?.image || '/assets/placeholder.jpg'
                                        }

                                        return (
                                            <div key={index} className="flex gap-4 items-start">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden p-1 border border-gray-100">
                                                    <ProductImage product={product} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-blue-900 text-sm md:text-base">{product.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-1">Clave: {product.key}</p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">Cantidad: {item.quantity}</span>
                                                        <span className="font-bold text-cyan-600">${item.priceAtOrder}</span>
                                                    </div>
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
