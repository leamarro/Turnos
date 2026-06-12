"use client";

import { ReactNode } from "react";

function CalendarIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-28 h-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="22" width="80" height="65" rx="8" />
      <rect x="20" y="22" width="80" height="18" rx="8" />
      <line x1="36" y1="52" x2="84" y2="52" />
      <line x1="36" y1="63" x2="72" y2="63" />
      <line x1="36" y1="74" x2="60" y2="74" />
      <circle cx="46" cy="30" r="1.5" />
      <circle cx="60" cy="30" r="1.5" />
      <circle cx="74" cy="30" r="1.5" />
    </svg>
  );
}

function UsersIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-28 h-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="48" cy="34" r="12" />
      <path d="M26 80c0-12 10-22 22-22s22 10 22 22" />
      <circle cx="84" cy="40" r="10" />
      <path d="M72 80c0-10 8.5-18 19-18 5.5 0 10.5 2.3 14 6" />
    </svg>
  );
}

function SearchIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-28 h-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="52" cy="44" r="18" />
      <line x1="64" y1="56" x2="84" y2="76" />
      <line x1="30" y1="44" x2="38" y2="44" />
      <line x1="52" y1="26" x2="52" y2="32" />
      <line x1="52" y1="56" x2="52" y2="62" />
    </svg>
  );
}

function ClipboardIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-28 h-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="35" y="18" width="50" height="64" rx="6" />
      <rect x="42" y="26" width="36" height="6" rx="2" />
      <line x1="42" y1="40" x2="78" y2="40" />
      <line x1="42" y1="50" x2="66" y2="50" />
      <line x1="42" y1="60" x2="72" y2="60" />
    </svg>
  );
}

type Variant = "appointments" | "clients" | "search" | "client-history";

const illustrations: Record<Variant, { svg: () => ReactNode; defaultTitle: string; defaultSubtitle: string }> = {
  appointments: {
    svg: CalendarIllustration,
    defaultTitle: "Sin turnos",
    defaultSubtitle: "Todavía no agendaste ningún turno",
  },
  clients: {
    svg: UsersIllustration,
    defaultTitle: "Sin clientes",
    defaultSubtitle: "Los clientes aparecen automáticamente al crear turnos",
  },
  search: {
    svg: SearchIllustration,
    defaultTitle: "Sin resultados",
    defaultSubtitle: "Probá con otro término de búsqueda",
  },
  "client-history": {
    svg: ClipboardIllustration,
    defaultTitle: "Sin turnos",
    defaultSubtitle: "Este cliente todavía no tiene turnos registrados",
  },
};

interface EmptyStateProps {
  variant: Variant;
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ variant, title, subtitle, action }: EmptyStateProps) {
  const config = illustrations[variant];
  const Icon = config.svg;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
      <Icon />
      <h3 className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        {title ?? config.defaultTitle}
      </h3>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-center max-w-xs">
        {subtitle ?? config.defaultSubtitle}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-xl active:scale-95 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
