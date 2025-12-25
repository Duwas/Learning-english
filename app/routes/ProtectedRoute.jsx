"use client";

import React, { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Modal, Spin, Button } from "antd";
import {
  StopOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { auth, loading, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!auth) {
      setModal("login");
      return;
    }

    if (auth.status === 2 && pathname !== "/account-locked") {
      setModal("locked");
      return;
    }

    if (auth.status === 0) {
      setModal("inactive");
      return;
    }

    if (requireAdmin && auth.role !== "admin") {
      setModal("forbidden");
      return;
    }

    setModal(null);
  }, [auth, loading, requireAdmin, pathname]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-white"
        style={{ height: "100vh" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // ================= LOGIN =================
  if (modal === "login") {
    return (
      <Modal open centered footer={null} closable={false}>
        <div className="text-center p-3">
          <LockOutlined style={{ fontSize: 32 }} />
          <h4 className="mt-3">Bạn phải đăng nhập trước khi sử dụng dịch vụ</h4>
          <Button
            type="primary"
            className="w-100 mt-3"
            onClick={() => router.push("/auth/login")}
          >
            Đăng nhập <ArrowRightOutlined />
          </Button>
        </div>
      </Modal>
    );
  }

  if (modal === "locked") {
    return (
      <Modal open centered footer={null} closable={false}>
        <div className="text-center p-3">
          <StopOutlined style={{ fontSize: 32, color: "red" }} />
          <h4 className="text-danger mt-3">Tài khoản bị khóa</h4>
          <Button danger onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </Modal>
    );
  }

  if (modal === "inactive") {
    return (
      <Modal open centered footer={null} closable={false}>
        <div className="text-center p-3">
          <MailOutlined style={{ fontSize: 32, color: "#fa8c16" }} />
          <h4 className="mt-3">Tài khoản chưa kích hoạt</h4>
          <Button onClick={logout}>Đăng xuất</Button>
        </div>
      </Modal>
    );
  }

  // ================= FORBIDDEN =================
  if (modal === "forbidden") {
    return (
      <Modal open centered footer={null} closable={false}>
        <div className="text-center p-3">
          <SafetyCertificateOutlined style={{ fontSize: 32 }} />
          <h4 className="mt-3">Không đủ quyền truy cập</h4>
          <Button onClick={() => router.push("/")}>Trang chủ</Button>
        </div>
      </Modal>
    );
  }

  // ================= OK =================
  return <>{children}</>;
};

export default ProtectedRoute;
