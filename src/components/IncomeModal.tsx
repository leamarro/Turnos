"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X } from "lucide-react";

type Appointment = {
  date: string;
  service: { name: string; price?: number } | null;
  servicePrice?: number | null;
};

const money = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

export default function IncomeModal({
  appointments,
  open,
  onClose,
}: {
  appointments: Appointment[];
  open: boolean;
  onClose: () => void;
}) {
  const breakdown = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();

    appointments.forEach((a) => {
      const name = a.service?.name ?? "Sin servicio";
      const price = a.service?.price ?? a.servicePrice ?? 0;
      const entry = map.get(name) ?? { count: 0, total: 0 };
      entry.count++;
      entry.total += price;
      map.set(name, entry);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [appointments]);

  const grandTotal = breakdown.reduce((s, d) => s + d.total, 0);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#252525] rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 pb-8 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold dark:text-white">
            Ingresos del mes
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {breakdown.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Sin datos este mes
          </p>
        ) : (
          <div className="space-y-3">
            {breakdown.map((item) => {
              const pct =
                grandTotal > 0
                  ? ((item.total / grandTotal) * 100).toFixed(0)
                  : "0";
              return (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium dark:text-gray-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        ×{item.count}
                      </span>
                    </div>
                    <span className="text-sm font-semibold dark:text-white shrink-0 ml-3">
                      {money(item.total)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-white rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold dark:text-gray-200">
                  Total
                </span>
                <span className="text-base font-bold dark:text-white">
                  {money(grandTotal)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(), "MMMM yyyy", { locale: es })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
