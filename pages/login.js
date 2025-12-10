import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCart } from '../lib/CartContext'
import { Mail, Lock } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { loginUser, logoutUser } = useCart()

    useEffect(() => {
        // Force logout on visiting login page - DISABLED FOR DEBUGGING
        // localStorage.removeItem('token')
        // localStorage.removeItem('user')
        // localStorage.removeItem('role')
        // localStorage.removeItem('admin_auth')
        // logoutUser()
    }, [logoutUser])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()

            if (res.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                localStorage.setItem('role', data.user.role)
                loginUser(data.user) // Update cart context

                // Reset admin auth logic from previous version
                if (data.user.role === 'admin') {
                    localStorage.setItem('admin_auth', 'true')
                    window.location.href = '/admin'
                } else {
                    window.location.href = '/productos'
                }
            } else {
                const msg = data.message || 'Error al iniciar sesión'
                alert('Error de login: ' + msg) // Explicit alert for user
                setError(msg)
            }
        } catch (err) {
            console.error(err)
            alert('Error de conexión: ' + err.message)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-50 to-blue-50"></div>
                <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-200/20 blur-3xl"></div>
                    <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-blue-200/20 blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-md px-4">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 md:p-10 rounded-3xl shadow-2xl shadow-cyan-900/5 animate-fade-in-up">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 mb-6 shadow-sm border border-cyan-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Bienvenida de nuevo</h1>
                            <p className="text-gray-500 text-sm">Ingresa a tu cuenta para continuar</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-center text-sm font-medium flex items-center justify-center gap-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Correo Electrónico</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-cyan-600 text-gray-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder-gray-400 text-gray-800 font-medium sm:text-sm shadow-sm"
                                        placeholder="ejemplo@correo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Contraseña</label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-cyan-600 text-gray-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder-gray-400 text-gray-800 font-medium sm:text-sm shadow-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-600/30 transform transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-cyan-600/40 disabled:opacity-50 disabled:shadow-none mt-4"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Iniciando...
                                    </span>
                                ) : 'Ingresar a mi cuenta'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 text-sm">
                                ¿No tienes una cuenta? <br />
                                <Link href="/registro" className="text-cyan-600 font-bold hover:text-cyan-800 hover:underline transition-colors mt-1 inline-block">
                                    Crear cuenta nueva
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} AlmaTerramar. Todos los derechos reservados.
                    </div>
                </div>
            </div>
        </div>
    )
}
