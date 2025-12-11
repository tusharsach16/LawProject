import { createContext, useContext, useState, type ReactNode } from "react";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      <div className="fixed top-6 right-6 z-50 space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white min-w-[250px]"
          >
            {t.type === "success" && (
              <CheckCircle className="text-emerald-600" size={20} />
            )}
            {t.type === "error" && (
              <AlertTriangle className="text-red-600" size={20} />
            )}
            {t.type === "info" && <Info className="text-amber-600" size={20} />}

            <p className="text-sm font-medium text-slate-700">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
