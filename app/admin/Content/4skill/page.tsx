// FILE: /app/admin/4skills/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Input,
  Table,
  Tag,
  Tabs,
  Space,
  Card,
  Spin,
  Alert,
  Image,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Sidebar from "@/app/components/sidebar/page";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "@/app/services/api";

const { Title, Text } = Typography;
const { Search } = Input;

const SIDEBAR_WIDTH = 240;
const HEADER_HEIGHT = 64;

// ---------------- INTERFACES ----------------
interface Level {
  id: number;
  code: string; // "A1", "A2", etc.
  name: string;
}

interface Skill {
  skillId: number;
  name: string; // "Listening", "Reading", etc.
  levels: Level[];
}

interface Topic {
  id: number;
  skill: number;
  level: string;
  name: string;
  description: string;
  imageUrl: string | null;
}

// ---------------- COMPONENT CHÍNH ----------------
export default function SkillManagementPage() {
  // State UI
  const [showSidebar, setShowSidebar] = useState(true);

  // State Tabs Selection
  const [activeSkillKey, setActiveSkillKey] = useState("listening");
  const [activeLevelKey, setActiveLevelKey] = useState("");

  // State Data
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [topicsData, setTopicsData] = useState<Topic[]>([]);

  // State Loading
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // -------------------------------
  // 1️⃣ FETCH DỮ LIỆU MENU
  // -------------------------------
  useEffect(() => {
    const fetchMenu = async () => {
      setLoadingSkills(true);
      try {
        const res = await api.get("/topbar-controller/get-topbar");

        const filteredSkills: Skill[] = res.data.filter((skill: Skill) =>
          ["listening", "reading", "writing", "speaking"].includes(
            skill.name.toLowerCase()
          )
        );

        setSkillsData(filteredSkills);

        if (filteredSkills.length > 0) {
          const firstSkill = filteredSkills[0];
          setActiveSkillKey(firstSkill.name.toLowerCase());
          if (firstSkill.levels.length > 0) {
            setActiveLevelKey(firstSkill.levels[0].code);
          }
        }
      } catch (err) {
        console.error("Lỗi load menu:", err);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchMenu();
  }, []);

  // -------------------------------
  // 2️⃣ FETCH DỮ LIỆU TOPICS
  // -------------------------------
  useEffect(() => {
    const fetchTopics = async () => {
      if (skillsData.length === 0 || !activeSkillKey || !activeLevelKey) return;

      const currentSkillObj = skillsData.find(
        (s) => s.name.toLowerCase() === activeSkillKey
      );
      const currentLevelObj = currentSkillObj?.levels.find(
        (l) => l.code === activeLevelKey
      );

      if (!currentSkillObj || !currentLevelObj) return;

      setLoadingTopics(true);
      try {
        const endpoint = `/admin/topic/get-by-skill-level/${currentSkillObj.skillId}/${currentLevelObj.id}`;
        const res = await api.get(endpoint);
        setTopicsData(res.data);
      } catch (err) {
        console.error("Lỗi load topics:", err);
        setTopicsData([]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [activeSkillKey, activeLevelKey, skillsData]);

  const getDefaultImage = () => {
    const skillName = activeSkillKey.toLowerCase();

    // Logic cố định tên file theo yêu cầu (luôn dùng _A1)
    switch (skillName) {
      case "listening":
        return "/img/listen_A1.jpg"; // 🎯 listening -> listen_A1.jpg
      case "speaking":
        return "/img/speaking_A1.jpg";
      case "reading":
        return "/img/reading_A1.png";
      case "writing":
        return "/img/writing_A1.png";
      default:
        return "/img/listen_A1.jpg"; // Fallback an toàn
    }
  };
  // -------------------------------
  // XỬ LÝ TAB
  // -------------------------------
  const handleSkillTabChange = (key: string) => {
    setActiveSkillKey(key);
    const currentSkill = skillsData.find((s) => s.name.toLowerCase() === key);
    if (currentSkill && currentSkill.levels.length > 0) {
      setActiveLevelKey(currentSkill.levels[0].code);
    } else {
      setActiveLevelKey("");
      setTopicsData([]);
    }
  };

  const tabSkillItems = skillsData.map((skill) => ({
    key: skill.name.toLowerCase(),
    label: skill.name,
  }));

  const currentSkill = skillsData.find(
    (s) => s.name.toLowerCase() === activeSkillKey
  );
  const levelItems =
    currentSkill?.levels.map((lv: Level) => ({
      key: lv.code,
      label: lv.code,
    })) || [];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      align: "center" as const,
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      width: 100,
      align: "center" as const,
      render: (url: string | null) => {
        const finalSrc = url ? url : getDefaultImage();

        return (
          <Image
            src={finalSrc}
            alt="Topic Cover"
            width={80}
            height={50}
            style={{
              objectFit: "cover",
              borderRadius: "4px",
              border: "1px solid #eee",
            }}
            fallback={getDefaultImage()} // Nếu link ảnh lỗi cũng dùng ảnh default
          />
        );
      },
    },
    {
      title: "Tên bài tập",
      dataIndex: "name",
      render: (text: string) => (
        // 🎯 ĐIỀU CHỈNH FONT SIZE Ở ĐÂY
        <span style={{ fontSize: "16px", fontWeight: 600, color: "#2c3e50" }}>
          {text}
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      render: (text: string) => <span style={{ color: "#666" }}>{text}</span>,
    },
    {
      title: "Level",
      dataIndex: "level",
      width: 120,
      align: "center" as const,
      render: (level: string) => (
        <Tag color="blue" style={{ fontSize: "13px" }}>
          {level}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 100,
      align: "center" as const,
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small" type="primary" ghost />
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Space>
      ),
    },
  ];

  if (loadingSkills) {
    return (
      <div
        style={{
          textAlign: "center",
          paddingTop: "20vh",
          marginLeft: showSidebar ? SIDEBAR_WIDTH : 0,
        }}
      >
        <Spin size="large" tip="Đang tải hệ thống..." />
      </div>
    );
  }

  return (
    <>
      <Sidebar show={showSidebar} />

      <div
        style={{
          marginLeft: showSidebar ? SIDEBAR_WIDTH : 0,
          paddingTop: HEADER_HEIGHT,
          padding: 24,
          transition: "margin-left 0.3s ease",
          backgroundColor: "#f0f2f5", // Màu nền xám nhẹ cho toàn trang
          minHeight: "100vh",
        }}
      >
        <div className="d-flex align-items-center mb-4">
          <Button
            type="text"
            icon={showSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ marginRight: 16 }}
          />
          <Title level={3} className="ms-2 mb-0" style={{ margin: 0 }}>
            Quản lý 4 Skills
          </Title>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="ms-auto"
            size="large"
          >
            Thêm bài tập
          </Button>
        </div>

        {/* 1. TABS CHÍNH (SKILL) */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px 20px 0",
            borderRadius: "8px 8px 0 0",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Tabs
            activeKey={activeSkillKey}
            onChange={handleSkillTabChange}
            items={tabSkillItems}
            size="large"
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>

        {/* 2. TABS CON (LEVELS) & CONTENT */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "0 0 8px 8px",
          }}
        >
          {levelItems.length > 0 ? (
            <div style={{ marginBottom: 20 }}>
              <Tabs
                type="card"
                size="small"
                activeKey={activeLevelKey}
                onChange={setActiveLevelKey}
                items={levelItems}
              />
            </div>
          ) : (
            <Alert
              message="Không có cấp độ nào cho kỹ năng này"
              type="warning"
              style={{ marginBottom: 20 }}
            />
          )}

          {/* SEARCH */}
          <div className="d-flex justify-content-between mb-3 align-items-center">
            <Search
              placeholder="Tìm kiếm bài tập..."
              style={{ width: 350 }}
              enterButton={<SearchOutlined />}
              size="middle"
            />
            <span style={{ fontSize: "24px" }}>
              Tổng: {topicsData.length} bài tập
            </span>
          </div>

          {/* TABLE DATA */}
          <Table
            columns={columns}
            dataSource={topicsData}
            rowKey="id"
            pagination={{ pageSize: 8, showSizeChanger: false }}
            loading={loadingTopics}
            bordered
          />
        </div>
      </div>
    </>
  );
}
