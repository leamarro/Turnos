import { NextResponse } from 'next/server'

export async function POST() {
  // Simula login exitoso, setea cookie "token"
  const response = NextResponse.json({ success: true })
  response.cookies.set('token', 'fake-token', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 día
  })
  return response
}
