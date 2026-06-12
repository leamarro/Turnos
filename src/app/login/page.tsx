"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/login", { password });
      const nextPath = searchParams.get("next");
      window.location.href =
        nextPath?.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/home";
    } catch {
      setError("Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/makeup-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6 animate-in fade-in duration-500"
      >
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={80} height={80} priority />
          <h1 className="text-xl font-semibold">Acceso Admin</h1>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Contraseña
          </label>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-lg bg-transparent border-b border-gray-300 focus:border-black focus:outline-none py-2"
          />
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition inline-flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
