"use client";

import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { X, ChevronDown, ChevronRight } from "lucide-react";

type Payment = {
  id?: string;
  amount: number;
  method?: string;
  createdAt?: string | Date;
};

type Appointment = {
  id: string;
  date: string;
  name?: string;
  lastName?: string;
  service: { name: string; price?: number } | null;
  servicePrice?: number | null;
  payments?: Payment[];
};

type DetailItem = {
  paymentId: string;
  clientName: string;
  date: Date;
  amount: number;
  isDeposit: boolean;
};

type ServiceEntry = {
  name: string;
  count: number;
  total: number;
  items: DetailItem[];
};

const money = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

export default function IncomeModal({
  appointments,
  open,
  onClose,
  mode = "cobrado",
}: {
  appointments: Appointment[];
  open: boolean;
  onClose: () => void;
  mode?: "cobrado" | "agendado";
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const breakdown = useMemo(() => {
    const now = new Date();
    const monthInterval = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
    const map = new Map<string, ServiceEntry>();

    appointments.forEach((a) => {
      const name = a.service?.name ?? "Sin servicio";

      if (mode === "agendado") {
        const date = new Date(a.date);
        if (!isWithinInterval(date, monthInterval) || date < now) return;
        const total = a.servicePrice ?? a.service?.price ?? 0;
        const paid = a.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
        const remaining = Math.max(total - paid, 0);
        if (remaining <= 0) return;

        const entry = map.get(name) ?? { name, count: 0, total: 0, items: [] };
        entry.count += 1;
        entry.total += remaining;
        entry.items.push({
          paymentId: a.id,
          clientName: `${a.name ?? ""} ${a.lastName ?? ""}`.trim() || "Sin nombre",
          date,
          amount: remaining,
          isDeposit: false,
        });
        map.set(name, entry);
        return;
      }

      for (const payment of a.payments ?? []) {
        const date = new Date(payment.createdAt ?? now);
        if (!isWithinInterval(date, monthInterval)) continue;

        const entry = map.get(name) ?? { name, count: 0, total: 0, items: [] };

        if (!entry.items.some((i) => i.paymentId === payment.id)) {
          entry.count += 1;
          entry.total += payment.amount;
          entry.items.push({
            paymentId: payment.id ?? `${a.id}-${date.getTime()}`,
            clientName: `${a.name ?? ""} ${a.lastName ?? ""}`.trim() || "Sin nombre",
            date,
            amount: payment.amount,
            isDeposit: payment.method !== "full",
          });
        }

        map.set(name, entry);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [appointments, mode]);

  const grandTotal = breakdown.reduce((s, d) => s + d.total, 0);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#252525] rounded-2xl w-full max-w-sm p-5 pb-8 max-h-[70vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold dark:text-white">
            {mode === "agendado" ? "Agendado este mes" : "Cobrado este mes"}
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
            {mode === "agendado"
              ? "Sin turnos pendientes este mes"
              : "Sin datos este mes"}
          </p>
        ) : (
          <div className="space-y-3">
            {breakdown.map((item) => {
              const pct =
                grandTotal > 0
                  ? ((item.total / grandTotal) * 100).toFixed(0)
                  : "0";
              const isExpanded = expanded === item.name;

              return (
                <div key={item.name}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : item.name)}
                    className="w-full text-left"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isExpanded ? (
                          <ChevronDown size={14} className="text-gray-400 shrink-0" />
                        ) : (
                          <ChevronRight size={14} className="text-gray-400 shrink-0" />
                        )}
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
                  </button>

                  {isExpanded && (
                    <div className="mt-2 ml-4 pl-3 border-l border-gray-100 dark:border-gray-800 space-y-1">
                      {item.items.map((it) => (
                        <div
                          key={it.paymentId}
                          className="flex justify-between items-center py-1.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {it.clientName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(it.date, "dd/MM")}
                              {it.isDeposit && (
                                <span className="text-amber-500"> (seña)</span>
                              )}
                            </p>
                          </div>
                          <span className="text-sm font-semibold dark:text-white shrink-0 ml-3">
                            {money(it.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
