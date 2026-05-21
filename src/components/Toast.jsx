"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext({ toast: function (_msg, _type) {} });

export function useToast() {
  return useContext(ToastContext);
}

var nextId = 0;

export function ToastProvider(props) {
  var children = props.children;
  var _useState = useState([]);
  var items = _useState[0];
  var setItems = _useState[1];

  var toast = useCallback(function (message, type) {
    if (type === undefined) type = "info";
    var id = nextId++;
    setItems(function (prev) {
      return prev.concat([{ id: id, message: message, type: type }]);
    });
    setTimeout(function () {
      setItems(function (prev) {
        return prev.filter(function (t) {
          return t.id !== id;
        });
      });
    }, 3000);
  }, []);

  function dismiss(id) {
    setItems(function (prev) {
      return prev.filter(function (t) {
        return t.id !== id;
      });
    });
  }

  var iconMap = {
    success: (
      <CheckCircle2 size={16} className="text-green-500" />
    ),
    error: (
      <AlertCircle size={16} className="text-red-500" />
    ),
    info: (
      <Info size={16} className="text-blue-500" />
    ),
  };

  var borderMap = {
    success: "border-green-200 dark:border-green-800",
    error: "border-red-200 dark:border-red-800",
    info: "border-blue-200 dark:border-blue-800",
  };

  var bgMap = {
    success: "bg-green-50 dark:bg-green-950",
    error: "bg-red-50 dark:bg-red-950",
    info: "bg-blue-50 dark:bg-blue-950",
  };

  return (
    <ToastContext.Provider value={{ toast: toast }}>
      {children}
      <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
        {items.map(function (item) {
          var c = bgMap[item.type] || bgMap.info;
          var b = borderMap[item.type] || borderMap.info;
          var icon = iconMap[item.type] || iconMap.info;
          return (
            <div
              key={item.id}
              className={
                "pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-fade-up " +
                c +
                " " +
                b +
                " text-gray-900 dark:text-gray-100"
              }
            >
              {icon}
              <span className="flex-1">{item.message}</span>
              <button
                onClick={function () {
                  dismiss(item.id);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
