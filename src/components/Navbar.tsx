"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Barber App
          </Link>

          {/* BOTÓN HAMBURGUESA MOBILE */}
          <button
            onClick={() => setOpen(true)}
            className="sm:hidden text-gray-800"
          >
            <Menu size={28} />
          </button>

          {/* LINKS DESKTOP */}
          <div className="hidden sm:flex gap-6 text-gray-700 font-medium">
            <Link href="/">Inicio</Link>
                      <Link href="/appointment">
            Reservar Turno
          </Link>
            <Link href="/admin">Panel Admin</Link>
            <Link href="/precios">Precios</Link>
            <Link href="/login">Login</Link>
          </div>
        </div>
      </nav>

      {/* BACKDROP SOLO A LA DERECHA */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        ></div>
      )}

      {/* DRAWER IZQUIERDO LATERAL SIN OCUPAR TODO EL ANCHO */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER DRAWER */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button onClick={() => setOpen(false)}>
            <X size={26} />
          </button>
        </div>

        {/* LINKS MOBILE */}
        <div className="flex flex-col gap-4 p-4 text-gray-800 text-lg font-medium">
          <Link href="/" onClick={() => setOpen(false)}>
            Inicio
          </Link>
          <Link href="/appointment" onClick={() => setOpen(false)}>
            Reservar Turno
          </Link>
          <Link href="/admin" onClick={() => setOpen(false)}>
            Panel Admin
          </Link>
          <Link href="/precios" onClick={() => setOpen(false)}>
            Precios
          </Link>
          <Link href="/login" onClick={() => setOpen(false)}>
            Login
          </Link>
        </div>
      </div>
    </>
  );
}
