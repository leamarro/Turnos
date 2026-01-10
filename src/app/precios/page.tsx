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

  // Cargar precios desde la base
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

  // Actualizar valor
  const updatePrice = (field: string, value: string) => {
    setPrices({ ...prices, [field]: Number(value) });
  };

  // Guardar cambios
  const savePrices = async () => {
    try {
      await axios.put("/api/services/prices", {
        perfilado: prices.perfilado,
        maquillaje: prices.maquillaje,
        prueba: prices.prueba,
      });

      alert("Precios actualizados correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al guardar precios");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-28 px-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Precios</h1>

      <div className="flex flex-col gap-6">

        <div className="p-4 border rounded-xl shadow-sm">
          <label className="font-semibold">Precio Perfilado</label>
          <input
            type="number"
            value={prices.perfilado}
            onChange={(e) => updatePrice("perfilado", e.target.value)}
            className="w-full mt-2 p-2 border rounded"
          />
        </div>

        <div className="p-4 border rounded-xl shadow-sm">
          <label className="font-semibold">Precio Maquillaje</label>
          <input
            type="number"
            value={prices.maquillaje}
            onChange={(e) => updatePrice("maquillaje", e.target.value)}
            className="w-full mt-2 p-2 border rounded"
          />
        </div>

        <div className="p-4 border rounded-xl shadow-sm">
          <label className="font-semibold">Precio Prueba de Maquillaje</label>
          <input
            type="number"
            value={prices.prueba}
            onChange={(e) => updatePrice("prueba", e.target.value)}
            className="w-full mt-2 p-2 border rounded"
          />
        </div>

        <button
          onClick={savePrices}
          className="mt-4 bg-black text-white py-3 rounded-xl hover:bg-gray-900"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
