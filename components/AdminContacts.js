import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../lib/ToastContext'
import { Users, RefreshCcw, Phone, Mail, Clipboard, Trash2, Copy } from 'lucide-react'



export default function AdminContacts() {
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(false)
    const { addToast } = useToast()

    const fetchContacts = useCallback(async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/admin/contacts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setContacts(data.data)
            }
        } catch (e) {
            console.error(e)
            addToast('Error al cargar contactos', 'error')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        fetchContacts()
    }, [fetchContacts])

    const deleteContact = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/admin/contacts?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                addToast('Registro eliminado', 'success')
                fetchContacts()
            } else {
                addToast('Error al eliminar', 'error')
            }
        } catch (e) {
            addToast('Error de conexión', 'error')
        }
    }

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/admin/contacts', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id, status: newStatus })
            })
            const data = await res.json()
            if (data.success) {
                addToast('Estado actualizado', 'success')
                fetchContacts()
            }
        } catch (e) {
            addToast('Error al actualizar', 'error')
        }
    }

    const handleCopy = (text, label) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        addToast(`${label} copiado`, 'success')
    }

    const copyFullData = (c) => {
        const text = `PROSPECTO TERRAMAR:
Nombre: ${c.firstName} ${c.lastName}
Celular: ${c.phone}
Email: ${c.email}
Fecha Nacimiento: ${c.birthDate || c.birthYear || 'N/A'}
Domicilio: ${c.address}
Fecha Registro: ${new Date(c.createdAt).toLocaleDateString()} ${new Date(c.createdAt).toLocaleTimeString()}`.trim()
        handleCopy(text, 'Ficha completa')
    }

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users size={28} className="text-blue-900" /> Prospectos / Contactos
                </h1>
                <button
                    onClick={fetchContacts}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    title="Actualizar lista"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="md:hidden space-y-4 p-4 bg-gray-50">
                    {loading ? (
                        <p className="text-center text-gray-500">Cargando contactos...</p>
                    ) : contacts.length === 0 ? (
                        <p className="text-center text-gray-500">No hay contactos aún.</p>
                    ) : (
                        contacts.map((c) => (
                            <div key={c._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                            {c.firstName} {c.lastName}
                                            <button onClick={() => handleCopy(`${c.firstName} ${c.lastName}`, 'Nombre')} className="text-gray-300 hover:text-blue-500">
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(c.createdAt).toLocaleDateString()} • {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyFullData(c)}
                                            className="text-blue-600 bg-blue-50 p-2 rounded-full"
                                            title="Copiar Ficha"
                                        >
                                            <Clipboard size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteContact(c._id)}
                                            className="text-red-500 bg-red-50 p-2 rounded-full"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone size={16} className="text-gray-400" />
                                        <a href={`https://wa.me/52${c.phone}`} target="_blank" className="hover:text-green-600 font-medium">{c.phone}</a>
                                        <button onClick={() => handleCopy(c.phone, 'Teléfono')} className="text-gray-300">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail size={16} className="text-gray-400" />
                                        <a href={`mailto:${c.email}`} className="truncate max-w-[200px]">{c.email}</a>
                                        <button onClick={() => handleCopy(c.email, 'Email')} className="text-gray-300">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <span className="text-gray-400 text-lg leading-none">📍</span>
                                        <span className="flex-1 text-xs">{c.address}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Estado</span>
                                    <select
                                        value={c.status}
                                        onChange={(e) => updateStatus(c._id, e.target.value)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 ${c.status === 'new' ? 'bg-emerald-100 text-emerald-800 focus:ring-emerald-500' :
                                            c.status === 'contacted' ? 'bg-blue-100 text-blue-800 focus:ring-blue-500' :
                                                'bg-gray-100 text-gray-800 focus:ring-gray-500'
                                            }`}
                                    >
                                        <option value="new">NUEVO</option>
                                        <option value="contacted">CONTACTADO</option>
                                        <option value="completed">COMPLETADO</option>
                                        <option value="spam">SPAM</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Cargando...</td></tr>
                            ) : contacts.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4 text-gray-500">No hay registros aún.</td></tr>
                            ) : (
                                contacts.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                            <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                {c.firstName} {c.lastName}
                                                <button onClick={() => handleCopy(`${c.firstName} ${c.lastName}`, 'Nombre')} className="text-gray-400 hover:text-blue-500" title="Copiar nombre">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-500">Nac: {c.birthDate || c.birthYear || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1 group">
                                                <Phone size={14} className="text-gray-400" />
                                                <a href={`https://wa.me/52${c.phone}`} target="_blank" className="hover:text-green-600 hover:underline">{c.phone}</a>
                                                <button onClick={() => handleCopy(c.phone, 'Teléfono')} className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Copiar teléfono">
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 group">
                                                <Mail size={14} className="text-gray-400" />
                                                <a href={`mailto:${c.email}`} className="hover:text-blue-600 hover:underline">{c.email}</a>
                                                <button onClick={() => handleCopy(c.email, 'Email')} className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Copiar email">
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate group relative cursor-help">
                                            <span title={c.address}>{c.address}</span>
                                            <button onClick={() => handleCopy(c.address, 'Domicilio')} className="ml-2 text-gray-300 hover:text-blue-500 absolute right-0 top-1/2 -translate-y-1/2 bg-white px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Copy size={12} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={c.status}
                                                onChange={(e) => updateStatus(c._id, e.target.value)}
                                                className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer ${c.status === 'new' ? 'bg-green-100 text-green-800' :
                                                    c.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                <option value="new">NUEVO</option>
                                                <option value="contacted">CONTACTADO</option>
                                                <option value="completed">COMPLETADO</option>
                                                <option value="spam">SPAM</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => copyFullData(c)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                                                    title="Copiar Ficha Completa"
                                                >
                                                    <Clipboard size={16} /> <span className="text-xs font-bold ml-1 hidden lg:inline">Copiar Ficha</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteContact(c._id)}
                                                    className="text-red-400 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div >
        </div>
    )
}


