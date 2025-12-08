'use client';
import { createContext, useRef } from "react";
import { Toast } from "primereact/toast";
import "../globals.css";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toast = useRef(null);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
            <Toast position="top-right" className="custom-toast"  ref={toast} />

    </ToastContext.Provider>
  );
};

export const ToastContextInstance = ToastContext;