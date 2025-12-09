import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'

const TIMEOUT_MS = 5 * 60 * 1000; // 5 Minutes
const WARNING_MS = 4 * 60 * 1000; // 4 Minutes (Show warning 1 min before)

export default function SessionTimeout() {
    const [showWarning, setShowWarning] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)
    const router = useRouter()

    // Refs to hold timer IDs
    const warningTimer = useRef(null)
    const logoutTimer = useRef(null)

    // Check if user is logged in
    const checkLogin = useCallback(() => {
        const user = localStorage.getItem('user')
        if (user) {
            setLoggedIn(true)
            startTimers()
        } else {
            setLoggedIn(false)
            clearTimers()
        }
    }, [])

    const clearTimers = () => {
        if (warningTimer.current) clearTimeout(warningTimer.current)
        if (logoutTimer.current) clearTimeout(logoutTimer.current)
    }

    const startTimers = () => {
        clearTimers()
        warningTimer.current = setTimeout(() => {
            setShowWarning(true)
        }, WARNING_MS)

        logoutTimer.current = setTimeout(() => {
            performLogout()
        }, TIMEOUT_MS)
    }

    const resetTimers = () => {
        if (showWarning) return // Don't reset if warning is already showing (wait for user action)
        if (!loggedIn) return
        startTimers()
    }

    const performLogout = () => {
        localStorage.removeItem('user')
        setShowWarning(false)
        setLoggedIn(false)
        // Force hard reload to clear screen immediately
        window.location.href = '/login'
    }

    const extendSession = () => {
        setShowWarning(false)
        startTimers()
    }

    // Monitor Activity
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll']

        const handleActivity = () => resetTimers()

        events.forEach(event => window.addEventListener(event, handleActivity))

        // Initial Check
        checkLogin()

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity))
            clearTimers()
        }
    }, [checkLogin, loggedIn, showWarning]) // Re-bind if login state changes

    // Watch for route changes (navigating counts as activity)
    useEffect(() => {
        const handleRouteChange = () => {
            checkLogin() // Re-check login status on nav
            resetTimers()
        }
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => router.events.off('routeChangeComplete', handleRouteChange)
    }, [router, checkLogin])

    if (!showWarning) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border-t-4 border-yellow-500">
                <div className="mb-4 text-yellow-500 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Sigues ahí?</h3>
                <p className="text-gray-600 mb-6">Estamos a punto de cerrar tu sesión por inactividad seguridad (5 min).</p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={extendSession}
                        className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
                    >
                        Continuar Sesión
                    </button>
                    <button
                        onClick={performLogout}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    )
}
