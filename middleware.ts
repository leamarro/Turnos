import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const PUBLIC_PATHS = [
  '/login',
  '/register', // opcional
  '/_next', // assets de Next.js
  '/favicon.ico',
  '/public',
]

function isPublic(path: string) {
  return (
    PUBLIC_PATHS.some((publicPath) =>
      path === publicPath || path.startsWith(publicPath)
    ) || /\.(css|js|png|jpg|jpeg|svg|ico)$/.test(path)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Simulación de sesión: cookie "token"
  const token = request.cookies.get('token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}