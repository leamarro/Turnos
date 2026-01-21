"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Menu, X, LogOut } from "lucide-react";

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

  const NavLink = ({
    href,
    children,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm text-gray-700 hover:text-black transition"
    >
      {children}
    </Link>
  );

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#F5F3EE]/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/home" className="flex items-center">
            <Image src="/logo.png" alt="Logo" width={70} height={70} priority />
          </Link>

          {/* DESKTOP */}
          <div className="hidden sm:flex items-center gap-6">
            <NavLink href="/home">Inicio</NavLink>
            <NavLink href="/appointments">Reservar</NavLink>
            <NavLink href="/clients">Clientes</NavLink>
            <NavLink href="/admin">Admin</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/precios">Precios</NavLink>

            {username && (
              <span className="text-xs text-gray-500">
                {username}
              </span>
            )}

            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 transition"
            >
              Cerrar sesión
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="sm:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* ================= OVERLAY ================= */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ================= MOBILE DRAWER ================= */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#F5F3EE] z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <span className="text-sm font-medium">
            {username ?? "Menú"}
          </span>
          <button onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-4 px-4 py-6">
          <NavLink href="/home" onClick={() => setOpen(false)}>
            Inicio
          </NavLink>
          <NavLink href="/appointments" onClick={() => setOpen(false)}>
            Reservar turno
          </NavLink>
          <NavLink href="/clients" onClick={() => setOpen(false)}>
            Clientes
          </NavLink>
          <NavLink href="/admin" onClick={() => setOpen(false)}>
            Panel admin
          </NavLink>
          <NavLink href="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink href="/precios" onClick={() => setOpen(false)}>
            Precios
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 mt-4"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </nav>
      </aside>
    </>
  );
}
