import { useState, useEffect, useMemo, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../lib/CartContext'
import { useRouter } from 'next/router'
import ProductCard from '../components/ProductCard'
import { useToast } from '../lib/ToastContext'

export default function Productos() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('Todas')
    const [categories, setCategories] = useState(['Todas'])
    const [searchKey, setSearchKey] = useState('')
    const { cart, addToCart, removeFromCart } = useCart()
    const router = useRouter()
    const { addToast } = useToast()

    const [userRegion, setUserRegion] = useState('MX')
    const [catalogName, setCatalogName] = useState('')

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Fetch Products with Pagination and Filters
    const fetchProducts = useCallback(() => {
        setLoading(true)
        const params = new URLSearchParams({
            page: currentPage,
            limit: 20, // 20 items per page
            category: selectedCategory !== 'Todas' ? selectedCategory : '',
            region: userRegion
        })

        fetch(`/api/products?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setProducts(data.data)
                    // Update metadata
                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages)
                    }
                    // Update categories only if initially provided
                    if (data.categories) {
                        setCategories(data.categories)
                    }
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [currentPage, selectedCategory, userRegion])

    // Initial Setup
    useEffect(() => {
        let currentRegion = 'MX'
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                if (user.region) {
                    setUserRegion(user.region)
                    currentRegion = user.region
                }
            } catch (e) {
                console.error('Error parsing user data', e)
            }
        }

        // Fetch settings
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.data) {
                    setCatalogName(data.data.currentCatalogName || 'General')
                }
            })
    }, [])

    // Trigger fetch when params change
    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    // Memoize total items calculation
    const totalItems = useMemo(() => {
        return Object.values(cart).reduce((acc, item) => acc + item.quantity, 0)
    }, [cart])

    // Memoize cart total value
    const cartTotal = useMemo(() => {
        return Object.values(cart).reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)
    }, [cart])

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat)
        setCurrentPage(1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleAddByKey = useCallback(async (e) => {
        e.preventDefault()
        const qtyInput = document.getElementById('qty-key-input')
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1
        const key = searchKey.trim()

        if (!key) return

        // 1. Try Local Search (Current Page)
        let product = products.find(p => p.key.toLowerCase() === key.toLowerCase())

        // 2. If not found, Try API Search (Server)
        if (!product) {
            try {
                // We use the API to find the product regardless of pagination
                // Also ensures we get the fresh object with prices
                const res = await fetch(`/api/products?key=${key}&region=${userRegion}`)
                const data = await res.json()
                if (data.success && data.data && data.data.length > 0) {
                    product = data.data[0]
                }
            } catch (err) {
                console.error('Error fetching product by key:', err)
            }
        }

        if (product) {
            // Validate Visibility based on Region
            let isVisible = true
            if (userRegion === 'US') {
                if (typeof product.isVisibleUS !== 'undefined') isVisible = product.isVisibleUS
            } else {
                if (typeof product.isVisibleMX !== 'undefined') isVisible = product.isVisibleMX
            }

            if (!isVisible) {
                addToast('Producto no encontrado', 'error')
                setSearchKey('')
                return
            }

            // RESOLVE PRICE AND VISIBILITY BASED ON REGION
            let finalPrice = product.price
            let finalOriginalPrice = product.originalPrice

            // If US Region
            if (userRegion === 'US') {
                if (product.prices && product.prices.US && product.prices.US.price) {
                    finalPrice = product.prices.US.price
                    finalOriginalPrice = product.prices.US.originalPrice
                }
                // If not visible in US, maybe warn? But allow for now if admin allows.
            }
            // If MX Region
            else if (userRegion === 'MX') {
                if (product.prices && product.prices.MX && product.prices.MX.price) {
                    finalPrice = product.prices.MX.price
                    finalOriginalPrice = product.prices.MX.originalPrice
                }
            }

            const productToAdd = {
                ...product,
                price: finalPrice,
                originalPrice: finalOriginalPrice
            }

            for (let i = 0; i < quantity; i++) {
                addToCart(productToAdd)
            }
            addToast(`Agregado: ${product.name} (${quantity})`, 'success')
            setSearchKey('')
            if (qtyInput) qtyInput.value = 1
        } else {
            addToast('Producto no encontrado', 'error')
        }
    }, [products, searchKey, userRegion, addToCart, addToast])

    // Handlers for ProductCard
    const handleAdd = useCallback((product) => {
        addToCart(product)
        addToast(`Agregado al carrito`, 'success')
    }, [addToCart, addToast])
    const handleRemove = useCallback((id) => removeFromCart(id), [removeFromCart])

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-20">

                {/* Mobile-Optimized Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-yellow-600 text-xs font-serif italic leading-tight">Catálogo</h2>
                            <h1 className="text-blue-900 text-xl font-bold leading-tight uppercase">{catalogName || 'Cargando...'}</h1>
                        </div>
                        <button
                            onClick={() => router.push('/carrito')}
                            className="bg-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md hover:bg-cyan-700 transition-all flex items-center gap-2 relative active:scale-95"
                        >
                            <span className="text-base">🛒</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                            <span>Cerrar Pedido</span>
                        </button>
                    </div>

                    <form onSubmit={handleAddByKey} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <span className="text-xs font-bold text-gray-500 hidden sm:inline px-2">Agregar Rapido:</span>
                        <input
                            type="text"
                            placeholder="Clave del producto"
                            className="flex-1 min-w-0 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                        />
                        <input
                            type="number"
                            id="qty-key-input"
                            placeholder="Cant."
                            className="w-16 bg-white border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-center"
                            defaultValue={1}
                            min="1"
                        />
                        <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded font-bold hover:bg-blue-800 transition-colors shadow-sm">
                            +
                        </button>
                    </form>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar / Category Menu */}
                    <aside className="w-full lg:w-64 flex-shrink-0 z-10 sticky top-[70px] bg-gray-50 pb-2 lg:pb-0">
                        <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4 border border-gray-100">
                            <h3 className="text-yellow-600 font-bold mb-3 flex items-center gap-2 text-sm lg:text-base">
                                ≡ Categorías
                            </h3>
                            {/* Hide scrollbar with inline styles for cross-browser support */}
                            <style jsx>{`
                                .hide-scrollbar::-webkit-scrollbar {
                                    display: none;
                                }
                                .hide-scrollbar {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                }
                            `}</style>
                            <ul className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-1 pb-1 lg:pb-0 hide-scrollbar pr-4 lg:pr-0">
                                {categories.map(cat => (
                                    <li key={cat} className="flex-shrink-0">
                                        <button
                                            onClick={() => handleCategoryChange(cat)}
                                            className={`px-4 py-1.5 lg:px-3 lg:py-2 rounded-full lg:rounded text-xs lg:text-sm transition-all whitespace-nowrap w-full text-left border lg:border-none ${selectedCategory === cat
                                                ? 'bg-blue-900 text-white border-blue-900 font-bold shadow-md'
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat} <span className="hidden lg:inline float-right">{cat === 'Todas' ? '' : '❯'}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1 pb-24">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product._id || product.key}
                                            product={product}
                                            region={userRegion}
                                            quantity={cart[product._id || product.key]?.quantity || 0}
                                            onAdd={handleAdd}
                                            onRemove={handleRemove}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-4 mt-8 pb-8">
                                        <button
                                            onClick={() => {
                                                setCurrentPage(p => Math.max(1, p - 1))
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 font-medium transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <span className="flex items-center px-4 font-bold text-gray-600">
                                            Página {currentPage} de {totalPages}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setCurrentPage(p => Math.min(totalPages, p + 1))
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 font-medium transition-colors"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Sticky Bottom Cart Bar */}
                {
                    totalItems > 0 && (
                        <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 p-4 z-50 animate-fade-in-up">
                            <div className="container mx-auto max-w-4xl flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs font-medium">{totalItems} ARTÍCULOS</span>
                                    <span className="text-blue-900 font-bold text-xl">Total: ${cartTotal}</span>
                                </div>
                                <button
                                    onClick={() => router.push('/carrito')}
                                    className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-cyan-700 transform active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <span>🛒</span> Ver Carrito
                                </button>
                            </div>
                        </div>
                    )
                }
            </main >
            <Footer />
        </div >
    )
}
