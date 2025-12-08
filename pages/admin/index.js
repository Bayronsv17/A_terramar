import { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useRouter } from 'next/router'
import { useToast } from '../../lib/ToastContext'

export default function AdminDashboard() {
    const { addToast } = useToast()
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('orders')

    // Order Management
    const [orders, setOrders] = useState([])

    // Product Management
    const [showAddProduct, setShowAddProduct] = useState(false)
    const [productSearchKey, setProductSearchKey] = useState('')
    const [searchedProduct, setSearchedProduct] = useState(null)
    const [updateMessage, setUpdateMessage] = useState('')

    const [newProduct, setNewProduct] = useState({
        key: '',
        name: '',
        image: '',
        price: '',
        category: 'General',
        variant: ''
    })

    const [priceForm, setPriceForm] = useState({
        applyGlobalControl: true,
        globalDiscount: 0,
        MX: { originalPrice: 0, discount: 0 },
        US: { originalPrice: 0, discount: 0 }
    })

    // Bulk Import State
    const fileInputRef = useRef(null)
    const [bulkStats, setBulkStats] = useState(null)

    // Settings
    const [catalogName, setCatalogName] = useState('')

    const discountOptions = []
    for (let i = 0; i <= 80; i += 5) {
        discountOptions.push(i)
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
        } else {
            setIsAuthenticated(true)
            fetchOrders()
            fetchSettings()
        }
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/orders')
            const data = await res.json()
            if (data.success) {
                setOrders(data.data)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings?key=catalogName')
            const data = await res.json()
            if (data.success && data.data) {
                setCatalogName(data.data.value)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        }
    }

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus })
            })
            const data = await res.json()
            if (data.success) {
                addToast('Estatus actualizado', 'success')
                fetchOrders()
            }
        } catch (error) {
            addToast('Error al actualizar estatus', 'error')
        }
    }

    const handleUpdateSettings = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'catalogName', value: catalogName })
            })
            const data = await res.json()
            if (data.success) {
                addToast('Configuración guardada', 'success')
            }
        } catch (error) {
            addToast('Error al guardar configuración', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSearchProduct = async (e) => {
        e && e.preventDefault()
        if (!productSearchKey) return

        setUpdateMessage('')
        setLoading(true)
        try {
            const res = await fetch(`/api/products?key=${productSearchKey}`)
            const data = await res.json()

            // FIX: Handle both array and single object responses effectively
            let p = null
            if (data.success && data.data) {
                if (Array.isArray(data.data)) {
                    if (data.data.length > 0) p = data.data[0]
                } else {
                    p = data.data
                }
            }

            if (p) {
                setSearchedProduct(p)

                // Logic to determine initial form state
                const mxPrice = p.prices?.MX?.price || p.price
                const mxOrig = p.prices?.MX?.originalPrice || p.originalPrice || mxPrice

                const usPrice = p.prices?.US?.price || (p.price / 20) // Fallback if no US price
                const usOrig = p.prices?.US?.originalPrice || (p.originalPrice ? p.originalPrice / 20 : usPrice)

                const calcDiscount = (orig, curr) => {
                    if (orig > 0 && curr < orig) return Math.round((1 - (curr / orig)) * 100)
                    return 0
                }

                let dMX = calcDiscount(mxOrig, mxPrice)
                let dUS = calcDiscount(usOrig, usPrice)

                // Snap to nearest 5
                dMX = Math.round(dMX / 5) * 5
                dUS = Math.round(dUS / 5) * 5

                const same = dMX === dUS

                setPriceForm({
                    applyGlobalControl: same,
                    globalDiscount: same ? dMX : 0,
                    MX: {
                        originalPrice: mxOrig,
                        discount: dMX
                    },
                    US: {
                        originalPrice: usOrig,
                        discount: dUS
                    }
                })

            } else {
                setSearchedProduct(null)
                setUpdateMessage('Producto no encontrado')
            }
        } catch (error) {
            setUpdateMessage('Error al buscar producto')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePrice = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Calculate new final prices based on specific discounts
        const discountFactorMX = 1 - ((priceForm.MX.discount || 0) / 100)
        const discountFactorUS = 1 - ((priceForm.US.discount || 0) / 100)

        const newPricesMX = {
            originalPrice: Number(priceForm.MX.originalPrice),
            price: Number((Number(priceForm.MX.originalPrice) * discountFactorMX).toFixed(2))
        }

        const newPricesUS = {
            originalPrice: Number(priceForm.US.originalPrice),
            price: Number((Number(priceForm.US.originalPrice) * discountFactorUS).toFixed(2))
        }

        try {
            const res = await fetch('/api/products/update-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: searchedProduct.key,
                    pricesMX: newPricesMX,
                    pricesUS: newPricesUS
                })
            })
            const data = await res.json()
            if (data.success) {
                setSearchedProduct(data.data)
                setUpdateMessage('Precios actualizados correctamente')
                addToast('Datos guardados correctamente', 'success')
            } else {
                const msg = data.message || data.error || 'Error desconocido'
                setUpdateMessage('Error: ' + msg)
                addToast('Error: ' + msg, 'error')
            }
        } catch (error) {
            console.error('Error updating price:', error)
            setUpdateMessage('Error de conexión')
            addToast('Error de conexión', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProduct = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            })
            const data = await res.json()
            if (data.success) {
                addToast('Producto creado correctamente', 'success')
                setShowAddProduct(false)
                setNewProduct({ key: '', name: '', image: '', price: '', category: 'General', variant: '' })
                // Optionally auto-search the new product
                setProductSearchKey(data.data.key)
                // We'd ideally call handleSearchProduct here but logic is slightly split
            } else {
                addToast('Error al crear producto: ' + (data.error || 'Error desconocido'), 'error')
            }
        } catch (error) {
            console.error('Error creating product:', error)
            addToast('Error de conexión', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteProduct = async () => {
        if (!searchedProduct || !confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) return

        setLoading(true)
        try {
            const res = await fetch(`/api/products?id=${searchedProduct._id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                addToast('Producto eliminado correctamente', 'success')
                setSearchedProduct(null)
                setProductSearchKey('')
            } else {
                addToast('Error al eliminar producto', 'error')
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            addToast('Error de conexión', 'error')
        } finally {
            setLoading(false)
        }
    }

    // --- BULK OPERATIONS ---

    const handleResetDiscounts = async () => {
        if (!confirm('ATENCIÓN: Esto quitará el descuento a TODOS los productos del sistema (MX y US), regresando al precio base. ¿Estás seguro de que deseas iniciar una nueva temporada?')) return

        setLoading(true)
        try {
            const res = await fetch('/api/products/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset_discounts' })
            })
            const data = await res.json()
            if (data.success) {
                addToast(data.message, 'success')
            } else {
                addToast('Error: ' + data.message, 'error')
            }
        } catch (e) {
            addToast('Error de conexión', 'error')
        } finally {
            setLoading(false)
        }
    }

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length < 2) return []

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const products = []

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',')
            if (row.length < headers.length) continue // Skip malformed rows

            const obj = {}
            headers.forEach((h, idx) => {
                obj[h] = row[idx]?.trim()
            })

            // Validate minimal requirement
            if (obj.clave) {
                products.push(obj)
            }
        }
        return products
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setLoading(true)
        setBulkStats(null)

        const reader = new FileReader()
        reader.onload = async (evt) => {
            const text = evt.target.result
            const products = parseCSV(text)

            if (products.length === 0) {
                addToast('No se encontraron productos válidos en el CSV', 'error')
                setLoading(false)
                return
            }

            try {
                const res = await fetch('/api/products/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'import', products })
                })
                const data = await res.json()

                if (data.success) {
                    addToast('Carga masiva completada exitosamente', 'success')
                    setBulkStats(data.message)
                } else {
                    addToast('Error en carga: ' + data.message, 'error')
                }
            } catch (err) {
                console.error(err)
                addToast('Error de conexión al cargar', 'error')
            } finally {
                setLoading(false)
                // Clear input
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsText(file) // Assumes UTF-8
    }

    const calculatePreviewPrice = (region, originalPrice) => {
        if (!originalPrice) return 0
        const p = Number(originalPrice)
        let d = 0

        if (priceForm.applyGlobalControl) {
            d = Number(priceForm.globalDiscount) || 0
        } else {
            if (region === 'MX') d = Number(priceForm.MX.discount) || 0
            if (region === 'US') d = Number(priceForm.US.discount) || 0
        }

        return (p * (1 - d / 100)).toFixed(2)
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-24">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                Pedidos
                            </button>
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                Gestión de Productos
                            </button>
                            <button
                                onClick={() => setActiveTab('bulk')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'bulk' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                📦 Carga Masiva
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                Configuración
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === 'orders' ? (
                    <div>
                        {/* MOBILE CARD VIEW (Visible on small screens) */}
                        <div className="md:hidden space-y-4">
                            {loading ? (
                                <div className="text-center py-8">Cargando pedidos...</div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No hay pedidos recientes.</div>
                            ) : (
                                orders.map((order) => (
                                    <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-bold text-gray-500 uppercase">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>

                                            <div className="relative">
                                                <select
                                                    value={order.status || 'pending'}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 ${order.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 focus:ring-emerald-500'
                                                        : 'bg-orange-100 text-orange-800 border-orange-200 focus:ring-orange-500'
                                                        }`}
                                                >
                                                    <option value="pending">⏳ Pendiente</option>
                                                    <option value="completed">✅ Ordenado</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{order.clientName}</h3>
                                                    <a href={`https://wa.me/${order.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-600 text-sm font-medium hover:underline flex items-center gap-1">
                                                        <span>📱</span> {order.clientPhone}
                                                    </a>
                                                </div>
                                                {order.catalogName && (
                                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold border border-blue-100">
                                                        {order.catalogName}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Productos ({order.items.reduce((a, c) => a + c.quantity, 0)})</h4>
                                                <ul className="space-y-3">
                                                    {order.items.map((item, idx) => (
                                                        <li key={idx} className="flex gap-3 text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                                            <div className="font-bold text-gray-900 w-6 text-right shrink-0">{item.quantity}x</div>
                                                            <div className="flex-1">
                                                                <div className="text-gray-900 font-medium leading-tight">{item.name || item.product?.name || 'Producto desconocido'}</div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Clave: <span className="font-bold text-gray-700">{item.key || item.product?.key || 'N/A'}</span>
                                                                    {item.product?.variant && (
                                                                        <span className="ml-2 pl-2 border-l border-gray-300">
                                                                            Var: {item.product.variant}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                                <span className="text-sm text-gray-500 font-medium">Total del Pedido</span>
                                                <span className="text-xl font-bold text-blue-900">${order.total ? order.total.toFixed(2) : '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DESKTOP TABLE VIEW (Hidden on small screens) */}
                        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr><td colSpan="6" className="text-center py-4">Cargando...</td></tr>
                                        ) : orders.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-4 text-gray-500">No hay pedidos recientes.</td></tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                                        {order.catalogName && (
                                                            <div className="mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded inline-block border border-blue-100 font-bold">
                                                                {order.catalogName}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        {order.clientName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <a href={`https://wa.me/${order.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline font-medium">
                                                            {order.clientPhone}
                                                        </a>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <ul className="space-y-1">
                                                            {order.items.map((item, idx) => (
                                                                <li key={idx} className="flex gap-2 text-sm items-start">
                                                                    <span className="font-bold text-gray-900 w-5 pt-0.5">{item.quantity}x</span>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-gray-800 font-medium">{item.name || item.product?.name || 'Unknown'}</span>
                                                                        <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                                            <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                                                                                <span className="text-[10px] uppercase font-bold text-slate-400">Clave</span>
                                                                                <span className="font-mono font-bold text-slate-700">{item.key || item.product?.key}</span>
                                                                            </span>
                                                                            {item.product?.variant && <span className="text-gray-500 pl-2 border-l border-gray-300">{item.product.variant}</span>}
                                                                        </span>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        ${order.total ? order.total.toFixed(2) : '0.00'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="relative inline-block w-full max-w-[140px]">
                                                            <select
                                                                value={order.status || 'pending'}
                                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                                className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 ${order.status === 'completed'
                                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 focus:ring-emerald-500'
                                                                    : 'bg-orange-100 text-orange-800 border-orange-200 focus:ring-orange-500'
                                                                    }`}
                                                            >
                                                                <option value="pending">Pendiente</option>
                                                                <option value="completed">Ordenado</option>
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'bulk' ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-amber-100 text-center mb-8">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📦</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Carga Masiva de Productos</h2>
                            <p className="text-gray-600 mb-6 max-w-lg mx-auto">Actualiza precios, crea nuevos productos o inicia una nueva temporada subiendo un archivo CSV.</p>

                            <div className="grid md:grid-cols-2 gap-6 text-left">
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                                        Preparación
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Antes de cargar nuevos precios para una nueva temporada, es recomendable reiniciar los descuentos anteriores.
                                    </p>
                                    <button
                                        onClick={handleResetDiscounts}
                                        className="w-full bg-white border border-red-300 text-red-600 font-bold py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
                                        disabled={loading}
                                    >
                                        ⚠️ Reiniciar Temporada (Quitar Descuentos)
                                    </button>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                                        Cargar CSV
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="text-xs text-blue-800 bg-blue-100 p-2 rounded">
                                            <strong>Columnas requeridas:</strong> clave, nombre, precio_mx, precio_us<br />
                                            <strong>Opcionales:</strong> desc_mx, desc_us, categoria, imagen, variante
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            disabled={loading}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-600 file:text-white
                                                hover:file:bg-blue-700
                                                cursor-pointer"
                                        />
                                        {loading && <p className="text-sm text-blue-600 animate-pulse">Procesando archivo... por favor espere</p>}
                                        {bulkStats && <p className="text-sm font-bold text-green-600">{bulkStats}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold mb-4">Ejemplo de formato CSV</h3>
                            <div className="bg-gray-800 text-gray-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                                clave, nombre, categoria, precio_mx, desc_mx, precio_us, desc_us, imagen<br />
                                10203, Labial Rojo, Labios, 450, 35, 28, 30, https://ejemplo.com/labial.jpg<br />
                                50501, Crema Corporal, Cuerpo, 600, 0, 40, 0, https://ejemplo.com/crema.jpg
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span>⚙️</span> Configuración General
                            </h2>
                            <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Catálogo Actual</label>
                                    <p className="text-xs text-gray-400 mb-2">Este nombre aparecerá en los nuevos pedidos para identificar la vigencia de los precios (ej. "Diciembre 2025").</p>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Ej. Diciembre 2025"
                                        value={catalogName}
                                        onChange={(e) => setCatalogName(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar Configuración'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowAddProduct(!showAddProduct)}
                                className={`px-4 py-2 rounded-lg font-bold transition-colors ${showAddProduct ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                {showAddProduct ? 'Cancelar' : '+ Nuevo Producto'}
                            </button>
                        </div>

                        {showAddProduct && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                <h2 className="text-xl font-bold mb-4 text-gray-900">Agregar Nuevo Producto</h2>
                                <form onSubmit={handleCreateProduct} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Clave (Única)</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. 10203"
                                                value={newProduct.key}
                                                onChange={(e) => setNewProduct({ ...newProduct, key: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="0.00"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="Nombre del producto"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="https://..."
                                            value={newProduct.image}
                                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. General"
                                                value={newProduct.category}
                                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Variante (Opcional)</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. Rojo / 50ml"
                                                value={newProduct.variant}
                                                onChange={(e) => setNewProduct({ ...newProduct, variant: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                                    >
                                        {loading ? 'Guardando...' : 'Crear Producto'}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <h2 className="text-xl font-bold mb-4">Buscar Producto</h2>
                            <form onSubmit={handleSearchProduct} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Clave del producto (ej. 11012)"
                                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={productSearchKey}
                                    onChange={(e) => setProductSearchKey(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold">
                                    Buscar
                                </button>
                            </form>
                            {updateMessage && <p className="mt-2 text-sm font-medium text-blue-600">{updateMessage}</p>}
                        </div>

                        {searchedProduct && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex gap-4 mb-6 pb-6 border-b">
                                    {searchedProduct.image && <img src={searchedProduct.image} alt={searchedProduct.name} className="w-20 h-20 object-cover rounded-lg" />}
                                    <div>
                                        <h3 className="font-bold text-lg">{searchedProduct.name}</h3>
                                        <p className="text-gray-500 text-sm">Clave: {searchedProduct.key}</p>
                                        <p className="text-gray-500 text-sm">Precio Actual (MX): ${searchedProduct.price}</p>
                                    </div>
                                </div>

                                <h3 className="font-bold mb-4">Actualizar Precios por Región</h3>
                                <form onSubmit={handleUpdatePrice} className="space-y-6">

                                    {/* CONTROL MODE TOGGLE */}
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <h4 className="font-bold text-indigo-900">Modo de Control de Descuentos</h4>
                                            <p className="text-xs text-indigo-600">Elige si quieres aplicar el mismo descuento a todos o personalizarlo.</p>
                                        </div>
                                        <div className="flex bg-white rounded-lg p-1 border border-indigo-200 shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => setPriceForm(prev => ({ ...prev, applyGlobalControl: true, globalDiscount: prev.MX.discount || 0 }))}
                                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${priceForm.applyGlobalControl ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                Unificado (Iguales)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPriceForm(prev => ({ ...prev, applyGlobalControl: false }))}
                                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!priceForm.applyGlobalControl ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                Individual (Por País)
                                            </button>
                                        </div>
                                    </div>

                                    {priceForm.applyGlobalControl && (
                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                            <label className="block text-sm font-bold text-purple-900 mb-2">Descuento Unificado (%)</label>
                                            <select
                                                value={priceForm.globalDiscount}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value)
                                                    setPriceForm(prev => ({
                                                        ...prev,
                                                        globalDiscount: val,
                                                        MX: { ...prev.MX, discount: val },
                                                        US: { ...prev.US, discount: val }
                                                    }))
                                                }}
                                                className="w-full p-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white font-bold text-lg"
                                            >
                                                {discountOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}%</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* MEXICO FORM */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative overflow-hidden">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl">🇲🇽</span>
                                            <h4 className="font-bold text-gray-800">México (MXN)</h4>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Original (Base)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2 border rounded-lg mb-2 text-lg font-medium"
                                                    value={priceForm.MX.originalPrice}
                                                    onChange={(e) => setPriceForm({ ...priceForm, MX: { ...priceForm.MX, originalPrice: e.target.value } })}
                                                />
                                            </div>
                                            {!priceForm.applyGlobalControl && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descuento MX (%)</label>
                                                    <select
                                                        value={priceForm.MX.discount}
                                                        onChange={(e) => setPriceForm({ ...priceForm, MX: { ...priceForm.MX, discount: Number(e.target.value) } })}
                                                        className="w-full p-2 border rounded-lg bg-white font-bold"
                                                    >
                                                        {discountOptions.map(opt => (
                                                            <option key={opt} value={opt}>{opt}%</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                            <span className="text-gray-600 font-medium">Nuevo Precio al Cliente:</span>
                                            <span className="text-2xl font-bold text-green-600">${calculatePreviewPrice('MX', priceForm.MX.originalPrice)}</span>
                                        </div>
                                    </div>

                                    {/* USA FORM */}
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 relative overflow-hidden">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl">🇺🇸</span>
                                            <h4 className="font-bold text-gray-800">Estados Unidos (USD)</h4>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Original (Base)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2 border rounded-lg mb-2 text-lg font-medium"
                                                    value={priceForm.US.originalPrice}
                                                    onChange={(e) => setPriceForm({ ...priceForm, US: { ...priceForm.US, originalPrice: e.target.value } })}
                                                />
                                            </div>
                                            {!priceForm.applyGlobalControl && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descuento US (%)</label>
                                                    <select
                                                        value={priceForm.US.discount}
                                                        onChange={(e) => setPriceForm({ ...priceForm, US: { ...priceForm.US, discount: Number(e.target.value) } })}
                                                        className="w-full p-2 border rounded-lg bg-white font-bold"
                                                    >
                                                        {discountOptions.map(opt => (
                                                            <option key={opt} value={opt}>{opt}%</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex justify-between items-center bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                            <span className="text-gray-600 font-medium">Nuevo Precio al Cliente:</span>
                                            <span className="text-2xl font-bold text-green-600">${calculatePreviewPrice('US', priceForm.US.originalPrice)}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md text-lg"
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Todos los Cambios'}
                                    </button>
                                </form>

                                <div className="mt-12 pt-8 border-t border-gray-100">
                                    <h4 className="font-bold text-red-600 mb-2">Zona de Peligro</h4>
                                    <p className="text-sm text-gray-500 mb-4">Una vez eliminado, este producto no se podrá recuperar.</p>
                                    <button
                                        type="button"
                                        onClick={handleDeleteProduct}
                                        className="w-full bg-white border border-red-200 text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
                                    >
                                        Eliminar Producto
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
