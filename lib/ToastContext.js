import React, { createContext, useState, useContext, useCallback } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext()

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9)
        setToasts(prev => [...prev, { id, message, type }])
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const clearToasts = useCallback(() => {
        setToasts([])
    }, [])

    return (
        <ToastContext.Provider value={{ addToast, removeToast, clearToasts }}>
            {children}
            {/* Toast Container: Responsive positioning & High Z-Index */}
            <div
                className="fixed top-24 left-4 right-4 md:left-auto md:right-4 md:w-auto z-[99999] flex flex-col gap-3 pointer-events-none items-center md:items-end"
                style={{ zIndex: 99999 }}
            >
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto w-full md:w-auto flex justify-center md:block">
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
