import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../lib/ToastContext'

export default function AdminCMS() {

    // Helper function for video ID extraction moved outside/hoisted safely
    function extractVideoID(url) {
        if (!url) return null
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)

    // Data States
    const [highlights, setHighlights] = useState([
        { title: '', img: '', desc: '' },
        { title: '', img: '', desc: '' },
        { title: '', img: '', desc: '' }
    ])

    const [videos, setVideos] = useState([])
    const [testimonials, setTestimonials] = useState([])

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    const fetchSettings = useCallback(async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success && data.data) {
                if (data.data.home_highlights) setHighlights(data.data.home_highlights)
                if (data.data.home_videos) setVideos(data.data.home_videos)
                if (data.data.home_testimonials) setTestimonials(data.data.home_testimonials)
            }
        } catch (e) {
            console.error(e)
            addToast('Error cargando contenido', 'error')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    const saveSection = async (key, value) => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            })
            const data = await res.json()
            if (data.success) {
                addToast('Guardado correctamente', 'success')
            } else {
                addToast('Error al guardar', 'error')
            }
        } catch (e) {
            addToast('Error de conexión', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Highlights Updates
    const updateHighlight = (index, field, value) => {
        const newH = [...highlights]
        newH[index] = { ...newH[index], [field]: value }
        setHighlights(newH)
    }

    // Videos Updates
    const addVideo = () => {
        setVideos([...videos, { id: '', title: '' }])
    }
    const removeVideo = (index) => {
        const newV = videos.filter((_, i) => i !== index)
        setVideos(newV)
    }
    const updateVideo = (index, field, value) => {
        const newV = [...videos]
        if (field === 'url') {
            // Extract ID from URL if possible
            const id = extractVideoID(value)
            newV[index] = { ...newV[index], id: id || value } // Fallback to value if extraction fails (maybe they pasted ID directly)
        } else {
            newV[index] = { ...newV[index], [field]: value }
        }
        setVideos(newV)
    }


    // Testimonials Updates
    const addTestimonial = () => {
        setTestimonials([...testimonials, { name: '', role: '', quote: '' }])
    }
    const removeTestimonial = (index) => {
        const newT = testimonials.filter((_, i) => i !== index)
        setTestimonials(newT)
    }
    const updateTestimonial = (index, field, value) => {
        const newT = [...testimonials]
        newT[index] = { ...newT[index], [field]: value }
        setTestimonials(newT)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>📝</span> Editor de Contenido Inicio
            </h1>

            {/* HIGHLIGHTS SECTION */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                    <h2 className="font-bold text-blue-900">Productos Estrella (Highlights)</h2>
                    <button
                        onClick={() => saveSection('home_highlights', highlights)}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                        Guardar
                    </button>
                </div>
                <div className="p-6 grid gap-6">
                    {highlights.map((item, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase">Producto #{idx + 1}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Título</label>
                                    <input type="text" value={item.title} onChange={e => updateHighlight(idx, 'title', e.target.value)} className="w-full p-2 border rounded text-sm" />
                                    <label className="block text-xs font-bold text-gray-700 mt-2 mb-1">Descripción</label>
                                    <textarea value={item.desc} onChange={e => updateHighlight(idx, 'desc', e.target.value)} className="w-full p-2 border rounded text-sm h-20 resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">URL Imagen</label>
                                    <input type="text" value={item.img} onChange={e => updateHighlight(idx, 'img', e.target.value)} className="w-full p-2 border rounded text-sm mb-2" />
                                    <div className="bg-white border rounded h-32 flex items-center justify-center overflow-hidden relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {item.img ? <img src={item.img} alt="" className="h-full object-contain" onError={e => e.target.style.display = 'none'} /> : <span className="text-gray-300 text-xs">Sin imagen</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* VIDEOS SECTION */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-cyan-50 px-6 py-4 border-b border-cyan-100 flex justify-between items-center">
                    <h2 className="font-bold text-cyan-900">Videos (YouTube)</h2>
                    <button
                        onClick={() => saveSection('home_videos', videos)}
                        disabled={loading}
                        className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-cyan-700 transition-colors"
                    >
                        Guardar
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {videos.map((video, idx) => (
                        <div key={idx} className="flex gap-4 items-start border p-4 rounded-lg bg-gray-50">
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Título del Video"
                                    value={video.title}
                                    onChange={e => updateVideo(idx, 'title', e.target.value)}
                                    className="w-full p-2 border rounded text-sm"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="URL de YouTube (ej. https://youtu.be/...)"
                                        defaultValue={video.id ? `https://youtu.be/${video.id}` : ''}
                                        onBlur={e => updateVideo(idx, 'url', e.target.value)}
                                        className="w-full p-2 border rounded text-sm"
                                    />
                                    <div className="w-32 bg-black rounded overflow-hidden aspect-video flex-shrink-0 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {video.id && <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-80" />}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => removeVideo(idx)} className="text-red-500 hover:text-red-700 p-2">🗑️</button>
                        </div>
                    ))}
                    <button onClick={addVideo} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-cyan-500 hover:text-cyan-600 transition-colors">
                        + Agregar Video
                    </button>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
                    <h2 className="font-bold text-purple-900">Testimonios</h2>
                    <button
                        onClick={() => saveSection('home_testimonials', testimonials)}
                        disabled={loading}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                    >
                        Guardar
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {testimonials.map((t, idx) => (
                        <div key={idx} className="flex gap-4 items-start border p-4 rounded-lg bg-gray-50">
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nombre (ej. María Pérez)"
                                        value={t.name}
                                        onChange={e => updateTestimonial(idx, 'name', e.target.value)}
                                        className="w-full p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Rol (ej. Cliente Satisfecha)"
                                        value={t.role}
                                        onChange={e => updateTestimonial(idx, 'role', e.target.value)}
                                        className="w-full p-2 border rounded text-sm"
                                    />
                                </div>
                                <textarea
                                    placeholder="Comentario o Cita..."
                                    value={t.quote}
                                    onChange={e => updateTestimonial(idx, 'quote', e.target.value)}
                                    className="w-full p-2 border rounded text-sm h-20 resize-none"
                                />
                            </div>
                            <button onClick={() => removeTestimonial(idx)} className="text-red-500 hover:text-red-700 p-2">🗑️</button>
                        </div>
                    ))}
                    <button onClick={addTestimonial} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-600 transition-colors">
                        + Agregar Testimonio
                    </button>
                </div>
            </section>
        </div>
    )
}
