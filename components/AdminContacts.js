import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../lib/ToastContext'

export default function AdminContacts() {
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(false)
    const { addToast } = useToast()

    useEffect(() => {
        fetchContacts()
    }, [fetchContacts])

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

    const CopyIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    )

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span>👥</span> Prospectos / Contactos
                </h1>
                <button
                    onClick={fetchContacts}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    title="Actualizar lista"
                >
                    🔄
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
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
                                                    <CopyIcon />
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-500">Nac: {c.birthDate || c.birthYear || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1 group">
                                                <span>📱</span>
                                                <a href={`https://wa.me/52${c.phone}`} target="_blank" className="hover:text-green-600 hover:underline">{c.phone}</a>
                                                <button onClick={() => handleCopy(c.phone, 'Teléfono')} className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Copiar teléfono">
                                                    <CopyIcon />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 group">
                                                <span>✉️</span>
                                                <a href={`mailto:${c.email}`} className="hover:text-blue-600 hover:underline">{c.email}</a>
                                                <button onClick={() => handleCopy(c.email, 'Email')} className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Copiar email">
                                                    <CopyIcon />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate group relative cursor-help">
                                            <span title={c.address}>{c.address}</span>
                                            <button onClick={() => handleCopy(c.address, 'Domicilio')} className="ml-2 text-gray-300 hover:text-blue-500 absolute right-0 top-1/2 -translate-y-1/2 bg-white px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CopyIcon />
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
                                                    📋 <span className="text-xs font-bold ml-1 hidden lg:inline">Copiar Ficha</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteContact(c._id)}
                                                    className="text-red-400 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
