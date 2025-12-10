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
    const [sliderValue, setSliderValue] = useState(1) // State for mobile slider
    const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false)

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

    // Sync slider with actual page
    useEffect(() => {
        setSliderValue(currentPage)

        // Auto-scroll to products when page or category changes
        // Use a timeout to ensure DOM is ready and state is settled
        const timer = setTimeout(() => {
            const productsStart = document.getElementById('products-start')
            if (productsStart) {
                // Check if we are physically below the products start to avoid unnecessary small scrolls on desktop top
                const rect = productsStart.getBoundingClientRect()
                if (rect.top < 0 || window.scrollY > 200) {
                    productsStart.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }
        }, 100)
        return () => clearTimeout(timer)
    }, [currentPage, selectedCategory])

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
                            className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all flex items-center gap-2 relative active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                            </svg>
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                            <span className="tracking-wide">CERRAR PEDIDO</span>
                        </button>
                    </div>

                    <form onSubmit={handleAddByKey} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-1 text-gray-400 px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-bold hidden sm:inline uppercase">Rápido:</span>
                        </div>
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

                <div id="products-start" className="flex flex-col lg:flex-row gap-6 scroll-mt-24">
                    {/* Sidebar / Category Menu */}
                    <aside className="w-full lg:w-64 flex-shrink-0 z-30 sticky top-[70px] bg-gray-50 pb-2 lg:pb-0">
                        <div className="bg-white rounded-lg shadow-sm p-3 lg:p-4 border border-gray-100">
                            <h3 className="text-blue-900 font-bold mb-3 flex items-center gap-2 text-sm lg:text-base uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-600">
                                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
                                </svg>
                                Categorías
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
                            <ul className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 lg:gap-1 pb-4 lg:pb-0 hide-scrollbar -mx-3 px-3 lg:mx-0 lg:px-0 scroll-pl-3 snap-x">
                                {categories.map(cat => {
                                    // Emoji mapping as requested
                                    const getIcon = (c) => {
                                        const lower = c.toLowerCase()
                                        if (lower.includes('fragan')) return '🌸'
                                        if (lower.includes('cuerpo') || lower.includes('piel')) return '🧴'
                                        if (lower.includes('cabello')) return '💇'
                                        if (lower.includes('maqui')) return '💄'
                                        // Ojos - Paintbrush (Abstract for Mascara Wand/Application)
                                        if (lower.includes('ojo')) return '🖌️'
                                        if (lower.includes('rostro') || lower.includes('cara')) return '🧖‍♀️'
                                        if (lower.includes('todas')) return '🌟'
                                        return '🏷️'
                                    }

                                    return (
                                        <li key={cat} className="flex-shrink-0 snap-center">
                                            <button
                                                onClick={() => handleCategoryChange(cat)}
                                                className={`
                                                flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3
                                                w-20 h-16 lg:w-full lg:h-auto
                                                p-2 lg:px-4 lg:py-3 
                                                rounded-xl 
                                                transition-all whitespace-nowrap 
                                                group
                                                ${selectedCategory === cat
                                                        ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white font-bold shadow-md shadow-blue-900/20 ring-1 ring-blue-900/10'
                                                        : 'bg-white text-gray-400 font-medium hover:bg-blue-50 hover:text-blue-800 border border-gray-100'
                                                    }
                                            `}
                                            >
                                                <div className="text-lg lg:text-xl filter drop-shadow-sm">
                                                    {getIcon(cat)}
                                                </div>
                                                <span className="text-[10px] lg:text-sm text-center lg:text-left leading-none lg:flex-1 w-full px-0.5 truncate">{cat}</span>

                                                {/* Desktop Arrow */}
                                                {selectedCategory === cat && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 hidden lg:block text-yellow-400">
                                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul></div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1 pb-0">
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

                                {/* Simplified Mobile-Optimized Pagination with Scrollable Dropdown */}
                                {totalPages > 1 && (
                                    <div className={`flex items-center justify-center gap-4 mt-6 pb-6 w-full max-w-md mx-auto px-4 relative ${isPageDropdownOpen ? 'z-50' : 'z-20'}`}>

                                        {/* Previous Button */}
                                        <button
                                            onClick={() => {
                                                setCurrentPage(p => Math.max(1, p - 1))
                                            }}
                                            disabled={currentPage === 1}
                                            className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        {/* Custom Scrollable Page Picker */}
                                        <div className="relative h-12 flex-1 max-w-[200px]">
                                            <button
                                                onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
                                                className="w-full h-full bg-white border border-blue-900/10 rounded-full shadow-sm flex items-center justify-center gap-2 px-4 text-blue-900 font-bold active:scale-95 transition-all text-sm sm:text-base whitespace-nowrap"
                                            >
                                                <span>Página {currentPage} de {totalPages}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-blue-900/50 transition-transform duration-300 ${isPageDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            {isPageDropdownOpen && (
                                                <>
                                                    {/* Backdrop to close on click outside */}
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={() => setIsPageDropdownOpen(false)}
                                                    ></div>

                                                    {/* Actual Menu */}
                                                    <div className="absolute bottom-full mb-2 left-0 right-0 max-h-60 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up flex flex-col">
                                                        <div className="overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200">
                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => {
                                                                        setCurrentPage(pageNum)
                                                                        setIsPageDropdownOpen(false)
                                                                    }}
                                                                    className={`w-full py-3 px-4 text-sm font-bold rounded-lg transition-colors flex items-center justify-between ${currentPage === pageNum
                                                                        ? 'bg-blue-50 text-blue-900'
                                                                        : 'text-gray-600 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    <span>Página {pageNum}</span>
                                                                    {currentPage === pageNum && (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-900" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Next Button */}
                                        <button
                                            onClick={() => {
                                                setCurrentPage(p => Math.min(totalPages, p + 1))
                                            }}
                                            disabled={currentPage === totalPages}
                                            className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
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
                                    className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-bold py-3 px-8 rounded-full shadow-xl shadow-cyan-600/20 hover:scale-105 hover:shadow-cyan-600/40 transform active:scale-95 transition-all flex items-center gap-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.555 9.592a3.752 3.752 0 00-2.872 4.13C3.842 20.232 5.37 21.75 7.333 21.75c1.992 0 3.6-1.586 3.758-3.75H14.908c.16 2.164 1.766 3.75 3.758 3.75 1.963 0 3.49-1.518 3.654-3.998a3.752 3.752 0 00-2.872-4.13l1.838-6.896a.75.75 0 00-.73-.943H5.97L5.56 2.628a.75.75 0 00-.728-.553H2.25zm13.5 15a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM8.25 17.25a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0z" />
                                    </svg>
                                    Ver Carrito
                                </button>
                            </div>
                        </div>
                    )
                }
            </main >
            <Footer />
            {/* Spacer for Sticky Cart Bar */}
            {totalItems > 0 && <div className="h-24 md:h-20 w-full bg-transparent" />}
        </div >
    )
}
