import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "BeatMakeup",
  description: "Gestión de turnos de maquillaje y perfilado",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#f5f3ef] text-[#111] font-sans">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto flex justify-between items-center p-4">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Beat<span className="font-light">Makeup</span>
            </Link>

            <nav className="hidden md:flex space-x-6 text-sm font-medium">
              <Link href="/" className="hover:opacity-70">Inicio</Link>
              <Link href="/appointment" className="hover:opacity-70">Reservar Turno</Link>
              <Link href="/admin" className="hover:opacity-70">Panel Admin</Link>
            </nav>

            {/* Menú móvil */}
            <details className="md:hidden relative">
              <summary className="cursor-pointer text-2xl select-none">☰</summary>
              <nav className="absolute right-0 mt-2 bg-white shadow-md rounded-lg p-4 w-40 animate-fade-in space-y-2">
                <Link href="/" className="block" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                  Inicio
                </Link>
                <Link href="/appointment" className="block" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                  Reservar Turno
                </Link>
                <Link href="/admin" className="block" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
                  Panel Admin
                </Link>
              </nav>
            </details>
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}
