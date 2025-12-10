import '../styles/globals.css'
import { useEffect, useCallback } from 'react'
import { CartProvider } from '../lib/CartContext'
import { ToastProvider } from '../lib/ToastContext'

import SessionTimeout from '../components/SessionTimeout'

export default function MyApp({ Component, pageProps }) {
  // GA Initialization Logic
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

  useEffect(() => {
    // Analytics removed as per user request to remove cookie consent
  }, [])

  return (
    <CartProvider>
      <ToastProvider>
        <Component {...pageProps} />
        <SessionTimeout />
      </ToastProvider>
    </CartProvider>
  )
}
