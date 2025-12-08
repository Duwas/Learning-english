'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapClient from "./bootstrap-client";
import './css/main-menu.css'; 
import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "@/app/context/LoadingProvider";
import { AuthDialogProvider } from "@/app/context/AuthDialogProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ServerWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthDialogProvider>
      <ToastProvider>
        <LoadingProvider>
          <AntdRegistry>
            <BootstrapClient />
            <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
              {children}
            </div>
          </AntdRegistry>
        </LoadingProvider>
      </ToastProvider>
    </AuthDialogProvider>
  );
}