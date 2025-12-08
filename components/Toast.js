import React, { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, duration)
        return () => clearTimeout(timer)
    }, [duration, onClose])

    const bgColors = {
        success: 'bg-gradient-to-r from-cyan-600 to-cyan-400',
        error: 'bg-gradient-to-r from-red-600 to-red-500',
        info: 'bg-gradient-to-r from-blue-600 to-blue-500'
    }

    const icons = {
        success: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }

    return (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-2xl transform transition-all duration-500 animate-slide-in-right ${bgColors[type] || bgColors.success} text-white min-w-[300px] max-w-sm backdrop-filter backdrop-blur-lg pointer-events-auto`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm shadow-inner shrink-0 leading-none flex items-center justify-center">
                    {icons[type] || icons.success}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs uppercase tracking-wider opacity-80 mb-0.5">{type === 'error' ? 'Error' : 'Notificación'}</h4>
                    <p className="font-semibold text-sm leading-tight break-words">{message}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                className="relative z-50 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-lg p-3 shrink-0 active:scale-95 ml-2"
                aria-label="Cerrar notificación"
            >
                <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <style jsx global>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    )
}
