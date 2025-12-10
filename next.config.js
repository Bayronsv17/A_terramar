/** @type {import('next').NextConfig} */
const securityHeadersBase = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), microphone=()',
  },
]

// Construir CSP condicional: en desarrollo permitimos 'unsafe-eval' porque
// react-refresh / webpack dev usan eval(); en producción no lo permitimos.
function cspHeaderValue() {
  // base policies: allow self for most, allow images from common CDNs and YouTube thumbnails
  const base = "default-src 'self'; img-src 'self' data: https://img.youtube.com https://i.ytimg.com https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https://formspree.io https://api.emailjs.com https://www.google-analytics.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com; child-src https://www.youtube.com https://www.youtube-nocookie.com;"
  if (process.env.NODE_ENV !== 'production') {
    return base + " script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;"
  }
  return base + " script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;"
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  productionBrowserSourceMaps: false,
  // Cambiar carpeta de salida para evitar problemas de permisos en `.next`
  // distDir: 'build',
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com'],
  },
  async headers() {
    const csp = {
      key: 'Content-Security-Policy',
      value: cspHeaderValue(),
    }
    const headers = [...securityHeadersBase, csp]
    return [
      {
        source: '/(.*)',
        headers,
      },
    ]
  },
}

module.exports = nextConfig
