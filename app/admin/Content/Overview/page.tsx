"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";
import {
  FaBars,
  FaBell,
  FaClipboardList,
  FaUserFriends,
  FaBook,
  FaChartBar,
  FaTrophy,
  FaStar,
  FaExclamationCircle,
} from "react-icons/fa";
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/sidebar/page";
import api from "@/app/services/api";

import dashboardAPI from "@/app/services/api/dashboard";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SIDEBAR_WIDTH = "240px";
const HEADER_HEIGHT = "60px";
const PRIMARY_ADMIN_COLOR = "#4196e6ff";
const SECONDARY_BG = "#f4f7f9";

const chartData = [
  { time: "00:00", visitors: 1 },
  { time: "02:00", visitors: 0 },
  { time: "04:00", visitors: 0 },
  { time: "06:00", visitors: 2 },
  { time: "08:00", visitors: 5 },
  { time: "10:00", visitors: 8 },
  { time: "12:00", visitors: 7 },
  { time: "14:00", visitors: 9 },
  { time: "16:00", visitors: 10 },
  { time: "18:00", visitors: 12 },
  { time: "20:00", visitors: 14 },
  { time: "22:00", visitors: 6 },
  { time: "23:59", visitors: 3 },
];

interface StatCardProps {
  value: string | number;
  label: string;
  change: string;
  icon: React.ElementType;
  iconBgClass: string;
}

interface RankingItemProps {
  title: string;
  count: number;
  totalUsers: number;
  color: string;
}

interface ScoreItemProps {
  title: string;
  score: number;
}

interface AlertItemProps {
  title: string;
  rate: string;
}

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

const StatCard = ({
  value,
  label,
  change,
  icon: Icon,
  iconBgClass,
}: StatCardProps) => (
  <div className="col-lg-4 col-md-6 mb-3">
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

const RankingItem = ({ title, count, totalUsers, color }: RankingItemProps) => {
  const percentage = (count / totalUsers) * 100;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span className="fw-bold" style={{ fontSize: "0.9rem" }}>
          {title}
        </span>
        <span
          className="text-muted"
          style={{ fontSize: "0.85rem" }}
        >{`${count}/${totalUsers}`}</span>
      </div>
      <div className="progress" style={{ height: "6px" }}>
        <div
          className={`progress-bar ${color}`}
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
};

const ScoreItem = ({ title, score }: ScoreItemProps) => (
  <div
    className="d-flex align-items-center justify-content-between py-2 border-bottom-dashed"
    style={{ borderBottom: "1px dashed #e9ecef" }}
  >
    <span style={{ fontSize: "0.9rem", color: "#495057" }}>{title}</span>
    <span className="badge bg-warning text-dark d-flex align-items-center">
      {score} <FaStar className="ms-1" size={10} />
    </span>
  </div>
);

const AlertItem = ({ title, rate }: AlertItemProps) => (
  <div className="d-flex align-items-center py-2">
    <FaExclamationCircle className="text-danger me-2" />
    <div className="flex-grow-1">
      <div className="d-flex justify-content-between">
        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{title}</span>
        <span className="text-danger fw-bold" style={{ fontSize: "0.85rem" }}>
          {rate} sai
        </span>
      </div>
    </div>
  </div>
);

export default function OverviewPage() {
  const [showSidebar, setShowSidebar] = useState(true);

  const [stats, setStats] = useState({
    userCount: 0,
    exerciseCount: 0,
    topicCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getstatus();
        if (response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statsData: StatCardProps[] = [
    {
      value: stats.topicCount,
      label: "Tổng chủ đề",
      change: "+2 mới",
      icon: FaBook,
      iconBgClass: "bg-info",
    },
    {
      value: stats.userCount,
      label: "Tổng người dùng",
      change: "+100% full",
      icon: FaUserFriends,
      iconBgClass: "bg-success",
    },
    {
      value: stats.exerciseCount,
      label: "Tổng bài học",
      change: "+5 tuần này",
      icon: FaClipboardList,
      iconBgClass: "bg-primary",
    },
  ];

  const popularContent: RankingItemProps[] = [
    {
      title: "Who is in your new class?",
      count: 14,
      totalUsers: 14,
      color: "bg-success",
    },
    {
      title: "Introducing Myself and Others",
      count: 12,
      totalUsers: 14,
      color: "bg-info",
    },
    {
      title: "Weekend Activities",
      count: 10,
      totalUsers: 14,
      color: "bg-warning",
    },
  ];

  const highScores: ScoreItemProps[] = [
    { title: "Debating Environmental Solutions", score: 8.6 },
    { title: "Healthy Living Habits", score: 7.5 },
    { title: "Famous Festivals", score: 7 },
  ];

  const hardTopics: AlertItemProps[] = [
    { title: "Giới từ & Mạo từ", rate: "45%" },
    { title: "Câu bị động", rate: "38%" },
  ];

  return (
    <>
      <Head>
        <title>Quản lý nội dung - Overview</title>
      </Head>
      <Sidebar show={showSidebar} />
      <Header onToggleSidebar={() => setShowSidebar(!showSidebar)} />
      <div
        className="content-wrapper"
        style={{
          paddingTop: HEADER_HEIGHT,
          marginLeft: showSidebar ? SIDEBAR_WIDTH : "0",
          width: showSidebar ? `calc(100% - ${SIDEBAR_WIDTH})` : "100%",
          transition: "margin-left 0.3s, width 0.3s",
          minHeight: "100vh",
          backgroundColor: SECONDARY_BG,
        }}
      >
        <div className="container-fluid py-4">
          <div className="row px-3">
            <div className="col-12 mb-4">
              <h2 className="fw-bold" style={{ color: "#343a40" }}>
                Tổng quan Hệ thống
              </h2>
              <p className="text-muted">
                Dữ liệu thời gian thực từ {stats.userCount} học viên và các học
                phần.
              </p>
            </div>

            <div className="row">
              {statsData.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            <div className="row mt-3">
              <div className="col-lg-8 mb-4">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <h3
                    className="card-header border-0 bg-white fw-bold mb-3"
                    style={{ color: "#343a40" }}
                  >
                    <FaChartBar className="me-2 text-primary" /> Lưu lượng truy
                    cập (24h)
                  </h3>
                  <div
                    className="card-body pt-0"
                    style={{ minHeight: "350px", width: "100%" }}
                  >
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorVisitors"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={PRIMARY_ADMIN_COLOR}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={PRIMARY_ADMIN_COLOR}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          stroke={PRIMARY_ADMIN_COLOR}
                          fillOpacity={1}
                          fill="url(#colorVisitors)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4">
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header border-0 bg-white fw-bold pt-3 pb-2">
                    <FaTrophy className="me-2 text-warning" />
                    Top bài học hoàn thành
                  </div>
                  <div className="card-body pt-0">
                    {popularContent.map((item, i) => (
                      <RankingItem key={i} {...item} />
                    ))}
                  </div>
                </div>

                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header border-0 bg-white fw-bold pt-3 pb-2">
                    <FaStar className="me-2 text-warning" />
                    Điểm trung bình cao nhất
                  </div>
                  <div className="card-body pt-0 pb-2">
                    {highScores.map((item, i) => (
                      <ScoreItem key={i} {...item} />
                    ))}
                  </div>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-header border-0 bg-white fw-bold pt-3 pb-2">
                    <FaExclamationCircle className="me-2 text-danger" />
                    Chủ đề cần cải thiện (Tỉ lệ sai cao)
                  </div>
                  <div className="card-body pt-0 pb-2">
                    {hardTopics.map((item, i) => (
                      <AlertItem key={i} {...item} />
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
