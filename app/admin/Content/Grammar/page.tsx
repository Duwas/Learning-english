"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
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
} from "react-icons/fa";
import { ImportOutlined, ExportOutlined } from "@ant-design/icons";

import grammarAPI from "@/app/services/api/TreeGrmAPI";
import api from "@/app/services/api";
import { topicService } from "@/app/services/api/topicService";
import Sidebar from "@/app/components/sidebar/page";

interface GrammarItem {
  id: number;
  title: string;
  structure: string;
  explanation: string;
  example: string;
  tip: string;
  imageUrl: string;
  topicId?: number;
}

interface TopicItem {
  topic_id: number;
  topic_name: string;
}

interface Skill {
  skillId: number;
  name: string;
}

const { TextArea } = Input;

export default function AdminGrammarPage() {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [lessons, setLessons] = useState<GrammarItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [grammarSkillId, setGrammarSkillId] = useState<number | null>(null);

  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrammarItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [submittingTopic, setSubmittingTopic] = useState(false);

  const [form] = Form.useForm();
  const [topicForm] = Form.useForm();

  useEffect(() => {
    const initData = async () => {
      setLoadingTopics(true);
      try {
        const menuRes = await api.get("/topbar-controller/get-topbar");
        const grammarSkill = menuRes.data.find(
          (s: Skill) =>
            s.name.toLowerCase().includes("grammar") ||
            s.name.toLowerCase().includes("ngữ pháp")
        );

        if (grammarSkill) {
          setGrammarSkillId(grammarSkill.skillId);
        } else {
          console.warn("Không tìm thấy Skill Grammar trong hệ thống!");
        }

        const treeRes = await grammarAPI.getTreeGrammar();
        const rawData = treeRes.data || treeRes;
        const safeData = Array.isArray(rawData) ? rawData : [];
        setTopics(safeData);

        if (safeData.length > 0 && !selectedTopic) {
          setSelectedTopic(safeData[0].topic_id);
        }
      } catch (err) {
        console.error("Lỗi khởi tạo:", err);
      } finally {
        setLoadingTopics(false);
      }
    };

    initData();
  }, []);

  const handleImportCSV = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    api
      .post("/admin/grammarItem/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        message.success("Nhập Excel thành công!");
      })
      .catch((err) => {
        console.error(err);
        message.error("Nhập Excel thất bại!");
      });
  };

  const handleImportClick = () => {
    console.log("CLICK IMPORT");

    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImportCSV(file);
  };

  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      const res = await grammarAPI.getTreeGrammar();
      const rawData = res.data || res;
      const safeData = Array.isArray(rawData) ? rawData : [];
      setTopics(safeData);
    } catch (error) {
      console.error(error);
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
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    if (selectedTopic) {
      fetchLessons(selectedTopic);
    }
  }, [selectedTopic]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) =>
      t.topic_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topics, searchTerm]);

  const handleCreateOrUpdateLesson = async (values: any) => {
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
      message.error("Có lỗi xảy ra khi lưu dữ liệu!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    try {
      await grammarAPI.deleteGrammar(id);
      message.success("Xóa thành công!");
      if (selectedTopic) fetchLessons(selectedTopic);
    } catch (error) {
      message.error("Không thể xóa bài học này!");
    }
  };

  const handleExportXLSX = async () => {
    try {
      const res = await api.get("/admin/grammarItem/export/xlsx", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "grammar.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success("Xuất XLSX thành công!");
    } catch (err) {
      console.error(err);
      message.error("Xuất XLSX thất bại!");
    }
  };
  const handleAddTopic = async (values: any) => {
    try {
      setSubmittingTopic(true);
      await topicService.create({
        skillId: 2,
        levelId: null,
        name: values.topic_name,
        description: values.description || "Grammar Topic",
        imageFile: null,
      });

      message.success("Thêm chủ đề thành công!");
      setIsTopicModalOpen(false);
      topicForm.resetFields();

      fetchTopics();
    } catch (error: any) {
      console.error(error);
      message.error(
        "Lỗi thêm chủ đề: " + (error.response?.data?.message || "Lỗi server")
      );
    } finally {
      setSubmittingTopic(false);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    try {
      await topicService.deleteTopic(topicId);
      message.success("Đã xóa chủ đề!");

      fetchTopics();

      if (selectedTopic === topicId) {
        setSelectedTopic(null);
        setLessons([]);
      }
    } catch (error: any) {
      console.error(error);
      message.error(
        "Xóa thất bại: " + (error.response?.data?.message || "Lỗi server")
      );
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
  const handleTableChange = (newPagination: any) =>
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 8,
    });

  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center" as const,
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
            onConfirm={() => handleDeleteLesson(record.id)}
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
      <Sidebar show={showSidebar} />

      <div
        style={{
          marginLeft: showSidebar ? "240px" : "0",
          transition: "0.3s",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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
            Làm mới trang
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 flex-grow-1">
          <div className="row h-100">
            {/* LEFT: TOPIC LIST */}
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
                <div className="p-3 border-bottom bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold m-0 text-secondary">
                      <FaFolderOpen className="me-2" />
                      DANH MỤC
                    </h6>
                    <Tooltip title="Thêm danh mục mới">
                      <Button
                        type="text"
                        size="small"
                        onClick={() => setIsTopicModalOpen(true)}
                        icon={<FaPlus size={12} />}
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: "#f6ffed",
                          border: "1px solid #76ce2b",
                          color: "#76ce2b",
                          borderRadius: "50%",
                        }}
                      />
                    </Tooltip>
                  </div>
                  <Input
                    prefix={<FaSearch className="text-muted" />}
                    placeholder="Tìm chủ đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </div>

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
                            className="px-3 py-3 border-bottom d-flex align-items-center justify-content-between group-hover-parent"
                            style={{
                              backgroundColor: isSelected ? "#f6ffed" : "white",
                              borderLeft: isSelected
                                ? "4px solid #76ce2b"
                                : "4px solid transparent",
                              transition: "all 0.2s",
                            }}
                          >
                            {/* Click Area để chọn Topic */}
                            <div
                              onClick={() => setSelectedTopic(item.topic_id)}
                              style={{
                                cursor: "pointer",
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
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
                            </div>

                            {/* ==> NÚT XÓA TOPIC <== */}
                            <Popconfirm
                              title="Xóa danh mục này?"
                              description="Hành động này sẽ xóa cả các bài học bên trong."
                              onConfirm={() => handleDeleteTopic(item.topic_id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="text"
                                size="small"
                                className="text-secondary opacity-50 hover-opacity-100"
                                style={{ marginLeft: 8 }}
                                icon={<FaTrash size={12} />}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Popconfirm>
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

            {/* RIGHT: LESSON TABLE */}
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
                  <div>
                    <input
                      type="file"
                      accept=".csv, .xlsx"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <Button
                      type="primary"
                      icon={<ImportOutlined />}
                      onClick={handleImportClick}
                    >
                      Nhập file Excel
                    </Button>
                  </div>
                  <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    onClick={handleExportXLSX}
                  >
                    Xuất file Excel
                  </Button>
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

      {/* Modal 1: Lesson */}
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
          onFinish={handleCreateOrUpdateLesson}
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
              <Form.Item name="structure" label="Cấu trúc">
                <TextArea rows={4} className="font-monospace" />
              </Form.Item>
            </div>
          </div>
          <Form.Item name="explanation" label="Định nghĩa">
            <TextArea rows={5} />
          </Form.Item>
          <Form.Item name="example" label="Ví dụ">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="tip" label="Mẹo">
            <TextArea rows={2} />
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

      <Modal
        title="Thêm Danh Mục Mới"
        open={isTopicModalOpen}
        onCancel={() => setIsTopicModalOpen(false)}
        footer={null}
        centered
        width={400}
      >
        <Form
          form={topicForm}
          layout="vertical"
          onFinish={handleAddTopic}
          className="mt-3"
        >
          <Form.Item
            name="topic_name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="Ví dụ: 12 thì trong tiếng Anh" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả (Tùy chọn)">
            <Input placeholder="Mô tả ngắn gọn" />
          </Form.Item>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button onClick={() => setIsTopicModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingTopic}
              style={{ backgroundColor: "#76ce2b", borderColor: "#76ce2b" }}
            >
              Thêm
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
