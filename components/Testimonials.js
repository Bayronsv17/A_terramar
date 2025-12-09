import { useState, useEffect } from 'react'

export default function Testimonials({ testimonials }) {
  const [current, setCurrent] = useState(0)

  // Use passed testimonials or empty array.
  const displayTestimonials = testimonials || []

  useEffect(() => {
    if (displayTestimonials.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % displayTestimonials.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [displayTestimonials.length])

  // If no testimonials, hide the section
  if (!displayTestimonials || displayTestimonials.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <span className="text-cyan-600 font-bold tracking-wider uppercase text-sm mb-2 block">Testimonios</span>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12">Lo que dicen de nosotros</h2>

        <div className="relative">
          {/* Carrusel Slide */}
          <div className="overflow-hidden p-4">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {displayTestimonials.map((t, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 relative mx-auto max-w-2xl transform hover:scale-[1.02] transition-transform duration-300">
                    {/* Comillas decorativas */}
                    <div className="absolute top-6 left-8 text-cyan-100 text-8xl font-serif -z-0 opacity-50">“</div>

                    <div className="relative z-10 flex flex-col items-center">

                      <div className="flex gap-1 text-yellow-400 mb-4 text-lg">
                        {'★'.repeat(5)}
                      </div>

                      <p className="text-gray-600 text-lg md:text-xl italic mb-6 leading-relaxed">
                        "{t.quote}"
                      </p>

                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{t.name}</h4>
                        <span className="text-cyan-600 text-sm font-medium">{t.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores (Puntos) */}
          <div className="flex justify-center gap-3 mt-8">
            {displayTestimonials.length > 1 && displayTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === current ? 'bg-cyan-600 w-8' : 'bg-gray-300 hover:bg-cyan-400'
                  }`}
                aria-label={`Ir al testimonio ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
