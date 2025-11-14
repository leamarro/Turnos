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
      if (res.status === 200) {
        window.location.href = "/";
      }
    } catch {
      setError("Contraseña incorrecta");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Acceso Admin</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border rounded-lg p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
