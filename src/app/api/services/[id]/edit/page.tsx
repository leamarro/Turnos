"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface EditServicePageProps {
  params: {
    id: string;
  };
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const { id } = params;
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((list) => {
        const s = list.find((x: any) => x.id === id);
        if (s) {
          setName(s.name);
          setPrice(s.price);
        }
      });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/services/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, price: Number(price) }),
    });
    router.push("/services");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Editar Servicio</h1>

      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full border p-3 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
