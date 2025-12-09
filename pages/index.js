import Head from 'next/head'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import VideoCarousel from '../components/VideoCarousel'
import Highlights from '../components/Highlights'
import Testimonials from '../components/Testimonials'
import ContactForm from '../components/ContactForm'
import WhatsAppButton from '../components/WhatsAppButton'
import Footer from '../components/Footer'
import dbConnect from '../lib/dbConnect'
import Setting from '../models/Setting'

export default function Home({ cmsData }) {
  // Determine highlights (either from CMS or undefined fallback handled in component)
  const highlights = cmsData?.home_highlights

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
          <Highlights products={highlights} />
          <VideoCarousel videos={cmsData?.home_videos} />
          <Testimonials testimonials={cmsData?.home_testimonials} />
          <ContactForm />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  )
}

export async function getServerSideProps() {
  try {
    await dbConnect()
    const allSettings = await Setting.find({})
    const cmsData = allSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {})

    return {
      props: {
        cmsData: JSON.parse(JSON.stringify(cmsData))
      }
    }
  } catch (e) {
    console.error("Error loading settings", e)
    return {
      props: {
        cmsData: {}
      }
    }
  }
}
