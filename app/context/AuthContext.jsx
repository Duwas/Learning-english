"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import api from "@/app/services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // INIT
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (user && token) {
        setAuth(JSON.parse(user));
      }
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // HEARTBEAT
  useEffect(() => {
    if (!auth) return;

    const checkStatus = async () => {
      try {
        const res = await api.get("/auth/all");
        const me = res.data.find((u) => u.id === auth.id);
        if (me && me.status === 2) {
          forceLogout("Tài khoản bị khóa");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          forceLogout("Phiên đăng nhập hết hạn");
        }
      }
    };

    const timer = setInterval(checkStatus, 10000);
    return () => clearInterval(timer);
  }, [auth]);

  const login = (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setAuth(user);
  };

  const logout = () => {
    localStorage.clear();
    setAuth(null);
    router.push("/auth/login");
  };

  const forceLogout = (msg) => {
    localStorage.clear();
    setAuth(null);
    message.error(msg);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ auth, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
