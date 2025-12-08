import {useState, useEffect} from 'react'

export default function CookieConsent({onAccept}){
  const [accepted, setAccepted] = useState(null)

  useEffect(() => {
    const v = localStorage.getItem('cookie_consent')
    setAccepted(v === 'true')
  }, [])

  function accept(){
    localStorage.setItem('cookie_consent', 'true')
    setAccepted(true)
    if(typeof onAccept === 'function') onAccept()
  }

  if(accepted) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 bg-white border rounded-lg p-4 shadow-lg z-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-gray-700">Usamos cookies y analíticas para mejorar la experiencia. Si aceptas, activaremos analíticas.</div>
        <div className="flex gap-2">
          <button onClick={accept} className="bg-blue-600 text-white px-4 py-2 rounded-md">Aceptar</button>
        </div>
      </div>
    </div>
  )
}
