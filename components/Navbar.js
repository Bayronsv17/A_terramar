import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../lib/CartContext'
import Link from 'next/link'
import { useToast } from '../lib/ToastContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const { logoutUser } = useCart()
  const { clearToasts } = useToast()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    // Check auth status
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true)
      setUserRole(localStorage.getItem('role') || '')
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserName(user.name || user.firstName || 'Usuario')
        } catch (e) {
          console.error('Error parsing user data', e)
        }
      }
    }

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    clearToasts()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    localStorage.removeItem('admin_auth')
    logoutUser() // Clear cart context user
    setIsLoggedIn(false)
    setUserName('')
    window.dispatchEvent(new Event('auth:logout')) // Notify other components
    // Use window.location.href for faster, cleaner logout that forces a reload
    window.location.href = '/login'
  }

  // Check if current route is public
  const isPublicRoute = ['/', '/login', '/registro'].includes(router.pathname)

  // Navbar for Logged In Users (Client Interface)
  if (isLoggedIn) {
    return (
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white py-4 shadow-sm'}`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/productos')}>
            <span className="text-2xl font-bold tracking-tighter text-gray-900">
              Alma<span className="text-cyan-600">Terramar</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {userName && (
              <span className="text-gray-600 font-medium text-sm hidden sm:block">
                Hola, <span className="text-cyan-700 font-bold">{userName}</span>
              </span>
            )}

            {userRole !== 'admin' && (
              <button
                onClick={() => router.push('/mis-pedidos')}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium text-sm group-hover:text-cyan-700 hidden sm:block">Mis Pedidos</span>
              </button>
            )}

            <div className="h-6 w-px bg-gray-200"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors text-sm font-medium"
              title="Cerrar Sesión"
            >
              <span className="hidden sm:block">Salir</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    )
  }

  // Minimal Navbar for Login Page OR if we are on a protected route but not logged in (logging out)
  // This prevents the "Public Landing Page" navbar from flashing during logout
  if (router.pathname === '/login' || router.pathname === '/registro' || (!isLoggedIn && !isPublicRoute)) {
    return (
      <header className="fixed w-full top-0 z-50 bg-white py-4 shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-2xl font-bold tracking-tighter text-gray-900">
              Alma<span className="text-cyan-600">Terramar</span>
            </span>
          </div>
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">Inicio</Link>
          </nav>
        </div>
      </header>
    )
  }

  // Navbar for Public Landing Page
  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer">
          <span className={`text-2xl font-bold tracking-tighter ${scrolled ? 'text-gray-900' : 'text-gray-800'}`}>
            Alma<span className="text-cyan-600">Terramar</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="/#home" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">Inicio</a>
          <a href="/#products" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">Productos</a>
          <a href="/#contact" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">Contacto</a>
        </nav>

        <div>
          <a
            href="/login"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 text-sm"
          >
            Ordenar Productos
          </a>
        </div>
      </div>
    </header>
  )
}
