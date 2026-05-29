"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/components/Toast";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Config = {
  id: string;
  type: string;
  enabled: boolean;
  template: string;
  workDays: string;
  hoursBefore: number;
  sendTime: string;
};

const PLACEHOLDERS: Record<string, string[]> = {
  hoy: ["{titulo}", "{listado}", "{total}"],
  manana: ["{titulo}", "{listado}", "{total}"],
  reminder: ["{titulo}", "{nombre}", "{hora}", "{servicio}"],
};

const LABELS: Record<string, string> = {
  hoy: "Turnos de hoy",
  manana: "Turnos de mañana",
  reminder: "Recordatorios 2hs antes",
};

const DAYS = [
  { value: "0", label: "Dom" },
  { value: "1", label: "Lun" },
  { value: "2", label: "Mar" },
  { value: "3", label: "Mié" },
  { value: "4", label: "Jue" },
  { value: "5", label: "Vie" },
  { value: "6", label: "Sáb" },
];

export default function NotificacionesPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    axios.get("/api/notification-config").then((res) => setConfigs(res.data));
  }, []);

  function update(type: string, field: string, value: any) {
    setConfigs((prev) =>
      prev.map((c) => (c.type === type ? { ...c, [field]: value } : c)),
    );
  }

  async function handleSave(type: string) {
    setSaving(type);
    try {
      const config = configs.find((c) => c.type === type);
      await axios.put("/api/notification-config", {
        type,
        enabled: config?.enabled,
        template: config?.template,
        workDays: config?.workDays,
        hoursBefore: config?.hoursBefore,
        sendTime: config?.sendTime,
      });
      toast("Guardado ✅");
    } catch {
      toast("Error al guardar ❌");
    } finally {
      setSaving(null);
    }
  }

  function toggleDay(type: string, day: string) {
    const config = configs.find((c) => c.type === type);
    if (!config) return;
    const days = config.workDays.split(",").filter(Boolean);
    const idx = days.indexOf(day);
    if (idx >= 0) days.splice(idx, 1);
    else days.push(day);
    update(type, "workDays", days.sort().join(","));
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] dark:bg-[#1a1a1a]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black dark:hover:text-white mb-4"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>

        <h1 className="text-xl font-semibold mb-6 dark:text-white">
          Configurar notificaciones
        </h1>

        <div className="space-y-4">
          {configs.map((config) => (
            <div
              key={config.type}
              className="bg-white dark:bg-[#252525] rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium dark:text-white">
                  {LABELS[config.type]}
                </h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) =>
                      update(config.type, "enabled", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white dark:bg-gray-600" />
                </label>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Días de envío
                </label>
                <div className="flex gap-1 mt-1">
                  {DAYS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => toggleDay(config.type, d.value)}
                      className={`w-9 h-9 rounded-full text-xs font-medium transition ${
                        config.workDays.split(",").includes(d.value)
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {config.type === "reminder" && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Enviar antes del turno
                  </label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map((h) => (
                      <button
                        key={h}
                        onClick={() => update(config.type, "hoursBefore", h)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          config.hoursBefore === h
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {h} {h === 1 ? "hora" : "horas"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {config.type !== "reminder" && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Hora de envío
                  </label>
                  <input
                    type="time"
                    value={config.sendTime}
                    onChange={(e) =>
                      update(config.type, "sendTime", e.target.value)
                    }
                    className="mt-1 px-3 py-1.5 text-sm bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 w-32"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Plantilla del mensaje
                </label>
                <textarea
                  value={config.template}
                  onChange={(e) =>
                    update(config.type, "template", e.target.value)
                  }
                  rows={3}
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {PLACEHOLDERS[config.type]?.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Preview */}
                <div className="mt-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Vista previa
                  </label>
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs whitespace-pre-wrap dark:text-gray-300">
                    {config.template
                      .replace(/\{titulo\}/g, config.type === "reminder" ? "Recordatorio" : config.type === "manana" ? "Turnos de mañana" : "Turnos de hoy")
                      .replace(/\{listado\}/g, "🕐 09:30  Lucía Mendoza (Perfilado)\n🕐 11:00  Carla Ruiz (Maquillaje)\n🕐 15:30  Marina Torres (Perfilado + Maquillaje)")
                      .replace(/\{total\}/g, "3")
                      .replace(/\{nombre\}/g, "Marina Torres")
                      .replace(/\{hora\}/g, "15:30")
                      .replace(/\{servicio\}/g, "Perfilado + Maquillaje")
                      .trim()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSave(config.type)}
                disabled={saving === config.type}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm bg-black text-white dark:bg-white dark:text-black rounded-lg disabled:opacity-50"
              >
                <Save size={14} />
                {saving === config.type ? "Guardando..." : "Guardar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
