const features = [
  {title: 'Rápido', desc: 'Construido con tecnologías modernas para un rendimiento excelente.'},
  {title: 'Flexible', desc: 'Diseño responsive y fácil de personalizar.'},
  {title: 'Seguro', desc: 'Buenas prácticas de seguridad aplicadas.'},
]

export default function Features(){
  return (
    <section id="features" className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Características</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 border rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
