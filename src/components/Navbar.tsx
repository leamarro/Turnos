"use client";

import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { usePathname } from "next/navigation";
import { LogOut, Home, Calendar, Users, BarChart2, Tag } from "lucide-react";

const tabs = [
  { href: "/home", icon: Home, label: "Inicio" },
  { href: "/admin", icon: Calendar, label: "Turnos" },
  { href: "/clients", icon: Users, label: "Clientes" },
  { href: "/dashboard", icon: BarChart2, label: "Dashboard" },
  { href: "/precios", icon: Tag, label: "Precios" },
];

function getPageTitle(pathname: string) {
  if (pathname === "/home") return "Agenda";
  if (pathname.startsWith("/admin")) return "Turnos";
  if (pathname.startsWith("/clients")) return "Clientes";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/precios") return "Precios";
  if (pathname.startsWith("/appointments")) return "Turnos";
  return "";
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

        {/* Mobile: logo + título + logout */}
        <div className="sm:hidden mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/home" className="shrink-0">
            <Image src="/logo.png" alt="Logo" width={44} height={44} priority />
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

        {/* Desktop: nav completa */}
        <div className="hidden sm:flex max-w-6xl mx-auto px-4 h-14 items-center justify-between">
          <Link href="/home">
            <Image src="/logo.png" alt="Logo" width={60} height={60} priority />
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
                {tab.label}
              </Link>
            ))}
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
        <div className="flex items-stretch justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-opacity active:opacity-50"
              >
                <Icon
                  size={21}
                  className={active ? "text-black" : "text-gray-400"}
                  strokeWidth={active ? 2.2 : 1.7}
                />
                <span
                  className={`text-[10px] leading-none ${
                    active ? "text-black font-semibold" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
