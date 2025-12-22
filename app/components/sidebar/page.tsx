"use client";
import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBook,
  FaLanguage,
  FaHeadphones,
  FaFileAlt,
  FaPenNib,
  FaUsers,
  FaCog,
  FaAngleDown,
  FaAngleUp,
  FaLayerGroup,
  FaBookOpen,
} from "react-icons/fa";

interface SidebarProps {
  show?: boolean;
}

interface SidebarItem {
  name: string;
  icon: React.ElementType;
  link: string;
  children?: { name: string; link: string }[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: "Tổng quan",
    icon: FaTachometerAlt,
    link: "/admin/Content/Overview",
  },
  {
    name: "Grammar",
    icon: FaBook,
    link: "/admin/Content/Grammar",
  },
  {
    name: "Vocabulary",
    icon: FaLanguage,
    // Bạn hãy thay đường dẫn này bằng route thực tế của trang Vocabulary
    link: "/admin/Content/Vocabulary",
  },
  {
    name: "4 Skills",
    icon: FaLayerGroup,
    link: "/admin/Content/4skill",
  },
  {
    name: "Excercises",
    icon: FaBookOpen,
    link: "/admin/Content/Excercise",
  },
  {
    name: "Người dùng",
    icon: FaUsers,
    link: "/page/Admin/users",
  },
  {
    name: "Cài đặt",
    icon: FaCog,
    link: "/page/Admin/settings",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ show = true }) => {
  const [openDropdown, setOpenDropdown] = useState("");

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? "" : name);
  };

  return (
    <div
      className="bg-dark text-white p-3"
      style={{
        width: "240px",
        height: "100vh",
        position: "fixed", // Quan trọng: Đặt Sidebar cố định
        top: 0,
        left: 0,
        zIndex: 1020, // Để nằm dưới Header (thường là 1030)
        transition: "transform 0.3s ease-in-out",
        transform: show ? "translateX(0)" : "translateX(-100%)", // Logic ẩn/hiện
      }}
    >
      <h3 className="text-success mb-4 text-center">Admin Panel</h3>

      <ul className="nav nav-pills flex-column mb-auto">
        {sidebarItems.map((item) => (
          <li key={item.name} className="nav-item mb-4">
            {/* Kiểm tra nếu item có children thì render dạng dropdown, ngược lại render dạng link thường */}
            {item.children ? (
              <>
                <a
                  className={`nav-link text-white d-flex align-items-center ${
                    openDropdown === item.name ? "active bg-secondary" : ""
                  }`}
                  onClick={() => toggleDropdown(item.name)}
                  role="button"
                  style={{ cursor: "pointer" }}
                >
                  <item.icon className="me-2" />
                  {item.name}
                  <span className="ms-auto">
                    {openDropdown === item.name ? (
                      <FaAngleUp />
                    ) : (
                      <FaAngleDown />
                    )}
                  </span>
                </a>
                <div
                  className={`collapse ${
                    openDropdown === item.name ? "show" : ""
                  }`}
                >
                  <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small ps-4">
                    {item.children.map((child) => (
                      <li key={child.name} className="mb-2">
                        <a
                          className="link-light rounded text-decoration-none py-2 d-block"
                          href={child.link}
                          style={{ cursor: "pointer" }}
                        >
                          {child.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              // Render link bình thường (như Grammar, Vocab, Overview...)
              <a
                className="nav-link text-white d-flex align-items-center"
                href={item.link}
                style={{ cursor: "pointer" }}
              >
                <item.icon className="me-2" />
                {item.name}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
