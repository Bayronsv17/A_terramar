import Image from 'next/image'

export default function Highlights({ products }) {
  const defaultProducts = [
    {
      title: 'Óleo Tratamiento',
      img: 'https://res.cloudinary.com/dih0cyoun/image/upload/v1765290317/Oleo_Tratamiento_pf6dlv.webp',
      desc: 'Repara, nutre y da brillo espectacular sin sensación grasa. El #1 de Terramar.',
    },
    {
      title: 'Polvo Micro-Exfoliante',
      img: 'https://res.cloudinary.com/dih0cyoun/image/upload/v1765290433/Polvo_microexfoliante_kadvvk.webp',
      desc: 'Exfoliación suave con extracto de perla y arroz para una piel radiante.',
    },
    {
      title: 'Mascarilla Intensiva',
      img: 'https://res.cloudinary.com/dih0cyoun/image/upload/v1765290432/mascarilla_intensiva_culnbf.webp',
      desc: 'Hidratación profunda y efecto lifting inmediato para lucir siempre joven.',
    },
  ]

  const items = (products && products.length > 0) ? products : defaultProducts

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
          {items.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 group flex flex-col h-full">
              <div className="relative h-96 w-full overflow-hidden bg-white p-6">
                <Image
                  src={p.img}
                  alt={p.title}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image' }}
                />
              </div>
              <div className="p-8 flex-1 flex flex-col bg-white">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-gray-900 leading-tight">{p.title}</h3>
                  <span className="bg-cyan-50 text-cyan-700 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap border border-cyan-100 uppercase tracking-wide">Top Ventas</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
