import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-gray-50">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-gradient-to-br from-cyan-100 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-16 relative z-10">

        {/* Text Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs tracking-widest uppercase mb-6">
            Consultora Independiente Terramar
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Potencia tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Belleza</span>, <br className="hidden md:block" />
            Lidera tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Futuro</span>.
          </h1>

          <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
            Descubre la cosmética de alta gama que tu piel merece y la oportunidad de negocio que te dará la libertad financiera que sueñas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="#products"
              className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all transform hover:-translate-y-1"
            >
              Ver Productos
            </a>
            <a
              href="#contact"
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-full font-bold hover:border-cyan-500 hover:text-cyan-600 transition-all"
            >
              Quiero Emprender
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center md:justify-start gap-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white"></div>
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">+500 mujeres</span> ya han transformado su vida.
            </p>
          </div>
        </div>

        {/* Image Content */}
        <div className="md:w-1/2 flex justify-center relative">
          <div className="relative w-80 h-80 md:w-[450px] md:h-[450px]">
            {/* Pattern Dots */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-200 rounded-full opacity-50 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 rounded-full opacity-50 blur-xl"></div>

            <Image
              src="/assets/hero.jpg"
              alt="AlmaTerramar - Consultora Terramar"
              fill
              className="object-cover rounded-3xl shadow-2xl z-10 relative"
              priority
            />

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 z-20 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Calidad Garantizada</p>
                <p className="text-sm font-bold text-gray-900">100% Original</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
