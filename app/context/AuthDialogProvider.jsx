'use client';
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { AuthDialogContext } from "./AuthDialogContext";
import { useRouter } from "next/navigation";

export const AuthDialogProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState("expired"); 
  const router = useRouter();

  const showDialog = (dialogType = "expired") => {
    setType(dialogType);
    setVisible(true);
  };

  const hideDialog = () => setVisible(false);

  const handleLogin = () => {
    hideDialog();
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    router.replace("/auth/login");
  };

  return (
    <AuthDialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}

      <Dialog
        header={
          <div className="text-center">
            {type === "expired"
              ? "Phiên đăng nhập đã hết hạn"
              : "Yêu cầu đăng nhập"}
          </div>
        }
        visible={visible}
        onHide={hideDialog}
      >
        {type === "expired" ? (
          <p>
            Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp
            tục sử dụng hệ thống.
          </p>
        ) : (
          <p>Bạn cần đăng nhập để thực hiện thao tác này.</p>
        )}
        <div className="flex justify-content-center">
          <Button
            label="Đăng nhập"
            icon="pi pi-sign-in"
            onClick={handleLogin}
          />
        </div>
      </Dialog>
    </AuthDialogContext.Provider>
  );
};
