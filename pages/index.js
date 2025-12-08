import Head from 'next/head'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
// Features removed - replaced by VideoCarousel
import VideoCarousel from '../components/VideoCarousel'
import Highlights from '../components/Highlights'
import Testimonials from '../components/Testimonials'
import ContactForm from '../components/ContactForm'
import WhatsAppButton from '../components/WhatsAppButton'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>AlmaTerramar | Consultora Terramar - Belleza y Negocios</title>
        <meta name="description" content="Descubre productos de belleza Terramar de alta calidad y únete a mi equipo de consultoras exitosas. ¡Transforma tu vida hoy!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <Highlights />
          <VideoCarousel />
          <Testimonials />
          <ContactForm />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  )
}
