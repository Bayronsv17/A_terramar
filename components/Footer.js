export default function Footer(){
  return (
    <footer className="bg-gray-900 text-gray-200 py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} AlmaTerramar</div>
          <div className="space-x-4">
            <a href="#" className="hover:underline">Términos</a>
            <a href="#" className="hover:underline">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
