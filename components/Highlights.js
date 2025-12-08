import Image from 'next/image'

const products = [
  {
    title: 'Óleo Tratamiento',
    img: '/assets/high1.jpg',
    desc: 'Repara, nutre y da brillo espectacular sin sensación grasa. El #1 de Terramar.',
    price: '$550.00'
  },
  {
    title: 'Polvo Micro-Exfoliante',
    img: '/assets/high2.jpg',
    desc: 'Exfoliación suave con extracto de perla y arroz para una piel radiante.',
    price: '$610.00'
  },
  {
    title: 'Mascarilla Intensiva',
    img: '/assets/high3.jpg',
    desc: 'Hidratación profunda y efecto lifting inmediato para lucir siempre joven.',
    price: '$480.00'
  },
]

export default function Highlights() {
  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-cyan-600 font-bold tracking-wider uppercase text-sm">Mis Favoritos</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2">Productos Estrella del Mes</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Seleccioné estos 3 productos especialmente para ti. Son los imperdibles de Terramar que transformarán tu rutina de belleza.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={p.img}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-gray-900">{p.title}</h3>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2 py-1 rounded-full">Top Ventas</span>
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {p.desc}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-gray-900">{p.price}</span>
                  <a href="#contact" className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors">
                    Lo quiero
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
