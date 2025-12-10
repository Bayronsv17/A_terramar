import { useState, useEffect } from 'react'

export default function Testimonials({ testimonials }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  // Use passed testimonials or empty array.
  const displayTestimonials = testimonials || []

  useEffect(() => {
    if (displayTestimonials.length > 1 && !isPaused) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % displayTestimonials.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [displayTestimonials.length, isPaused])

  // Swipe logic
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsPaused(true) // Pause while touching
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setCurrent((prev) => (prev + 1) % displayTestimonials.length)
    } else if (isRightSwipe) {
      setCurrent((prev) => (prev === 0 ? displayTestimonials.length - 1 : prev - 1))
    }

    // Optional: Resume after a short delay or immediately? 
    // Usually better to let user manually resume by just lifting finger, 
    // but we can leave isPaused=false to resume auto-play eventually.
    // For now, let's keep it simple: unpause on release.
    setIsPaused(false)
  }

  // If no testimonials, hide the section
  if (!displayTestimonials || displayTestimonials.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <span className="text-cyan-600 font-bold tracking-wider uppercase text-sm mb-2 block font-sans">Testimonios</span>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12 font-sans">Lo que dicen de nosotros</h2>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Carrusel Slide */}
          <div className="overflow-hidden p-4">
            <div
              className={`flex transition-transform duration-700 ease-in-out ${isPaused ? '' : ''}`}
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {displayTestimonials.map((t, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 relative mx-auto max-w-2xl transform transition-transform duration-300 select-none cursor-grab active:cursor-grabbing">
                    {/* Comillas decorativas */}
                    <div className="absolute top-6 left-8 text-cyan-100 text-8xl font-serif -z-0 opacity-50">“</div>

                    <div className="relative z-10 flex flex-col items-center">

                      <div className="flex gap-1 text-yellow-400 mb-4 text-lg">
                        {'★'.repeat(5)}
                      </div>

                      <p className="text-gray-600 text-lg md:text-xl italic mb-6 leading-relaxed font-sans">
                        &quot;{t.quote}&quot;
                      </p>

                      <div>
                        <h4 className="font-bold text-gray-900 text-lg font-sans">{t.name}</h4>
                        <span className="text-cyan-600 text-sm font-medium font-sans">{t.role}</span>
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
