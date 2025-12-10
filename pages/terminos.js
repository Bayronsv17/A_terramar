import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Terminos() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-6 py-24">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Términos y Condiciones</h1>
                <div className="prose max-w-none text-gray-700 space-y-4">
                    <p>Bienvenido a AlmaTerramar.</p>
                    <p>Al acceder y utilizar este sitio web, aceptas cumplir con los siguientes términos y condiciones de uso.</p>

                    <h2 className="text-xl font-bold mt-4">1. Uso del Sitio</h2>
                    <p>Este sitio está destinado a la promoción y venta de productos Terramar. El contenido es para fines informativos y comerciales.</p>

                    <h2 className="text-xl font-bold mt-4">2. Productos y Precios</h2>
                    <p>Nos esforzamos por mostrar con precisión los colores y las imágenes de nuestros productos. Los precios están sujetos a cambios sin previo aviso.</p>

                    <h2 className="text-xl font-bold mt-4">3. Pedidos</h2>
                    <p>Nos reservamos el derecho de rechazar cualquier pedido que realices con nosotros.</p>

                    <h2 className="text-xl font-bold mt-4">4. Contacto</h2>
                    <p>Para cualquier duda referente a estos términos, por favor contáctanos a través de nuestros canales oficiales.</p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
