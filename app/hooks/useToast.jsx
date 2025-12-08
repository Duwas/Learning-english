'use client';
import { useContext } from "react";
import { ToastContextInstance } from "../context/ToastContext";

export const useToast = () => {
  const context = useContext(ToastContextInstance);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
