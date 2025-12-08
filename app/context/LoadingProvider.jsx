'use client';
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import { LoadingContext } from "./LoadingContext";

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      {mounted &&
        ReactDOM.createPortal(
          <LoadingOverlay visible={loading} />,
          document.body
        )}
    </LoadingContext.Provider>
  );
};
