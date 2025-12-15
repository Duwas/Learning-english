"use client";

import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, Button, Avatar } from "antd";
import type { MenuProps } from "antd";
import { useRouter, usePathname } from "next/navigation"; // *** THÊM usePathname ***
import { FaSignOutAlt } from "react-icons/fa";
import "../../css/main-menu.css";
import api from "@/app/services/api";
import {
  AudioOutlined,
  ReadOutlined,
  EditOutlined,
  CustomerServiceOutlined,
  TranslationOutlined,
  BookOutlined,
  FormOutlined,
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

interface Level {
  id: number;
  code: string;
  name: string;
}

interface Skill {
  skillId: number;
  name: string;
  levels: Level[];
}

const MainHeader = () => {
  const { Header } = Layout;
  const router = useRouter();
  const pathname = usePathname(); // *** KHỞI TẠO PATHNAME ***

  const [menuData, setMenuData] = useState<Skill[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);

  const lastScrollYRef = useRef(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // -------------------------------
  // 📌 KIỂM TRA ĐƯỜNG DẪN CON
  // -------------------------------
  const isUserSubPage =
    pathname && pathname.startsWith("/User/") && pathname !== "/User";

  // -------------------------------
  // 📌 FETCH MENU FROM BE (Giữ nguyên)
  // -------------------------------
  const fetchMenu = async () => {
    try {
      const res = await api.get("/topbar-controller/get-topbar");
      setMenuData(res.data);
    } catch (err) {
      console.error("Lỗi load menu:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;

      // Logic ẩn/hiện (chạy cho mọi trang)
      if (current < lastScrollYRef.current) setIsHidden(false);
      else if (current > lastScrollYRef.current && current > 100)
        setIsHidden(true);

      setIsScrolled(current > 50);
      lastScrollYRef.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Dependency rỗng để cuộn luôn được lắng nghe

  // -------------------------------
  // 📌 LOGIN CHECK, NAVIGATE, ICONS, MAP COLOR, BUILD MENU (Giữ nguyên)
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleNavigate = (
    skillName: string,
    skillId: number,
    levelId: string
  ) => {
    const path = skillName.toLowerCase().replace(/\s/g, "");
    router.push(`/User/${path}?skill=${skillId}&level=${levelId}`);
  };

  const getIconForSkill = (name: string) => {
    const style = { fontSize: 18 };
    switch (name.toLowerCase()) {
      case "listening":
        return <CustomerServiceOutlined style={style} />;
      case "reading":
        return <ReadOutlined style={style} />;
      case "writing":
        return <EditOutlined style={style} />;
      case "speaking":
        return <AudioOutlined style={style} />;
      case "vocabulary":
        return <BookOutlined style={style} />;
      case "grammar":
        return <FormOutlined style={style} />;
      case "translate":
        return <TranslationOutlined style={style} />;
      default:
        return null;
    }
  };

  const mapColor = (code: string) => {
    switch (code) {
      case "A1":
        return "#52c41a";
      case "A2":
        return "#1890ff";
      case "B1":
        return "#faad14";
      case "B2":
        return "#722ed1";
      case "C1":
        return "#eb2f96";
      case "C2":
        return "#fa541c";
      default:
        return "#555";
    }
  };

  const renderLevelAvatar = (text: string, color: string) => (
    <Avatar
      style={{
        backgroundColor: color,
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        width: 36,
        height: 36,
        lineHeight: "36px",
        border: "2px solid rgba(255,255,255,0.8)",
      }}
    >
      {text}
    </Avatar>
  );

  const skillItems: MenuItem[] = menuData.map((skill) => ({
    key: skill.skillId,
    label: skill.name,
    icon: getIconForSkill(skill.name),

    children: skill.levels.map((lv) => ({
      key: `${skill.skillId}-${lv.code}`,
      label: `${lv.name} (${lv.code})`,
      icon: renderLevelAvatar(lv.code, mapColor(lv.code)),

      onClick: () => handleNavigate(skill.name, skill.skillId, lv.code),
    })),
  }));

  const translateItem: MenuItem = {
    key: "translate",
    label: "Translate",
    icon: getIconForSkill("translate"),
    onClick: () => router.push("/User/translate"),
  };

  const items: MenuItem[] = [...skillItems, translateItem];

  // -------------------------------
  // 📌 LOGIC MÀU NỀN VÀ HIỆU ỨNG (ĐÃ SỬA)
  // -------------------------------
  let headerBackgroundColor;

  if (isUserSubPage) {
    // Nếu là trang con (/User/*): luôn có màu tối #001529
    headerBackgroundColor = "#001529";
  } else {
    // Nếu là trang khác (trang chủ /): áp dụng hiệu ứng cuộn trong suốt
    headerBackgroundColor = isScrolled ? "#001529" : "transparent";
  }

  // Transform luôn sử dụng isHidden (ẩn/hiện khi cuộn)
  const transformStyle = isHidden ? "translateY(-100%)" : "translateY(0)";

  // -------------------------------
  // 📌 RENDER UI
  // -------------------------------
  return (
    <Header
      className={`main-header ${isHidden ? "header-hidden" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        width: "100%",
        top: 0,
        height: 64,
        padding: "0 30px",
        zIndex: 1000,
        backgroundColor: headerBackgroundColor,
        transform: transformStyle, // Sử dụng transformStyle đã tính toán
        transition: "0.3s",
      }}
    >
      {/* LOGO */}
      <div
        onClick={() => router.push("/")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <img
          src="/img/Logo.png"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            marginRight: 12,
          }}
        />
        <span className="text-white fw-bold fs-5">doubleK-Book</span>
      </div>

      {/* MENU */}
      <Menu
        theme="dark"
        mode="horizontal"
        items={items}
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "transparent",
          borderBottom: "none",
          fontSize: 16,
        }}
      />

      {/* USER */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {loggedIn ? (
          <>
            <img
              src="/img/user_img.png"
              onClick={() => router.push("/page/User/userProfile")}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                cursor: "pointer",
                border: "2px solid #1890ff",
              }}
            />
            <FaSignOutAlt
              style={{ color: "#ff4d4f", fontSize: 20, cursor: "pointer" }}
              onClick={handleSignOut}
            />
          </>
        ) : (
          <Button
            type="primary"
            style={{ borderRadius: 20, fontWeight: 600 }}
            onClick={() => router.push("/auth/login")}
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </Header>
  );
};

export default MainHeader;
