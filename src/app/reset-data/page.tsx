"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ResetDataPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleReset() {
    if (!confirm("¿Estás SEGURA? Se van a borrar TODOS los turnos, clientes y pagos. Esta acción no tiene vuelta atrás.")) return;

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/admin/reset-data");
      setDone(true);
    } catch {
      setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-2xl font-semibold">Listo</p>
          <p className="text-gray-500">Todos los datos fueron borrados.</p>
          <button
            onClick={() => router.push("/home")}
            className="mt-4 px-6 py-2 bg-black text-white rounded-xl text-sm"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Borrar todos los datos</h1>
          <p className="text-sm text-gray-500 mt-2">
            Se van a eliminar permanentemente todos los turnos, clientes y pagos.
            Los servicios y precios se mantienen.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3 bg-red-600 text-white rounded-xl font-medium disabled:opacity-60"
        >
          {loading ? "Borrando..." : "Borrar todo"}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full py-3 border rounded-xl text-sm text-gray-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
