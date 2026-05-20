"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Save } from "lucide-react";

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  color: string;
};

const DEFAULT_COLORS = [
  "#E8A87C", "#D495A7", "#9FB4C7", "#A8C9A5", "#F4D58D",
  "#C7B8EA", "#F0A1A1", "#7EC8E3", "#E2B4BD", "#B8D4E3",
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", duration: "", color: "" });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", price: "", duration: "", color: "#000000" });

  const loadServices = async () => {
    try {
      const res = await axios.get("/api/services");
      setServices(res.data);
    } catch {
      console.error("Error loading services");
    }
  };

  useEffect(() => { loadServices(); }, []);

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, price: String(s.price), duration: String(s.duration), color: s.color });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await axios.put(`/api/services/${id}`, {
        name: editForm.name,
        price: Number(editForm.price),
        duration: Number(editForm.duration),
        color: editForm.color,
      });
      setEditingId(null);
      loadServices();
    } catch {
      alert("Error al guardar");
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await axios.delete(`/api/services/${id}`);
      loadServices();
    } catch {
      alert("Error al eliminar");
    }
  };

  const createService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.price || !newForm.duration) return;
    try {
      await axios.post("/api/services", {
        name: newForm.name,
        price: Number(newForm.price),
        duration: Number(newForm.duration),
        color: newForm.color,
      });
      setNewForm({ name: "", price: "", duration: "", color: "#000000" });
      setShowNew(false);
      loadServices();
    } catch {
      alert("Error al crear servicio");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Servicios</h1>
          <button
            onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-1.5 bg-black text-white text-sm px-4 py-2 rounded-xl font-medium"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>

        {/* Nuevo servicio */}
        {showNew && (
          <form onSubmit={createService} className="bg-white rounded-2xl shadow p-5 mb-6 space-y-4">
            <h2 className="font-medium text-sm text-gray-500">Nuevo servicio</h2>
            <input
              placeholder="Nombre"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              required
            />
            <div className="flex gap-3">
              <input
                placeholder="Precio"
                type="number"
                value={newForm.price}
                onChange={(e) => setNewForm({ ...newForm, price: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                required
              />
              <input
                placeholder="Duración (min)"
                type="number"
                value={newForm.duration}
                onChange={(e) => setNewForm({ ...newForm, duration: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewForm({ ...newForm, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition ${newForm.color === c ? "border-black scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={newForm.color}
                  onChange={(e) => setNewForm({ ...newForm, color: e.target.value })}
                  className="w-7 h-7 rounded-full border-0 cursor-pointer"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium">
              Crear servicio
            </button>
          </form>
        )}

        {/* Lista de servicios */}
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4">
              {editingId === s.id ? (
                <div className="space-y-3">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"
                    placeholder="Nombre"
                  />
                  <div className="flex gap-3">
                    <input
                      value={editForm.price}
                      type="number"
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder="Precio"
                    />
                    <input
                      value={editForm.duration}
                      type="number"
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder="Duración (min)"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, color: c })}
                        className={`w-7 h-7 rounded-full border-2 transition ${editForm.color === c ? "border-black scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-7 h-7 rounded-full border-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(s.id)} className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5">
                      <Save size={14} /> Guardar
                    </button>
                    <button onClick={cancelEdit} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 border border-gray-200 cursor-pointer"
                    style={{ backgroundColor: s.color }}
                    onClick={() => startEdit(s)}
                  />
                  <div className="flex-1 min-w-0" onClick={() => startEdit(s)}>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      ${s.price.toLocaleString()} · {s.duration} min
                    </p>
                  </div>
                  <button
                    onClick={() => deleteService(s.id)}
                    className="p-2 text-gray-300 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {services.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No hay servicios creados</p>
          )}
        </div>
      </div>
    </div>
  );
}
