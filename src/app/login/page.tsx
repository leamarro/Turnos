"use client";

import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { password });
      if (res.status === 200) window.location.href = "/";
    } catch {
      setError("Contraseña incorrecta");
    }
  }

  return (
    <div className="min-h-[100dvh] flex">

      {/* Imagen / background */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: "url('/makeup-bg.jpg')",
        }}
      />

      {/* Mobile background */}
      <div
        className="lg:hidden absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/makeup-bg.jpg')",
        }}
      />

      {/* Overlay mobile */}
      <div className="lg:hidden absolute inset-0 bg-white/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-8 w-full max-w-sm">

          <h1 className="text-2xl font-semibold text-center mb-2">
            Acceso Admin
          </h1>

          <p className="text-center text-sm text-gray-500 mb-6">
            Panel de gestión
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-black text-white font-medium hover:opacity-90 transition"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
