"use client";

import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Home,
  Calendar,
  Users,
  BarChart2,
  Plus,
  CircleDollarSign,
  Sparkles,
} from "lucide-react";

const tabs = [
  { href: "/home", icon: Home, label: "Inicio" },
  { href: "/admin", icon: Calendar, label: "Turnos" },
  { href: "/clients", icon: Users, label: "Clientes" },
  { href: "/dashboard", icon: BarChart2, label: "Stats" },
  { href: "/services", icon: Sparkles, label: "Servicios" },
  { href: "/precios", icon: CircleDollarSign, label: "Precios" },
];

function getPageTitle(pathname: string) {
  if (pathname === "/home") return "Agenda";
  if (pathname.startsWith("/admin")) return "Turnos";
  if (pathname.startsWith("/clients")) return "Clientes";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/services")) return "Servicios";
  if (pathname === "/precios") return "Precios";
  if (pathname.startsWith("/appointments")) return "Nuevo turno";
  return "";
}

function NavTab({
  tab,
  pathname,
}: {
  tab: (typeof tabs)[number];
  pathname: string;
}) {
  const Icon = tab.icon;
  const active = pathname.startsWith(tab.href);

  return (
    <Link
      href={tab.href}
      className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-opacity active:opacity-50"
    >
      <Icon
        size={20}
        className={active ? "text-black" : "text-gray-400"}
        strokeWidth={active ? 2.2 : 1.7}
      />

      <span
        className={`text-[9px] leading-none ${
          active ? "text-black font-semibold" : "text-gray-400"
        }`}
      >
        {tab.label}
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  async function handleLogout() {
    await axios.post("/api/logout");
    window.location.href = "/login";
  }

  return (
    <>
      {/* ===== TOP HEADER ===== */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#F5F3EE]/95 backdrop-blur border-b border-gray-200">
        {/* Mobile */}
        <div className="sm:hidden mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/home" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={44}
              height={44}
              priority
            />
          </Link>

          {title && (
            <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium pointer-events-none">
              {title}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="shrink-0 p-2 -mr-2 text-gray-500 active:text-black transition"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex max-w-6xl mx-auto px-4 h-14 items-center justify-between">
          <Link href="/home">
            <Image
              src="/logo.png"
              alt="Logo"
              width={60}
              height={60}
              priority
            />
          </Link>

          <nav className="flex items-center gap-6">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-sm transition ${
                  pathname.startsWith(tab.href)
                    ? "text-black font-medium"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {tab.label === "Stats" ? "Dashboard" : tab.label}
              </Link>
            ))}

            <Link
              href="/appointments"
              className={`text-sm transition ${
                pathname.startsWith("/appointments")
                  ? "text-black font-medium"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Nuevo turno
            </Link>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition"
          >
            <LogOut size={15} />
            Salir
          </button>
        </div>
      </header>

      {/* ===== BOTTOM TAB BAR (solo mobile) ===== */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 w-full z-50 bg-[#F5F3EE]/95 backdrop-blur border-t border-gray-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="relative flex items-stretch justify-around h-16">
          {/* Tabs izquierda */}
          <div className="flex flex-1">
            {tabs.slice(0, 3).map((tab) => (
              <NavTab key={tab.href} tab={tab} pathname={pathname} />
            ))}
          </div>

          {/* Espacio central para el botón */}
          <div className="w-16 shrink-0" />

          {/* Tabs derecha */}
          <div className="flex flex-1">
            {tabs.slice(3).map((tab) => (
              <NavTab key={tab.href} tab={tab} pathname={pathname} />
            ))}
          </div>

          {/* FAB central */}
          <Link
            href="/appointments"
            className="absolute left-1/2 -translate-x-1/2 -top-5 z-10 active:scale-95 transition-transform"
          >
            <div className="bg-black rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-4 border-[#F5F3EE]">
              <Plus
                size={24}
                className="text-white"
                strokeWidth={2.7}
              />
            </div>
          </Link>
        </div>
      </nav>
    </>
  );
}
