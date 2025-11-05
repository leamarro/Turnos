"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white text-[var(--color-text)] border-b border-[var(--color-border)] shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Beat<span className="font-light">Makeup</span>
        </h1>

        <button
          className="md:hidden text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            Inicio
          </Link>
          <Link href="/appointment" className="hover:opacity-70 transition-opacity">
            Reservar Turno
          </Link>
          <Link href="/admin" className="hover:opacity-70 transition-opacity">
            Panel Admin
          </Link>
        </nav>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-white text-[var(--color-text)] border-t border-[var(--color-border)] shadow-md space-y-3 p-4 animate-fade-in">
          <Link href="/" className="block hover:opacity-70" onClick={() => setMenuOpen(false)}>
            Inicio
          </Link>
          <Link href="/appointment" className="block hover:opacity-70" onClick={() => setMenuOpen(false)}>
            Reservar Turno
          </Link>
          <Link href="/admin" className="block hover:opacity-70" onClick={() => setMenuOpen(false)}>
            Panel Admin
          </Link>
        </nav>
      )}
    </header>
  );
}
