"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Card,
  List,
  Skeleton,
  Tooltip,
  Layout,
  Typography,
} from "antd";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSync,
  FaFolder,
  FaFolderOpen,
  FaBars,
  FaSearch,
  FaLink,
  FaImage,
} from "react-icons/fa";
import grammarAPI from "@/app/services/api/TreeGrmAPI";
import Sidebar from "@/app/components/sidebar/page";

// --- TYPES ---
interface GrammarItem {
  id: number;
  title: string;
  structure: string;
  explanation: string;
  example: string;
  tip: string;
  imageUrl: string; // Đã khôi phục trường này
  topicId?: number;
}

interface TopicItem {
  topic_id: number;
  topic_name: string;
}

const { TextArea } = Input;
const { Link } = Typography;

export default function AdminGrammarPage() {
  // --- STATE ---
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [lessons, setLessons] = useState<GrammarItem[]>([]);

  // State quản lý Sidebar & Search
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
  });

  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrammarItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  // --- FETCH DATA ---
  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      const res = await grammarAPI.getTreeGrammar();
      const rawData = res.data || res;
      const safeData = Array.isArray(rawData) ? rawData : [];
      setTopics(safeData);

      if (safeData.length > 0 && !selectedTopic) {
        setSelectedTopic(safeData[0].topic_id);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách chủ đề");
    } finally {
      setLoadingTopics(false);
    }
  };

  const fetchLessons = async (topicId: number) => {
    try {
      setLoadingLessons(true);
      const res = await grammarAPI.getGrammarByCategory(topicId);
      const rawData = res.data || res;
      setLessons(Array.isArray(rawData) ? rawData : []);
      setPagination((prev) => ({ ...prev, current: 1 }));
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách bài học");
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchLessons(selectedTopic);
    }
  }, [selectedTopic]);

  // Filter Topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) =>
      t.topic_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topics, searchTerm]);

  // --- HANDLERS ---
  const handleCreateOrUpdate = async (values: any) => {
    if (!selectedTopic) return message.warning("Chưa chọn chủ đề!");

    try {
      setSubmitting(true);
      if (editingItem) {
        await grammarAPI.updateGrammar(editingItem.id, {
          ...values,
          topicId: selectedTopic,
        });
        message.success("Cập nhật thành công!");
      } else {
        await grammarAPI.createGrammar({
          ...values,
          topicId: selectedTopic,
        });
        message.success("Thêm mới thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchLessons(selectedTopic);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi lưu dữ liệu!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await grammarAPI.deleteGrammar(id);
      message.success("Xóa thành công!");
      if (selectedTopic) fetchLessons(selectedTopic);
    } catch (error) {
      console.error(error);
      message.error("Không thể xóa bài học này!");
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (item: GrammarItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 8,
    });
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center" as const,
      // Logic tính STT: (Page - 1) * Size + Index + 1
      render: (_: any, __: any, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      render: (text: string) => <b className="text-primary">{text}</b>,
    },
    {
      title: "Cấu trúc",
      dataIndex: "structure",
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-danger" style={{ fontFamily: "monospace" }}>
            {text
              ? text.length > 30
                ? `${text.substring(0, 30)}...`
                : text
              : ""}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center" as const,
      render: (_: any, record: GrammarItem) => (
        <div className="d-flex justify-content-center gap-2">
          <Button
            type="text"
            className="text-primary"
            icon={<FaEdit />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Xóa bài học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" className="text-danger" icon={<FaTrash />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* 1. Sidebar Component */}
      <Sidebar show={showSidebar} />

      {/* 2. Main Content Wrapper */}
      <div
        style={{
          marginLeft: showSidebar ? "240px" : "0",
          transition: "margin-left 0.3s ease-in-out",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Bar */}
        <div className="bg-white px-4 py-3 shadow-sm d-flex justify-content-between align-items-center sticky-top">
          <div className="d-flex align-items-center">
            <Button
              type="text"
              icon={<FaBars size={20} />}
              onClick={() => setShowSidebar(!showSidebar)}
              className="me-3"
            />
            <h4 className="m-0 fw-bold text-dark">
              Quản lý <span style={{ color: "#76ce2b" }}>Grammar</span>
            </h4>
          </div>
          <Button
            icon={<FaSync />}
            onClick={() => {
              fetchTopics();
              if (selectedTopic) fetchLessons(selectedTopic);
            }}
          >
            Làm mới dữ liệu
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-grow-1">
          <div className="row h-100">
            {/* === CỘT TRÁI: DANH SÁCH CHỦ ĐỀ === */}
            <div className="col-md-3 mb-4">
              <Card
                className="shadow-sm border-0 h-100"
                bodyStyle={{
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Header của cột Topic */}
                <div className="p-3 border-bottom bg-light">
                  <h6 className="fw-bold mb-2 text-secondary">
                    <FaFolderOpen className="me-2" />
                    DANH MỤC
                  </h6>
                  <Input
                    prefix={<FaSearch className="text-muted" />}
                    placeholder="Tìm chủ đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </div>

                {/* List Topic */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 240px)",
                  }}
                >
                  {loadingTopics ? (
                    <div className="p-3">
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                  ) : (
                    <List
                      dataSource={filteredTopics}
                      renderItem={(item) => {
                        const isSelected = selectedTopic === item.topic_id;
                        return (
                          <div
                            onClick={() => setSelectedTopic(item.topic_id)}
                            className="px-3 py-3 border-bottom d-flex align-items-center justify-content-between"
                            style={{
                              cursor: "pointer",
                              backgroundColor: isSelected ? "#f6ffed" : "white",
                              borderLeft: isSelected
                                ? "4px solid #76ce2b"
                                : "4px solid transparent",
                              transition: "all 0.2s",
                            }}
                          >
                            <div
                              className={`d-flex align-items-center ${
                                isSelected
                                  ? "fw-bold text-dark"
                                  : "text-secondary"
                              }`}
                            >
                              <span className="me-2">
                                {isSelected ? (
                                  <FaFolderOpen color="#76ce2b" />
                                ) : (
                                  <FaFolder color="#ccc" />
                                )}
                              </span>
                              {item.topic_name}
                            </div>
                            {isSelected && (
                              <span
                                style={{ fontSize: "10px", color: "#76ce2b" }}
                              >
                                ●
                              </span>
                            )}
                          </div>
                        );
                      }}
                    />
                  )}
                  {filteredTopics.length === 0 && !loadingTopics && (
                    <div className="text-center py-4 text-muted">
                      Không tìm thấy chủ đề
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* === CỘT PHẢI: BẢNG DỮ LIỆU === */}
            <div className="col-md-9 mb-4">
              <Card className="shadow-sm border-0 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <span className="text-muted d-block small">Đang xem:</span>
                    <h5 className="m-0 fw-bold text-primary">
                      {topics.find((t) => t.topic_id === selectedTopic)
                        ?.topic_name || "Chưa chọn chủ đề"}
                    </h5>
                  </div>
                  <Button
                    type="primary"
                    icon={<FaPlus />}
                    onClick={openCreateModal}
                    disabled={!selectedTopic}
                    style={{
                      backgroundColor: "#76ce2b",
                      borderColor: "#76ce2b",
                      boxShadow: "0 2px 5px rgba(118, 206, 43, 0.4)",
                    }}
                  >
                    Thêm bài mới
                  </Button>
                </div>

                <Table
                  columns={columns}
                  dataSource={lessons}
                  rowKey="id"
                  loading={loadingLessons}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: lessons.length,
                    showSizeChanger: false,
                  }}
                  onChange={handleTableChange}
                  bordered
                  size="middle"
                  scroll={{ x: 700 }}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* === MODAL FORM === */}
      <Modal
        title={
          <div className="fs-5 fw-bold">
            {editingItem ? "✏️ Chỉnh sửa bài học" : "✨ Thêm bài học mới"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        maskClosable={false}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          className="mt-3"
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài học"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input
              placeholder="Ví dụ: Thì hiện tại đơn (Present Simple)"
              size="large"
            />
          </Form.Item>

          <div className="row">
            <div className="mt-3">
              <Form.Item name="structure" label="Cấu trúc (Structure)">
                <TextArea
                  rows={4}
                  placeholder="S + V(s/es) + O..."
                  className="font-monospace"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="explanation" label="Định nghĩa & Cách dùng">
            <TextArea rows={5} placeholder="Nhập chi tiết định nghĩa..." />
          </Form.Item>

          <Form.Item name="example" label="Ví dụ minh họa">
            <TextArea rows={4} placeholder="Ví dụ câu..." />
          </Form.Item>

          <Form.Item name="tip" label="Mẹo ghi nhớ">
            <TextArea rows={2} placeholder="Mẹo nhỏ để nhớ nhanh..." />
          </Form.Item>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
            <Button onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: "#76ce2b", borderColor: "#76ce2b" }}
            >
              {editingItem ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
