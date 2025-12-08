import '../styles/globals.css'
import { useEffect, useCallback } from 'react'
import CookieConsent from '../components/CookieConsent'

function loadGA(id) {
  if (!id) return
  if (window.gtag) return
  // Insert GA script
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script1)
  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  window.gtag = gtag
  window.gtag('js', new Date())
  window.gtag('config', id)
}

import { CartProvider } from '../lib/CartContext'
import { ToastProvider } from '../lib/ToastContext'

export default function MyApp({ Component, pageProps }) {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

  const onAccept = useCallback(() => {
    if (typeof window !== 'undefined' && gaId) {
      loadGA(gaId)
    }
  }, [gaId])

  useEffect(() => {
    // If user already accepted, initialize GA on load
    if (typeof window !== 'undefined' && localStorage.getItem('cookie_consent') === 'true') {
      if (gaId) loadGA(gaId)
    }
  }, [gaId])

  return (
    <CartProvider>
      <ToastProvider>
        <Component {...pageProps} />
        <CookieConsent onAccept={onAccept} />
      </ToastProvider>
    </CartProvider>
  )
}
