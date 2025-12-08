# Landing Page - Next.js + Tailwind

Proyecto base para una landing page construido con Next.js y Tailwind CSS.

Pasos para ejecutar (Windows PowerShell):

```powershell
cd "c:\Users\52331\Desktop\landing  pagr"
npm install
npm run dev
```

Notas:
- Este proyecto usa Next.js y Tailwind CSS. Ya incluí `tailwind.config.js` y `postcss.config.js`.
- Si el linter muestra errores sobre `@tailwind` en `styles/globals.css`, es normal hasta que las dependencias estén instaladas y el entorno de PostCSS/Tailwind esté activo.

Estructura del proyecto:
- `pages/` - páginas de Next.js
- `components/` - componentes React (Navbar, Hero, Features, Footer)
- `public/assets` - imágenes y SVGs

Siguientes pasos: instalar dependencias con `npm install` y abrir http://localhost:3000 en tu navegador.

Variables de entorno útiles (usa `.env.local`):
- `GOOGLE_ANALYTICS_ID` — ID de Google Analytics (opcional)
- `FORMSPREE_ID` — ID de Formspree para envío del formulario
- `NEXT_PUBLIC_WHATSAPP_PHONE` — número para el botón de WhatsApp (ej: 5491XXXXXXXX)

Formspree:
- Para que el formulario envíe a tu email sin backend, crea una cuenta en Formspree y reemplaza `{TU_FORM_ID}` en `components/ContactForm.js` por tu ID.

EmailJS (opcional):
- Si prefieres enviar directamente a un correo usando EmailJS, crea una cuenta en https://www.emailjs.com/, crea un servicio y una plantilla.
- Rellena las variables en `.env.local` o en el ejemplo `.env.local.example` (`NEXT_PUBLIC_EMAILJS_USER`, `NEXT_PUBLIC_EMAILJS_SERVICE`, `NEXT_PUBLIC_EMAILJS_TEMPLATE`).
- El formulario detectará EmailJS por las variables y lo usará; si no están definidas, usará Formspree por defecto.

Seguridad y privacidad (recomendaciones):
- No comites `.env.local` ni claves en el repositorio. Usa variables de entorno en el servidor.
- Para "cerrar" el código al distribuir, genera la build de producción (`npm run build`) y despliega los artefactos (no expongas los sources en un servidor público).
- Revisa y configura correctamente la política CSP en `next.config.js` si agregas recursos externos.

Rendimiento:
- Usa `next/image` para optimizar imágenes (si subes imágenes reales). Actualmente se usan `img` de placeholder.
- Habilita compresión (gzip/brotli) en tu servidor o CDN y usa un CDN para assets grandes.

Enviar correos (API interna):
- He añadido una API route en `/api/contact` que usa `nodemailer` para enviar correos desde el servidor. Para usarla debes configurar variables de entorno SMTP (ver `.env.local.example`).
- En Vercel añade las variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_TO`, y opcionalmente `SMTP_FROM`.

Despliegue en Vercel:
- Crea un nuevo proyecto en Vercel conectado al repositorio. En Settings > Environment Variables añade las variables mencionadas (`NEXT_PUBLIC_WHATSAPP_PHONE`, `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`, y las de SMTP sin `NEXT_PUBLIC_`).
- Vercel construye con `npm run build` y servirá la app automáticamente.

