export default function WhatsAppButton(){
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5491123456789' // incluir código de país
  const text = encodeURIComponent('Hola, quiero más información sobre los servicios de Terramar')
  const href = `https://wa.me/${phone}?text=${text}`
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label="Chat por WhatsApp" className="fixed right-6 bottom-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-50">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M20.52 3.48A11.9 11.9 0 0012 .5 11.9 11.9 0 003.48 3.48 11.9 11.9 0 00.5 12c0 2.1.55 4.16 1.6 5.98L.5 23.5l5.7-1.5A11.9 11.9 0 0012 23.5c5.76 0 10.5-4.74 10.5-10.5 0-3.02-1.18-5.83-3.98-8.52zM12 21c-1.9 0-3.7-.5-5.24-1.4l-.38-.22-3.38.9.9-3.3-.25-.4A9 9 0 1130 12 9 9 0 0112 21z" />
      </svg>
    </a>
  )
}