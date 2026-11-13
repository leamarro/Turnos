export function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}
