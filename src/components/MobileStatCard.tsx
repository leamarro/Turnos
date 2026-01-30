"use client";

export default function MobileStatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
