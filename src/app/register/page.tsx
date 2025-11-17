"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    // Simula registro y login automático
    const res = await fetch('/api/login', { method: 'POST' })
    if (res.ok) {
      router.push('/')
    } else {
      setError('Error al registrar')
    }
  }

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-xs mx-auto mt-20 p-6 border rounded">
      <h1 className="text-2xl font-bold">Registro</h1>
      <button type="submit" className="bg-green-600 text-white py-2 rounded">Registrarme</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  )
}
