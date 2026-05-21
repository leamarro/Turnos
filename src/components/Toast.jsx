"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  type: string;
}

interface ToastContextValue {
  toast: (message: string, type?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type = "info") => {
    const id = nextId++;
    setItems((prev) => prev.concat([{ id, message, type }]));
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  function dismiss(id: number) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  const colorMap: Record<string, { icon: JSX.Element; border: string; bg: string }> = {
    success: {
      icon: <CheckCircle2 size={16} className="text-green-500" />,
      border: "border-green-200 dark:border-green-800",
      bg: "bg-green-50 dark:bg-green-950",
    },
    error: {
      icon: <AlertCircle size={16} className="text-red-500" />,
      border: "border-red-200 dark:border-red-800",
      bg: "bg-red-50 dark:bg-red-950",
    },
    info: {
      icon: <Info size={16} className="text-blue-500" />,
      border: "border-blue-200 dark:border-blue-800",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
        {items.map((item) => {
          const c = colorMap[item.type] || colorMap.info;
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-fade-up ${c.bg} ${c.border} text-gray-900 dark:text-gray-100`}
            >
              {c.icon}
              <span className="flex-1">{item.message}</span>
              <button onClick={() => dismiss(item.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
