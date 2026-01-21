"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/login", { password });
      window.location.href = "/home";
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
      {/* overlay suave */}
      <div className="absolute inset-0 bg-black/30" />

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6"
      >
        <h1 className="text-2xl font-semibold text-center">
          Acceso Admin
        </h1>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-lg bg-transparent border-b border-gray-300 focus:border-black focus:outline-none py-2"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-medium disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
