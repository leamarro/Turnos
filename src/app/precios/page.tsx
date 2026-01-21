"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";

export default function PreciosPage() {
  const [prices, setPrices] = useState({
    perfilado: 0,
    maquillaje: 0,
    prueba: 0,
  });

  // Cargar precios
  useEffect(() => {
    async function loadPrices() {
      const res = await axios.get("/api/services/prices");
      const data = res.data;

      setPrices({
        perfilado: data.find((s: any) => s.name === "Perfilado")?.price ?? 0,
        maquillaje: data.find((s: any) => s.name === "Maquillaje")?.price ?? 0,
        prueba:
          data.find((s: any) => s.name === "Prueba maquillaje")?.price ?? 0,
      });
    }

    loadPrices();
  }, []);

  const updatePrice = (field: string, value: string) => {
    setPrices({ ...prices, [field]: Number(value) });
  };

  const savePrices = async () => {
    try {
      await axios.put("/api/services/prices", prices);
      alert("Precios actualizados correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al guardar precios");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 pt-20 pb-16">

        <h1 className="text-2xl font-semibold mb-8 text-center">
          Precios
        </h1>

        <div className="bg-white rounded-2xl shadow p-6 space-y-6">

          {/* PERFILADO */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Perfilado
            </label>
            <input
              type="number"
              value={prices.perfilado}
              onChange={(e) => updatePrice("perfilado", e.target.value)}
              className="w-full text-lg font-medium bg-transparent border-b border-gray-300 focus:border-black focus:outline-none py-1"
            />
          </div>

          {/* MAQUILLAJE */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Maquillaje
            </label>
            <input
              type="number"
              value={prices.maquillaje}
              onChange={(e) => updatePrice("maquillaje", e.target.value)}
              className="w-full text-lg font-medium bg-transparent border-b border-gray-300 focus:border-black focus:outline-none py-1"
            />
          </div>

          {/* PRUEBA */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Prueba de maquillaje
            </label>
            <input
              type="number"
              value={prices.prueba}
              onChange={(e) => updatePrice("prueba", e.target.value)}
              className="w-full text-lg font-medium bg-transparent border-b border-gray-300 focus:border-black focus:outline-none py-1"
            />
          </div>

          <button
            onClick={savePrices}
            className="w-full mt-6 bg-black text-white py-3 rounded-xl font-medium"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
