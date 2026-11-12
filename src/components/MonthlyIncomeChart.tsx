"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type MonthEntry = { month: string; total: number };

const money = (n: number) =>
  `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

function monthShort(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1)
    .toLocaleDateString("es-AR", { month: "short" })
    .replace(/\.$/, "")
    .slice(0, 3)
    .replace(/^./, (c) => c.toUpperCase());
}

function monthLong(key: string) {
  const [year, month] = key.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function MonthlyIncomeChart({
  selectedYear,
  selectedMonth,
  onSelectYear,
  onSelectMonth,
}: {
  selectedYear: number;
  selectedMonth: string | null;
  onSelectYear: (year: number) => void;
  onSelectMonth: (month: string | null) => void;
}) {
  const [data, setData] = useState<MonthEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/stats/monthly-income", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (active) setData(Array.isArray(json) ? json : []);
      })
      .catch(() => {
        if (active) setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const years = useMemo(() => {
    const set = new Set<number>(
      data.map((d) => Number(d.month.slice(0, 4)))
    );
    set.add(new Date().getFullYear());
    return [...set].filter(Number.isFinite).sort((a, b) => b - a);
  }, [data]);

  const months = useMemo(() => {
    const now = new Date();
    const last = selectedYear === now.getFullYear() ? now.getMonth() : 11;
    const totals = new Map(
      data
        .filter((d) => d.month.startsWith(`${selectedYear}-`))
        .map((d) => [d.month, d.total])
    );

    return Array.from({ length: last + 1 }, (_, i) => {
      const key = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
      return {
        key,
        label: monthShort(selectedYear, i),
        total: totals.get(key) ?? 0,
        isCurrent:
          selectedYear === now.getFullYear() && i === now.getMonth(),
      };
    });
  }, [data, selectedYear]);

  const max = Math.max(...months.map((m) => m.total), 1);
  const yearTotal = months.reduce((sum, m) => sum + m.total, 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#252525] p-4 sm:p-5 rounded-2xl shadow-sm dark:border dark:border-gray-800 w-full animate-pulse">
        <div className="h-5 w-32 bg-gray-100 dark:bg-white/10 rounded" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-7 bg-gray-100 dark:bg-white/5 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#252525] p-4 sm:p-5 rounded-2xl shadow-sm dark:border dark:border-gray-800 w-full">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold dark:text-white">
            Ingresos por mes
          </h2>
          <p className="text-xs text-gray-400 truncate">
            {selectedMonth
              ? monthLong(selectedMonth)
              : `Total ${selectedYear}: ${money(yearTotal)}`}
          </p>
        </div>

        <div className="relative shrink-0">
          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(Number(e.target.value))}
            aria-label="Elegir año"
            className="appearance-none w-auto border-0 bg-gray-100 dark:bg-[#333] rounded-full pl-3 pr-7 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:ring-0 focus:shadow-none"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mb-3">
        {selectedMonth
          ? "Tocá el mes de nuevo para ver todo el año"
          : "Tocá un mes para filtrar ingresos por servicio"}
      </p>

      {yearTotal === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sin ingresos en {selectedYear}
          </p>
          {years.length > 1 && (
            <button
              type="button"
              onClick={() =>
                onSelectYear(
                  years.find((year) => year !== selectedYear) ?? selectedYear
                )
              }
              className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              Ver {years.find((year) => year !== selectedYear)}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          {months.map((month) => {
            const isSelected = selectedMonth === month.key;
            const width =
              month.total > 0
                ? Math.max((month.total / max) * 100, 2)
                : 0;

            return (
              <button
                type="button"
                key={month.key}
                onClick={() =>
                  onSelectMonth(isSelected ? null : month.key)
                }
                aria-pressed={isSelected}
                className={`w-full min-h-9 flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition active:scale-[0.99] ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : "active:bg-gray-50 dark:active:bg-white/5"
                }`}
              >
                <span
                  className={`w-8 shrink-0 text-[10px] uppercase tracking-wide ${
                    isSelected
                      ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                      : month.isCurrent
                        ? "text-gray-800 dark:text-gray-200 font-semibold"
                        : "text-gray-400"
                  }`}
                >
                  {month.label}
                </span>

                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSelected
                        ? "bg-emerald-500"
                        : month.isCurrent
                          ? "bg-black dark:bg-white"
                          : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>

                <span
                  className={`w-16 shrink-0 text-right text-[11px] tabular-nums ${
                    month.total === 0
                      ? "text-gray-300 dark:text-gray-600"
                      : isSelected
                        ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "text-gray-600 dark:text-gray-300 font-medium"
                  }`}
                >
                  {month.total === 0 ? "—" : money(month.total)}
                </span>

                <Check
                  size={12}
                  className={`shrink-0 ${
                    isSelected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
