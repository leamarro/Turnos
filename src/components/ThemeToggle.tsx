"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next ? "#1a1a1a" : "#ffffff");
  }

  return (
    <button
      onClick={toggle}
      className="shrink-0 p-2 text-gray-500 active:text-black dark:text-gray-400 dark:active:text-white transition"
      aria-label={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
