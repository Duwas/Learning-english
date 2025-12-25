import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "./bootstrap-client";
import "./css/main-menu.css";

import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "./context/LoadingProvider";
import { AuthDialogProvider } from "./context/AuthDialogProvider";
import { AuthProvider } from "@/app/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AuthDialogProvider>
            <ToastProvider>
              <LoadingProvider>
                <AntdRegistry>
                  <BootstrapClient />
                  {children}
                </AntdRegistry>
              </LoadingProvider>
            </ToastProvider>
          </AuthDialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
