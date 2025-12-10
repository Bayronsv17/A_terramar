import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function VideoCarousel({ videos }) {
  const [index, setIndex] = useState(0)

  const displayVideos = videos || []

  function prev() {
    setIndex((i) => (i - 1 + displayVideos.length) % displayVideos.length)
  }
  function next() {
    setIndex((i) => (i + 1) % displayVideos.length)
  }

  // Hide section if no videos
  if (!displayVideos || displayVideos.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <span className="text-cyan-600 font-bold tracking-wider uppercase text-sm">Aprende y Crece</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Videos Exclusivos</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Descubre tutoriales, testimonios y consejos.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Video Container */}
          <div className="overflow-hidden rounded-2xl shadow-2xl bg-black aspect-video relative group">
            {displayVideos.map((v, i) => (
              <div
                key={v.id || i}
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                {/* Only render iframe if active or close to active to save resources, 
                    but simplistic approach: render all hidden is okay for few videos, 
                     or map and only src the active one for performance */}
                <iframe
                  src={i === index ? `https://www.youtube.com/embed/${v.id}?rel=0` : ''}
                  title={v.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}

            {/* Navigation Arrows (Absolute over video) */}
            {displayVideos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/90 hover:text-cyan-700 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/90 hover:text-cyan-700 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails / Indicators */}
          <div className="flex justify-center gap-4 mt-8">
            {displayVideos.map((v, i) => (
              <button
                key={v.id || i}
                onClick={() => setIndex(i)}
                className={`relative overflow-hidden rounded-lg transition-all duration-300 border-2 ${i === index
                  ? 'w-24 h-16 border-cyan-500 ring-2 ring-cyan-200 ring-offset-2'
                  : 'w-20 h-14 border-transparent opacity-60 hover:opacity-100'
                  }`}
              >
                <img
                  src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
