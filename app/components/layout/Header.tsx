"use client";

import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, Button, Avatar } from "antd";
import type { MenuProps } from "antd";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import "../../css/main-menu.css";

import api from "@/app/services/api";
import infoApi from "@/app/services/api/infoAPI";

import {
  AudioOutlined,
  ReadOutlined,
  EditOutlined,
  CustomerServiceOutlined,
  TranslationOutlined,
  BookOutlined,
  FormOutlined,
  UserOutlined,
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [menuData, setMenuData] = useState<Skill[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const lastScrollYRef = useRef(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const isUserSubPage =
    pathname && pathname.startsWith("/User/") && pathname !== "/User";

  const menuLabelStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 500,
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get("/topbar-controller/get-topbar");
        setMenuData(res.data);
      } catch (err) {
        console.error("Lỗi load menu:", err);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current < lastScrollYRef.current) setIsHidden(false);
      else if (current > lastScrollYRef.current && current > 100)
        setIsHidden(true);
      setIsScrolled(current > 50);
      lastScrollYRef.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkLoginAndFetchAvatar = async () => {
      const token = localStorage.getItem("token");
      const storedUserStr = localStorage.getItem("user");

      if (!token || !storedUserStr) {
        setLoggedIn(false);
        setUserAvatar(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      setLoggedIn(true);

      try {
        const currentUser = JSON.parse(storedUserStr);
        const userId = currentUser.id || currentUser.userId;

        const res = await infoApi.getProfile(userId);
        if (res?.data?.avatarUrl) {
          setUserAvatar(res.data.avatarUrl);
        }
      } catch (error) {
        console.error("Phiên đăng nhập hết hạn hoặc lỗi API:", error);

        setLoggedIn(false);
        setUserAvatar(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    checkLoginAndFetchAvatar();
  }, [pathname]);

  useEffect(() => {
    if (pathname?.includes("/User/translate")) {
      setSelectedKeys(["translate"]);
    } else {
      const skillId = searchParams.get("skill");
      const levelCode = searchParams.get("level");
      if (skillId && levelCode) {
        setSelectedKeys([`${skillId}-${levelCode}`]);
      } else {
        setSelectedKeys([]);
      }
    }
  }, [pathname, searchParams]);

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
        fontWeight: "bold",
        width: 30,
        height: 30,
        fontSize: 14,
        lineHeight: "30px",
      }}
    >
      {text}
    </Avatar>
  );

  const skillItems: MenuItem[] = menuData.map((skill) => ({
    key: String(skill.skillId),
    label: <span style={menuLabelStyle}>{skill.name}</span>,
    icon: getIconForSkill(skill.name),
    children: skill.levels.map((lv) => ({
      key: `${skill.skillId}-${lv.code}`,
      label: `${lv.name} (${lv.code})`,
      icon: renderLevelAvatar(lv.code, mapColor(lv.code)),
      onClick: () => handleNavigate(skill.name, skill.skillId, lv.code),
    })),
  }));

  const items: MenuItem[] = [
    ...skillItems,
    {
      key: "translate",
      label: <span style={menuLabelStyle}>Translate</span>,
      icon: getIconForSkill("translate"),
      onClick: () => router.push("/User/translate"),
    },
  ];

  const headerBackgroundColor = isUserSubPage
    ? "#001529"
    : isScrolled
    ? "#001529"
    : "transparent";

  return (
    <Header
      style={{
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
        backgroundColor: headerBackgroundColor,
        transform: isHidden ? "translateY(-100%)" : "translateY(0)",
        transition: "0.3s",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
      }}
    >
      <div
        onClick={() => router.push("/")}
        style={{
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="/img/Logo.png"
          style={{ borderRadius: "50%", cursor: "pointer" }}
          width={40}
          height={40}
          alt="Logo"
        />
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        items={items}
        selectedKeys={selectedKeys}
        style={{
          flex: 1,
          justifyContent: "center",
          background: "transparent",
          borderBottom: "none",
        }}
      />

      {loggedIn ? (
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <Avatar
            size={40}
            src={userAvatar}
            icon={<UserOutlined />}
            style={{
              cursor: "pointer",
              border: "2px solid rgba(255,255,255,0.2)",
              transition: "all 0.3s",
            }}
            onClick={() => router.push("/User/userProfile")}
            className="header-user-avatar"
          />
        </div>
      ) : (
        <Button type="primary" onClick={() => router.push("/auth/login")}>
          Đăng nhập
        </Button>
      )}
    </Header>
  );
};

export default MainHeader;
