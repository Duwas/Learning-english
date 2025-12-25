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
  Spin,
  Alert,
  Image,
  Modal,
  Form,
  Upload,
  message,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import Sidebar from "@/app/components/sidebar/page";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "@/app/services/api";
import { topicService } from "@/app/services/api/topicService";
import type { UploadFile } from "antd/es/upload/interface";

const { Title } = Typography;
const { Search, TextArea } = Input;
const { confirm } = Modal;

const SIDEBAR_WIDTH = 240;
const HEADER_HEIGHT = 64;

const API_DOMAIN = "https://nonvoluntary-dianoetically-marilynn.ngrok-free.dev";

// ---------------- INTERFACES ----------------
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
  // --- State UI ---
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeSkillKey, setActiveSkillKey] = useState("listening");
  const [activeLevelKey, setActiveLevelKey] = useState("");

  // --- State Data ---
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [topicsData, setTopicsData] = useState<Topic[]>([]);
  const [searchText, setSearchText] = useState(""); // State cho ô tìm kiếm

  // --- State Loading ---
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // --- State Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // 1. Fetch Menu Skills
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
        message.error("Không thể tải danh sách kỹ năng.");
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchMenu();
  }, []);

  // 2. Fetch Topics
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

  // Trigger fetch khi user đổi Tab
  useEffect(() => {
    fetchTopics();
    // Reset search text khi đổi tab để tránh nhầm lẫn
    setSearchText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSkillKey, activeLevelKey, skillsData]);

  // --- HÀM MỞ MODAL THÊM ---
  const handleOpenCreate = () => {
    setEditingTopic(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  // --- HÀM MỞ MODAL SỬA ---
  const handleEdit = (record: Topic) => {
    setEditingTopic(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  // --- HÀM LƯU (CREATE/UPDATE) ---
  const handleSave = async (values: any) => {
    const currentSkillObj = skillsData.find(
      (s) => s.name.toLowerCase() === activeSkillKey
    );
    const currentLevelObj = currentSkillObj?.levels.find(
      (l) => l.code === activeLevelKey
    );

    if (!currentSkillObj || !currentLevelObj) {
      message.error("Vui lòng chọn Kỹ năng và Cấp độ trước!");
      return;
    }

    // Bỏ .originFileObj đi
    const fileToUpload =
      fileList.length > 0 ? (fileList[0] as unknown as File) : null;
    console.log(fileToUpload);

    setIsSubmitting(true);

    try {
      if (editingTopic) {
        // Update
        await topicService.update(editingTopic.id, {
          skillId: currentSkillObj.skillId,
          levelId: currentLevelObj.id,
          name: values.name,
          description: values.description,
          imageFile: fileToUpload,
        });
        message.success("Cập nhật thành công!");
      } else {
        // Create
        await topicService.create({
          skillId: currentSkillObj.skillId,
          levelId: currentLevelObj.id,
          name: values.name,
          description: values.description,
          imageFile: fileToUpload,
        });
        message.success("Tạo chủ đề thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
      setEditingTopic(null);
      fetchTopics();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Lỗi server";
      message.error(`${editingTopic ? "Cập nhật" : "Tạo"} thất bại: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HÀM XÓA ---
  const handleDelete = async (id: number) => {
    try {
      await topicService.deleteTopic(id);
      message.success("Đã xóa bài tập!");
      fetchTopics();
    } catch (error: any) {
      console.error(error);
      message.error("Xóa thất bại. " + (error.response?.data?.message || ""));
    }
  };

  const getDefaultImage = () => {
    const skillName = activeSkillKey.toLowerCase();
    switch (skillName) {
      case "listening":
        return "/img/listen_A1.jpg";
      case "speaking":
        return "/img/speaking_A1.jpg";
      case "reading":
        return "/img/reading_A1.png";
      case "writing":
        return "/img/writing_A1.png";
      default:
        return "/img/listen_A1.jpg";
    }
  };

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

  // --- LOGIC LỌC DỮ LIỆU (SEARCH) ---
  const filteredTopics = topicsData.filter((item) => {
    const value = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(value) ||
      item.description.toLowerCase().includes(value)
    );
  });

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      // THAY THẾ CỘT ID BẰNG CỘT STT
      title: "STT",
      key: "stt",
      width: 60,
      align: "center" as const,
      // Render index + 1: Tự động tính toán lại khi mảng filteredTopics thay đổi
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      width: 100,
      align: "center" as const,
      render: (url: string | null) => {
        let finalSrc = getDefaultImage();
        if (url && url.trim() !== "") {
          if (url.startsWith("http")) {
            finalSrc = url;
          } else {
            finalSrc = `${API_DOMAIN}${url}`;
          }
        }
        return (
          <Image
            src={finalSrc}
            alt="Cover"
            width={80}
            height={50}
            style={{
              objectFit: "cover",
              borderRadius: "4px",
              border: "1px solid #eee",
            }}
            fallback={getDefaultImage()}
          />
        );
      },
    },
    {
      title: "Tên bài tập",
      dataIndex: "name",
      render: (text: string) => (
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
      render: (level: string) => <Tag color="blue">{level}</Tag>,
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center" as const,
      render: (_: any, record: Topic) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            ghost
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa?"
            description="Hành động này không thể hoàn tác"
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => handleDelete(record.id)} // ID thật vẫn được dùng ở đây
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
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
          backgroundColor: "#f0f2f5",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
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
            onClick={handleOpenCreate}
          >
            Thêm chủ đề
          </Button>
        </div>

        {/* TABS KỸ NĂNG */}
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

        {/* TABS LEVEL & TABLE */}
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
              message="Không có cấp độ nào"
              type="warning"
              style={{ marginBottom: 20 }}
            />
          )}

          <div className="d-flex justify-content-between mb-3 align-items-center">
            <Search
              placeholder="Tìm kiếm chủ đề..."
              style={{ width: 350 }}
              enterButton={<SearchOutlined />}
              size="middle"
              // Cập nhật state tìm kiếm khi gõ
              onChange={(e) => setSearchText(e.target.value)}
            />
            <span style={{ fontSize: "16px" }}>
              {/* Hiển thị số lượng dựa trên danh sách đã lọc */}
              Tổng: <b>{filteredTopics.length}</b> chủ đề
            </span>
          </div>

          <Table
            columns={columns}
            dataSource={filteredTopics}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            loading={loadingTopics}
            bordered
          />
        </div>
      </div>

      <Modal
        title={
          editingTopic
            ? "Cập Nhật chủ đề"
            : `Thêm Chủ đề mới (${activeSkillKey.toUpperCase()} - ${activeLevelKey})`
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose={true}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Tên chủ đề"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên bài tập!" }]}
          >
            <Input placeholder="Ví dụ: Daily Conversation..." />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <TextArea rows={3} placeholder="Mô tả ngắn về chủ đề..." />
          </Form.Item>

          <Form.Item
            label={
              editingTopic ? "Ảnh bìa mới (Tùy chọn)" : "Ảnh bìa (Tùy chọn)"
            }
          >
            <Upload
              listType="picture"
              maxCount={1}
              fileList={fileList}
              onRemove={() => setFileList([])}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 20 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {editingTopic ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
}
