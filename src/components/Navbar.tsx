"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <nav
        className="w-full fixed top-0 left-0 z-50 shadow-sm"
        style={{ backgroundColor: "#F5F3EE" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center h-12 sm:h-14">
            <Image
              src="/logo.png"
              alt="Beat Makeup Logo"
              width={110}
              height={110}
              className="object-contain max-h-full"
              priority
            />
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
            <Link href="/appointment">Reservar Turno</Link>
            <Link href="/admin">Panel Admin</Link>
            <Link href="/dashboard">Dashboard</Link> 
            <Link href="/precios">Precios</Link>
            <Link href="/login">Login</Link>
          </div>
        </div>
      </nav>

      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        ></div>
      )}

      {/* DRAWER MOBILE */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 z-50 shadow-xl
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ backgroundColor: "#F5F3EE" }}
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center">
            <Image
              src="/logo.png"
              alt="Beat Makeup Logo"
              width={90}
              height={90}
              className="object-contain max-h-full"
            />
          </Link>

          <button onClick={() => setOpen(false)}>
            <X size={26} />
          </button>
        </div>

        {/* LINKS MOBILE */}
        <div className="flex flex-col gap-4 p-4 text-gray-800 text-lg font-medium">
          <Link href="/" onClick={() => setOpen(false)}>Inicio</Link>
          <Link href="/appointment" onClick={() => setOpen(false)}>Reservar Turno</Link>
          <Link href="/admin" onClick={() => setOpen(false)}>Panel Admin</Link>
          <Link href="/dashboard" onClick={() => setOpen(false)}>Estadisticas</Link> {/* ← agregado */}
          <Link href="/precios" onClick={() => setOpen(false)}>Precios</Link>
        </div>
      </div>
    </>
  );
}
