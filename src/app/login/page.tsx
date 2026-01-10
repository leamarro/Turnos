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
    <div className="min-h-screen flex items-center justify-center bg-gray-100" style={{ backgroundImage: "url('/makeup-bg.jpg')" }}>
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Acceso Admin</h1>

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
