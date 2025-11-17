import { NextResponse } from 'next/server'

export async function POST() {
  // Borra la cookie de sesión
  const response = NextResponse.json({ success: true })
  response.cookies.set('token', '', { path: '/', maxAge: 0 })
  return response
}
