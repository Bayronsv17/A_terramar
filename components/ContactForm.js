import { useState } from 'react'

export default function ContactForm() {
  const currentYear = new Date().getFullYear()
  const maxBirthYear = currentYear - 18
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateStr = maxDate.toISOString().slice(0, 10)
  const minDateStr = '1950-01-01'

  const [form, setForm] = useState({ firstName: '', lastName: '', birthYear: '', birthDate: '', phone: '', address: '', email: '' })
  const [status, setStatus] = useState(null)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    // Prevent birthYear longer than 4 digits
    if (name === 'birthYear') {
      const cleaned = value.replace(/[^0-9]/g, '').slice(0, 4)
      setForm({ ...form, birthYear: cleaned })
      setErrors({ ...errors, birthYear: null })
      return
    }
    if (name === 'birthDate') {
      // value is YYYY-MM-DD, extract year
      const year = value ? String(new Date(value).getFullYear()) : ''
      setForm({ ...form, birthDate: value, birthYear: year })
      setErrors({ ...errors, birthYear: null })
      return
    }
    // First and last name: prevent digits and most symbols
    if (name === 'firstName' || name === 'lastName') {
      // Allow letters (including accents), spaces, hyphens and apostrophes
      const cleaned = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, '')
      setForm({ ...form, [name]: cleaned })
      setErrors({ ...errors, [name]: null })
      return
    }
    // phone: only digits, max 10
    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9]/g, '').slice(0, 10)
      setForm({ ...form, phone: cleaned })
      setErrors({ ...errors, phone: null })
      return
    }
    setForm({ ...form, [name]: value })
    setErrors({ ...errors, [name]: null })
  }

  function validateAll() {
    const newErrors = {}
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/
    if (!form.firstName || !form.firstName.trim()) newErrors.firstName = 'Ingresa tu nombre'
    else if (!nameRegex.test(form.firstName)) newErrors.firstName = 'El nombre no puede contener números ni símbolos'
    if (!form.lastName || !form.lastName.trim()) newErrors.lastName = 'Ingresa tus apellidos'
    else if (!nameRegex.test(form.lastName)) newErrors.lastName = 'Los apellidos no pueden contener números ni símbolos'
    if (!form.birthYear) newErrors.birthYear = 'Introduce tu año de nacimiento (4 dígitos)'
    else {
      const y = Number(form.birthYear)
      if (!/^[0-9]{4}$/.test(form.birthYear)) newErrors.birthYear = 'El año debe tener 4 dígitos'
      else if (y < 1950 || y > maxBirthYear) newErrors.birthYear = `Introduce un año entre 1950 y ${maxBirthYear}`
    }
    if (!form.phone || !form.phone.trim()) newErrors.phone = 'Introduce un número de celular (10 dígitos)'
    else if (!/^[0-9]{10}$/.test(form.phone)) newErrors.phone = 'El número debe tener exactamente 10 dígitos'
    if (!form.address || !form.address.trim()) newErrors.address = 'Introduce tu domicilio'
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Por favor, introduce una dirección de correo electrónico válida.'
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    const newErrors = validateAll()
    if (Object.keys(newErrors).length) { setErrors(newErrors); setStatus(null); return }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const data = await res.json()
        setStatus('sent')
        setForm({ firstName: '', lastName: '', birthYear: '', birthDate: '', phone: '', address: '', email: '' })
        if (data.preview) console.info('Preview URL:', data.preview)
        return
      }

      // If server-side validation failed, show those errors instead of falling back
      if (res.status === 400) {
        try {
          const d = await res.json()
          if (d && d.fields) {
            setErrors(d.fields)
            setStatus(null)
            return
          }
        } catch (e) { /* ignore and continue to fallback */ }
      }

      // fallback to Formspree
      const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID || '{TU_FORM_ID}'
      const res2 = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res2.ok) {
        setStatus('sent')
        setForm({ firstName: '', lastName: '', birthYear: '', birthDate: '', phone: '', address: '', email: '' })
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-blue-900 via-cyan-800 to-cyan-600 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium mb-4">Únete al Equipo</span>
          <h2 className="text-4xl font-bold text-white mt-2">¿Lista para transformar tu vida?</h2>
          <p className="text-cyan-100 mt-4 text-lg max-w-2xl mx-auto">
            Sé parte de una comunidad de mujeres exitosas. Déjame tus datos y te enseñaré cómo lograr tu independencia financiera con Terramar.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-8 md:p-12 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-bold text-gray-700 block">Nombre(s) *</label>
                <input
                  id="firstName"
                  name="firstName"
                  placeholder="Tu nombre"
                  value={form.firstName}
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3.5 transition-colors ${errors.firstName ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs font-semibold mt-1 flex items-center">⚠ {errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-bold text-gray-700 block">Apellidos *</label>
                <input
                  id="lastName"
                  name="lastName"
                  placeholder="Tus apellidos"
                  value={form.lastName}
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3.5 transition-colors ${errors.lastName ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs font-semibold mt-1 flex items-center">⚠ {errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="birthDate" className="text-sm font-bold text-gray-700 block">Fecha de nacimiento *</label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
                min={minDateStr}
                max={maxDateStr}
                className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3.5 transition-colors ${errors.birthYear ? 'border-red-500 bg-red-50' : ''}`}
              />
              {errors.birthYear && <p className="text-red-500 text-xs font-semibold mt-1 flex items-center">⚠ {errors.birthYear}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-bold text-gray-700 block">Número de celular * (10 dígitos)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                </div>
                <input
                  id="phone"
                  name="phone"
                  placeholder="55 1234 5678"
                  value={form.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block pl-10 p-3.5 transition-colors ${errors.phone ? 'border-red-500 bg-red-50' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs font-semibold mt-1 flex items-center">⚠ {errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-bold text-gray-700 block">Domicilio *</label>
              <input
                id="address"
                name="address"
                placeholder="Calle, número, colonia, ciudad..."
                value={form.address}
                onChange={handleChange}
                className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3.5 transition-colors ${errors.address ? 'border-red-500 bg-red-50' : ''}`}
              />
              {errors.address && <p className="text-red-500 text-xs font-semibold mt-1 flex items-center">⚠ {errors.address}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-700 block">Correo Electrónico *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block pl-10 p-3.5 transition-colors ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-semibold mt-1 flex items-center">⚠ {errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 font-bold rounded-lg text-lg px-5 py-4 text-center disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/50 mt-4"
            >
              {status === 'sending' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Enviando...
                </span>
              ) : '¡Quiero Unirme Ahora!'}
            </button>

            {status === 'sent' && (
              <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg text-center font-medium" role="alert">
                ¡Gracias! Tus datos se han enviado correctamente. Me pondré en contacto contigo muy pronto.
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center font-medium" role="alert">
                Lo sentimos, hubo un error al enviar. Por favor intenta de nuevo o contáctame por WhatsApp.
              </div>
            )}


          </form>
        </div>
      </div>
    </section>
  )
}
