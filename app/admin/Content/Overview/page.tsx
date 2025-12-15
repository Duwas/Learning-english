

"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";
import {
  FaBars,
  FaBell,
  FaClipboardList,
  FaUserFriends,
  FaBook,
  FaStar,
  FaMicrophone,
  FaChartBar,
} from "react-icons/fa";
import React, { useState } from "react";
// Đảm bảo đường dẫn này đúng:
import Sidebar from "../../../components/sidebar/page";

// --- Constants ---
const SIDEBAR_WIDTH = "240px";
const HEADER_HEIGHT = "60px";
const PRIMARY_ADMIN_COLOR = "#4a00e0"; // Màu tím đậm/Admin chủ đạo
const SECONDARY_BG = "#f4f7f9";

// --- Interfaces ---
interface StatCardProps {
  value: string;
  label: string;
  change: string;
  icon: React.ElementType;
  iconBgClass: string;
}

interface ActivityItemProps {
  name: string;
  action: string;
  time: string;
  avatarBgClass: string;
}

// --- Header Component (Hoàn chỉnh) ---
const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
  <nav
    className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top"
    style={{ height: HEADER_HEIGHT, zIndex: 1030 }}
  >
    <div className="container-fluid px-4">
      <FaBars
        className="fs-4 me-3 text-secondary d-lg-block"
        style={{ cursor: "pointer" }}
        onClick={onToggleSidebar}
      />

      <div
        className="navbar-brand text-dark fw-bold"
        style={{ color: PRIMARY_ADMIN_COLOR }}
      >
        Admin Dashboard
      </div>

      <div className="d-flex align-items-center ms-auto">
        <FaBell
          className="text-secondary me-3 fs-5"
          style={{ cursor: "pointer" }}
        />
        <div className="d-flex align-items-center">
          <div className="me-2 text-end d-none d-sm-block">
            <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
              Admin User
            </div>
            <small className="text-muted" style={{ fontSize: "0.7rem" }}>
              admin@doubleK.com
            </small>
          </div>
          <div
            className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: PRIMARY_ADMIN_COLOR,
            }}
          >
            A
          </div>
        </div>
      </div>
    </div>
  </nav>
);

// --- StatCard Component (Hoàn chỉnh) ---
const StatCard = ({
  value,
  label,
  change,
  icon: Icon,
  iconBgClass,
}: StatCardProps) => (
  <div className="col-lg-3 col-md-6 mb-4">
    <div className="card h-100 border-0 shadow-sm p-3 transition-shadow-hover">
      <div className="card-body d-flex justify-content-between align-items-center w-100 p-0">
        <div>
          <p
            className="card-text text-muted mb-1"
            style={{ fontSize: "0.9rem" }}
          >
            {label}
          </p>
          <h3
            className="card-title fw-bold"
            style={{ fontSize: "2rem", color: "#333" }}
          >
            {value}
          </h3>
          <small
            className={`fw-bold ${
              change.startsWith("+") ? "text-success" : "text-danger"
            }`}
          >
            {change}
          </small>
        </div>
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle text-white ${iconBgClass}`}
          style={{ width: "55px", height: "55px", fontSize: "24px" }}
        >
          <Icon />
        </div>
      </div>
    </div>
  </div>
);

const ActivityItem = ({
  name,
  action,
  time,
  avatarBgClass,
}: ActivityItemProps) => (
  <div
    className="d-flex align-items-center py-3 border-bottom-dashed"
    style={{ fontSize: "0.85rem", borderBottom: "1px dashed #e9ecef" }}
  >
    <div
      className={`rounded-circle text-white d-flex align-items-center justify-content-center fw-bold me-3 ${avatarBgClass}`}
      style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}
    >
      {name.charAt(0)}
    </div>
    <div className="flex-grow-1">
      <p className="mb-0" style={{ color: "#343a40", lineHeight: 1.4 }}>
        <strong className="text-dark me-1" style={{ fontSize: "1rem" }}>
          {name}
        </strong>{" "}
        {action}
      </p>
      <small className="text-muted" style={{ fontSize: "0.7rem" }}>
        {time}
      </small>
    </div>
  </div>
);


export default function OverviewPage() {
  const [showSidebar, setShowSidebar] = useState(true);

  // Dữ liệu mẫu (Đã thêm một mục Speaking)
  const statsData: StatCardProps[] = [
    {
      value: "1,234",
      label: "Tổng số bài học",
      change: "+12% so với tháng trước",
      icon: FaBook,
      iconBgClass: "bg-info",
    }, // bg-stat-blue => bg-info
    {
      value: "8,456",
      label: "Người dùng hoạt động",
      change: "+23% so với tháng trước",
      icon: FaUserFriends,
      iconBgClass: "bg-success",
    }, // bg-stat-green => bg-success
    {
      value: "15,678",
      label: "Bài kiểm tra",
      change: "+8% so với tháng trước",
      icon: FaClipboardList,
      iconBgClass: "bg-primary",
    }, // bg-stat-purple => bg-primary
    {
      value: "350",
      label: "Bài Speaking đã chấm",
      change: "+15% so với tháng trước",
      icon: FaMicrophone,
      iconBgClass: "bg-warning",
    }, // Thêm Speaking
  ];

  const activities: ActivityItemProps[] = [
    {
      name: "Nguyễn Văn A",
      action: "đã hoàn thành bài kiểm tra Grammar B1",
      time: "5 phút trước",
      avatarBgClass: "bg-success",
    },
    {
      name: "Trần Thị B",
      action: "đã thêm bài học mới Vocabulary A2",
      time: "15 phút trước",
      avatarBgClass: "bg-danger",
    },
    {
      name: "Lê Văn C",
      action: "đã cập nhật Listening B2",
      time: "1 giờ trước",
      avatarBgClass: "bg-info",
    },
    {
      name: "Phạm Thị D",
      action: "đã nộp bài Speaking C1",
      time: "2 giờ trước",
      avatarBgClass: "bg-primary",
    },
  ];

  return (
    <>
      <Head>
        <title>Quản lý nội dung - Overview</title>
      </Head>

      {/* 1. SIDEBAR COMPONENT */}
      {/* Giả định component Sidebar của bạn đã được thiết lập để có thể đóng/mở */}
      <Sidebar show={showSidebar} />

      {/* 2. HEADER */}
      <Header onToggleSidebar={() => setShowSidebar(!showSidebar)} />

      {/* 3. MAIN CONTENT */}
      <div
        className="content-wrapper"
        style={{
          paddingTop: HEADER_HEIGHT,
          marginLeft: showSidebar ? SIDEBAR_WIDTH : "0",
          width: showSidebar ? `calc(100% - ${SIDEBAR_WIDTH})` : "100%",
          transition: "margin-left 0.3s, width 0.3s",
          minHeight: "100vh",
          backgroundColor: SECONDARY_BG, // Nền xám nhạt cho toàn bộ nội dung
        }}
      >
        <div className="container-fluid py-4">
          <div className="row px-3">
            {/* Title Bar */}
            <div className="col-12 mb-4">
              <h2 className="fw-bold" style={{ color: "#343a40" }}>
                Tổng quan Hệ thống
              </h2>
              <p className="text-muted">
                Chào mừng trở lại! Xem hiệu suất và hoạt động gần đây của hệ
                thống.
              </p>
            </div>

            {/* A. STATS CARDS */}
            <div className="row">
              {statsData.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* B. CHARTS & ACTIVITY */}
            <div className="row mt-3">
              {/* B1. Thống kê Truy cập/Biểu đồ */}
              <div className="col-lg-8 mb-4">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <h3
                    className="card-header border-0 bg-white fw-bold mb-3"
                    style={{ color: "#343a40" }}
                  >
                    <FaChartBar className="me-2 text-primary" /> Thống kê truy
                    cập theo thời gian
                  </h3>
                  <div
                    className="card-body pt-0 d-flex flex-column justify-content-center align-items-center"
                    style={{ minHeight: "350px" }}
                  >
                    {/* Placeholder cho Biểu đồ (có thể thay bằng react-chartjs-2) */}
                    <div
                      className="chart-placeholder bg-light rounded"
                      style={{
                        height: "300px",
                        width: "95%",
                        border: "1px dashed #ccc",
                      }}
                    >
                      <p className="text-muted text-center pt-5">
                        Khu vực biểu đồ sẽ hiển thị ở đây
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* B2. Hoạt động Gần đây */}
              <div className="col-lg-4 mb-4">
                <div className="card h-100 border-0 shadow-sm">
                  <h3
                    className="card-header border-0 bg-white fw-bold"
                    style={{ color: "#343a40" }}
                  >
                    <FaClipboardList className="me-2 text-warning" /> Hoạt động
                    gần đây
                  </h3>
                  <div className="card-body pt-0">
                    {activities.map((a, i) => (
                      <ActivityItem key={i} {...a} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
