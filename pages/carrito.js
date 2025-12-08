import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../lib/CartContext'
import Link from 'next/link'
import ProductImage from '../components/ProductImage'

export default function Carrito() {
    const { cart, updateQuantity, removeFromCart, clearCart, user } = useCart()
    const [status, setStatus] = useState('idle') // idle, submitting, success, error

    const cartItems = Object.values(cart)
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const handleSubmit = async (e) => {
        e.preventDefault()
        // If no user is logged in, we might have an issue, but the flow suggests they are logged in.
        // We'll use the user from context, or fallbacks.

        const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}')

        setStatus('submitting')

        try {
            const order = {
                clientName: currentUser.name || 'Invitado', // Use logged in name
                clientPhone: 'N/A', // No phone asked
                items: cartItems.map(item => ({
                    product: item._id || item.key, // Ensure we have an ID
                    quantity: item.quantity,
                    priceAtOrder: item.price,
                    name: item.name,
                    key: item.key,
                    image: item.image
                })),
                total
            }

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            })

            const data = await res.json()

            if (data.success) {
                setStatus('success')
                clearCart()
            } else {
                throw new Error(data.error || 'Error al enviar pedido')
            }
        } catch (error) {
            console.error(error)
            setStatus('error')
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Pedido Guardado!</h2>
                        <p className="text-gray-600 mb-8">Tu pedido ha sido registrado exitosamente para que la administradora lo revise.</p>
                        <Link href="/productos">
                            <button className="w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 transition-colors">
                                Volver al Catálogo
                            </button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-24">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Tu Carrito de Compras</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-100 max-w-2xl mx-auto">
                        <span className="text-6xl mb-4 block">🛒</span>
                        <h2 className="text-2xl text-gray-400 font-medium mb-4">Tu carrito está vacío</h2>
                        <Link href="/productos">
                            <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-cyan-700 transition-colors">
                                Ir a Productos
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item._id || item.key} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center animate-fade-in">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative p-2">
                                        <ProductImage product={item} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.category} {item.variant && `- ${item.variant}`}</p>
                                        <p className="text-cyan-600 font-bold mt-1">${item.price}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                                            <button onClick={() => updateQuantity(item._id || item.key, item.quantity - 1)} className="text-gray-500 hover:text-red-500 font-bold px-2">-</button>
                                            <span className="font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id || item.key, item.quantity + 1)} className="text-gray-500 hover:text-green-500 font-bold px-2">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item._id || item.key)} className="text-xs text-red-400 hover:text-red-600 underline">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4">
                                <Link href="/productos">
                                    <button className="flex items-center gap-2 text-cyan-600 font-bold hover:text-cyan-700 transition-colors bg-white px-6 py-3 rounded-xl border border-cyan-200 hover:border-cyan-400 shadow-sm w-full md:w-auto justify-center">
                                        <span>←</span> Agregar más productos
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Checkout Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h3>

                                <div className="flex justify-between mb-2 text-gray-600">
                                    <span>Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)} productos)</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-6 text-xl font-bold text-gray-900 border-t pt-4">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transform transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                    >
                                        {status === 'submitting' ? 'Guardando...' : 'Confirmar Pedido'}
                                    </button>
                                    <p className="text-xs text-gray-400 text-center mt-2">
                                        * Al confirmar, el pedido se guardará para revisión de la administradora.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
