export const dynamic = "force-dynamic";

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewServicePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await fetch("/api/services", {
      method: "POST",
      body: JSON.stringify({
        name,
        price: Number(price),
      }),
    });

    router.push("/services");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Nuevo Servicio</h1>

      <form onSubmit={submit} className="space-y-4">
        <input
          placeholder="Nombre"
          className="w-full border p-3 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Precio"
          type="number"
          className="w-full border p-3 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
          Crear
        </button>
      </form>
    </div>
  );
}
