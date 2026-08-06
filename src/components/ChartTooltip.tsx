"use client";

function formatMonthLabel(label: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(label);
  if (!m) return label;
  const [, y, mo] = m;
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d
    .toLocaleDateString("es-AR", { month: "short", year: "2-digit" })
    .replace(/\.$/, "")
    .toUpperCase();
}

export default function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: {
  active?: boolean;
  payload?: { value?: number | string; name?: string }[];
  label?: string;
  labelFormatter?: (label: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const value = payload[0].value;
  const labelText = label
    ? (labelFormatter ? labelFormatter(label) : label)
    : "";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] px-3 py-2 shadow-lg">
      {labelText && (
        <p className="text-[10px] uppercase tracking-wide text-gray-400">
          {labelText}
        </p>
      )}
      <p className="text-sm font-bold dark:text-white">
        {typeof value === "number"
          ? `$${value.toLocaleString("es-AR")}`
          : value}
      </p>
    </div>
  );
}

export { formatMonthLabel };
