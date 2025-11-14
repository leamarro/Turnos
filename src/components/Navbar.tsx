"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, LogIn, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Barber App
          </Link>

          {/* BOTÓN HAMBURGUESA (MOBILE) */}
          <button
            onClick={() => setOpen(true)}
            className="sm:hidden text-gray-900 hover:opacity-70 transition"
          >
            <Menu size={26} strokeWidth={1.5} />
          </button>

          {/* LINKS DESKTOP */}
          <div className="hidden sm:flex gap-6 text-gray-700 font-medium">
            <Link href="/" className="hover:text-black transition">
              Inicio
            </Link>
            <Link href="/admin" className="hover:text-black transition">
              Panel Admin
            </Link>
            <Link href="/login" className="hover:text-black transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* BACKDROP OSCURO */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        ></div>
      )}

      {/* DRAWER IZQUIERDO */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER DEL DRAWER */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-700 hover:text-black transition"
          >
            <X size={26} strokeWidth={1.5} />
          </button>
        </div>

        {/* LINKS DEL MENÚ */}
        <div className="flex flex-col gap-4 p-5 text-gray-800 text-base font-medium">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 hover:bg-gray-100 p-3 rounded-lg transition"
          >
            <Home size={20} strokeWidth={1.5} />
            Inicio
          </Link>

          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 hover:bg-gray-100 p-3 rounded-lg transition"
          >
            <LayoutDashboard size={20} strokeWidth={1.5} />
            Panel Admin
          </Link>

          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 hover:bg-gray-100 p-3 rounded-lg transition"
          >
            <LogIn size={20} strokeWidth={1.5} />
            Login
          </Link>
        </div>
      </div>
    </>
  );
}
