import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Privacidad() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-6 py-24">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Política de Privacidad</h1>
                <div className="prose max-w-none text-gray-700 space-y-4">
                    <p>En AlmaTerramar, valoramos y respetamos tu privacidad.</p>

                    <h2 className="text-xl font-bold mt-4">1. Información que Recopilamos</h2>
                    <p>Podemos recopilar información personal que nos proporcionas voluntariamente, como tu nombre, dirección de correo electrónico, y número de teléfono al realizar pedidos o contactarnos.</p>

                    <h2 className="text-xl font-bold mt-4">2. Uso de la Información</h2>
                    <p>Utilizamos tu información para procesar pedidos, mejorar nuestros servicios y comunicarnos contigo sobre promociones o actualizaciones.</p>

                    <h2 className="text-xl font-bold mt-4">3. Protección de Datos</h2>
                    <p>Implementamos medidas de seguridad para proteger tu información personal contra acceso no autorizado.</p>

                    <h2 className="text-xl font-bold mt-4">4. Cookies</h2>
                    <p>Este sitio puede utilizar cookies para mejorar tu experiencia de navegación.</p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
