"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="));
    if (match) {
      setUsername(match.split("=")[1]);
    }
  }, []);

  async function handleLogout() {
    await axios.post("/api/logout");
    window.location.href = "/login";
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#F5F3EE] shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/home">
            <Image src="/logo.png" alt="Logo" width={90} height={90} />
          </Link>

          <button className="sm:hidden" onClick={() => setOpen(true)}>
            <Menu size={28} />
          </button>

          <div className="hidden sm:flex gap-6 items-center">
            <Link href="/home">Inicio</Link>
            <Link href="/appointments">Reservar Turno</Link>

            <Link href="/clients">Clientes</Link>
            <Link href="/admin">Panel Admin</Link>

            <Link href="/dashboard">Dashboard</Link>
            <Link href="/precios">Precios</Link>

            {username && (
              <span className="text-sm text-gray-600">
                👋 {username}
              </span>
            )}

            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#F5F3EE] z-50 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between p-4 border-b">
          <span className="font-bold">{username}</span>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-4">
          <Link href="/home" onClick={() => setOpen(false)}>Inicio</Link>
          <Link href="/appointments" onClick={() => setOpen(false)}>Reservar Turno</Link>
          
          <Link href="/clients" onClick={() => setOpen(false)}>Clientes</Link>
          <Link href="/admin" onClick={() => setOpen(false)}>Panel Admin</Link>

          
          <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/precios" onClick={() => setOpen(false)}>Precios</Link>

          <button
            onClick={handleLogout}
            className="text-red-600 text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
