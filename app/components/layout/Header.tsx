"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Avatar } from "antd";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import {
  AudioOutlined,
  ReadOutlined,
  EditOutlined,
  CustomerServiceOutlined,
  TranslationOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import "../../css/main-menu.css";

type MenuItem = Required<MenuProps>["items"][number];

const MainHeader = () => {
  const { Header } = Layout;
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  // --- Scroll Logic ---
  const lastScrollYRef = React.useRef(0);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollYRef.current) setIsHidden(false);
      else if (currentScrollY > lastScrollYRef.current && currentScrollY > 100)
        setIsHidden(true);
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Auth Logic ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    router.push("/");
  };

  // =======================================================
  // 🚀 CẬP NHẬT: HÀM ĐIỀU HƯỚNG SANG DYNAMIC ROUTING
  // =======================================================
  const handleNavigate = (basePath: string, level?: string) => {
    if (level) {
      // Đẩy đến đường dẫn động: /page/User/listening/A1
      router.push(`${basePath}/${level}`);
    } else {
      router.push(basePath);
    }
  };

  // ===== 3. HÀM TẠO ICON CẤP ĐỘ BẰNG AVATAR (GIỮ NGUYÊN) =====
  const renderLevelAvatar = (text: string, color: string) => (
    <Avatar
      style={{
        backgroundColor: color,
        verticalAlign: "middle",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
        width: 36,
        height: 36,
        lineHeight: "36px",
        border: "2px solid rgba(255,255,255,0.8)",
        boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {text}
    </Avatar>
  );

  // ===== 4. HÀM TẠO MENU CON (GIỮ NGUYÊN LOGIC, DÙNG handleNavigate ĐÃ CẬP NHẬT) =====
  const getLevelItems = (basePath: string): MenuItem[] => [
    {
      key: `${basePath}-A1`,
      label: <span className="submenu-text">Trình độ A1</span>,
      icon: renderLevelAvatar("A1", "#52c41a"),
      // Bây giờ sẽ gọi handleNavigate('/page/User/listening', 'A1') -> push('/page/User/listening/A1')
      onClick: () => handleNavigate(basePath, "A1"),
    },
    {
      key: `${basePath}-A2`,
      label: <span className="submenu-text">Trình độ A2</span>,
      icon: renderLevelAvatar("A2", "#1890ff"),
      onClick: () => handleNavigate(basePath, "A2"),
    },
    {
      key: `${basePath}-B1`,
      label: <span className="submenu-text">Trình độ B1</span>,
      icon: renderLevelAvatar("B1", "#faad14"),
      onClick: () => handleNavigate(basePath, "B1"),
    },
  ];

  // ===== 5. CẤU HÌNH MENU ITEMS (GIỮ NGUYÊN) =====
  const items: MenuItem[] = [
    {
      key: "listening",
      label: "Listening",
      icon: <CustomerServiceOutlined style={{ fontSize: "18px" }} />,
      popupClassName: "styled-submenu-popup",
      children: getLevelItems("/User/listen"),
    },
    {
      key: "reading",
      label: "Reading",
      icon: <ReadOutlined style={{ fontSize: "18px" }} />,
      popupClassName: "styled-submenu-popup",
      children: getLevelItems("/User/reading"),
    },
    {
      key: "writing",
      label: "Writing",
      icon: <EditOutlined style={{ fontSize: "18px" }} />,
      popupClassName: "styled-submenu-popup",
      children: getLevelItems("/User/writing"),
    },
    {
      key: "speaking",
      label: "Speaking",
      icon: <AudioOutlined style={{ fontSize: "18px" }} />,
      popupClassName: "styled-submenu-popup",
      children: getLevelItems("/User/speaking"),
    },
    {
      key: "translate",
      label: "Translate",
      icon: <TranslationOutlined style={{ fontSize: "18px" }} />,
      onClick: () => router.push("/User/translate"),
    },
  ];

  const transformStyle = isHidden ? "translateY(-100%)" : "translateY(0)";

  return (
    // =======================================================
    // 🎨 CẤU TRÚC HTML VÀ CSS INLINE (GIỮ NGUYÊN)
    // =======================================================
    <Header
      className={`main-header ${isHidden ? "header-hidden" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: "#001529",
        transform: transformStyle,
        transition: "transform 0.3s ease-out",
        padding: "0 30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div
        className="demo-logo"
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        onClick={() => router.push("/")}
      >
        <img
          src="/img/Logo.png"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            marginRight: 12,
          }}
          alt="Logo"
        />
        <span
          className="text-white fw-bold fs-5"
          style={{ letterSpacing: "1px" }}
        >
          doubleK-Book
        </span>
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        items={items}
        style={{
          flex: 1,
          minWidth: 0,
          justifyContent: "center",
          borderBottom: "none",
          fontSize: "16px",
          fontWeight: 500,
        }}
        triggerSubMenuAction="hover"
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <i
          id="find"
          className="fa-solid fa-magnifying-glass"
          style={{ color: "white", cursor: "pointer", fontSize: "18px" }}
        ></i>

        {loggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <img
              src="/img/user_img.png"
              onClick={() => router.push("/page/User/userProfile")}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                cursor: "pointer",
                border: "2px solid #1890ff",
                transition: "transform 0.2s",
              }}
              className="user-avatar"
              alt="User"
            />
            <FaSignOutAlt
              onClick={handleSignOut}
              style={{ color: "#ff4d4f", cursor: "pointer", fontSize: 20 }}
              title="Đăng xuất"
            />
          </div>
        ) : (
          <Button
            type="primary"
            onClick={() => router.push("/auth/login")}
            style={{ borderRadius: "20px", fontWeight: "600" }}
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </Header>
  );
};

export default MainHeader;
