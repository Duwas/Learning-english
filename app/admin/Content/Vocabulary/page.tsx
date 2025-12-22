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
  Collapse,
  Tag,
  Select,
} from "antd";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSync,
  FaFolder,
  FaFolderOpen,
  FaLayerGroup,
  FaBars,
  FaSearch,
  FaVolumeUp,
} from "react-icons/fa";
import Sidebar from "@/app/components/sidebar/page";
import VocabAdminAPI from "@/app/services/api/VocabAdminAPI";

const POS_OPTIONS = [
  { value: "n", label: "Danh từ (Noun)" },
  { value: "verb", label: "Động từ (Verb)" },
  { value: "adjective", label: "Tính từ (Adjective)" },
  { value: "adverb", label: "Trạng từ (Adverb)" },
  { value: "preposition", label: "Giới từ (Preposition)" },
  { value: "conjunction", label: "Liên từ (Conjunction)" },
  { value: "pronoun", label: "Đại từ (Pronoun)" },
  { value: "phrasal verb", label: "Cụm động từ" },
  { value: "phrase", label: "Cụm từ" },
  { value: "idiom", label: "Thành ngữ" },
];

interface VocabItem {
  id: number;
  word: string;
  pron: string;
  meaningVn: string;
  exampleEn: string;
  exampleVn?: string;
  pos?: string;
  topicId: number;
  groupWord: number;
}

interface TopicItem {
  topic_id: number;
  topic_name: string;
  description?: string;
  group_words: number[];
}

const { TextArea } = Input;
const { Panel } = Collapse;

export default function AdminVocabularyPage() {
  // --- STATE ---
  const [treeData, setTreeData] = useState<TopicItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<{
    id: number;
    name: string;
    topicId: number;
  } | null>(null);

  const [words, setWords] = useState<VocabItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });

  const [loadingTree, setLoadingTree] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  // --- FETCH DATA ---
  const fetchTreeData = async () => {
    try {
      setLoadingTree(true);
      const data = await VocabAdminAPI.getAllTreeVocabulary();
      const safeData = Array.isArray(data) ? data : [];
      setTreeData(safeData);

      // --- LOGIC MỚI: TỰ ĐỘNG CHỌN GROUP ĐẦU TIÊN ---
      // Nếu chưa chọn group nào và dữ liệu trả về có topic
      if (!selectedGroup && safeData.length > 0) {
        // Tìm topic đầu tiên có chứa ít nhất 1 group_words
        const validTopic = safeData.find(
          (t) => t.group_words && t.group_words.length > 0
        );

        if (validTopic) {
          const firstGroupId = validTopic.group_words[0];
          setSelectedGroup({
            id: firstGroupId,
            name: `Part ${firstGroupId}`,
            topicId: validTopic.topic_id,
          });
        }
      }
      // ------------------------------------------------
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh mục");
    } finally {
      setLoadingTree(false);
    }
  };

  const fetchWords = async (groupId: number) => {
    try {
      setLoadingWords(true);
      const data = await VocabAdminAPI.getWordsByGroupId(groupId);
      setWords(Array.isArray(data) ? data : []);
      setPagination((prev) => ({ ...prev, current: 1 }));
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải từ vựng");
      setWords([]);
    } finally {
      setLoadingWords(false);
    }
  };

  useEffect(() => {
    fetchTreeData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchWords(selectedGroup.id);
    }
  }, [selectedGroup]);

  // Filter Topics
  const filteredTreeData = useMemo(() => {
    if (!searchTerm) return treeData;
    const lowerSearch = searchTerm.toLowerCase();
    return treeData
      .map((topic) => ({ ...topic, group_words: topic.group_words }))
      .filter(
        (topic) =>
          topic.topic_name.toLowerCase().includes(lowerSearch) ||
          topic.group_words.some((id) => id.toString().includes(lowerSearch))
      );
  }, [treeData, searchTerm]);

  // --- HANDLERS ---
  const openCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (item: VocabItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdate = async (values: any) => {
    if (!selectedGroup) return message.warning("Chưa chọn bài học!");

    try {
      setSubmitting(true);

      const payload = {
        word: values.word,
        pron: values.pron,
        meaningVn: values.meaningVn,
        exampleEn: values.exampleEn,
        exampleVn: values.exampleVn || "",
        pos: values.pos || "",

        topicId: selectedGroup.topicId,
        groupWord: selectedGroup.id,
        v2: "",
        v3: "",
      };

      if (editingItem) {
        await VocabAdminAPI.updateWord(editingItem.id, payload);
        message.success("Cập nhật thành công!");
      } else {
        await VocabAdminAPI.createWord(payload);
        message.success("Thêm mới thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchWords(selectedGroup.id);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await VocabAdminAPI.deleteWord(id);
      message.success("Xóa thành công!");
      if (selectedGroup) fetchWords(selectedGroup.id);
    } catch (error) {
      message.error("Không thể xóa!");
    }
  };

  // --- COLUMN CONFIG ---
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 50,
      align: "center" as const,
      render: (_: any, __: any, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Từ vựng",
      dataIndex: "word",
      width: 130,
      render: (text: string) => <b className="text-primary fs-6">{text}</b>,
    },
    {
      title: "Loại từ",
      dataIndex: "pos",
      width: 100,
      render: (text: string) => (text ? <Tag color="blue">{text}</Tag> : "-"),
    },
    {
      title: "Phiên âm",
      dataIndex: "pron",
      width: 120,
      render: (text: string) => (text ? <Tag color="cyan">/{text}/</Tag> : "-"),
    },
    {
      title: "Nghĩa tiếng Việt",
      dataIndex: "meaningVn",
      width: 180,
      render: (text: string) => <span className="fw-medium">{text}</span>,
    },
    {
      title: "Ví dụ (EN)",
      dataIndex: "exampleEn",
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-muted fst-italic">
            {text
              ? text.length > 30
                ? `${text.substring(0, 30)}...`
                : text
              : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Ví dụ (VN)",
      dataIndex: "exampleVn",
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-muted">
            {text
              ? text.length > 30
                ? `${text.substring(0, 30)}...`
                : text
              : "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: VocabItem) => (
        <div className="d-flex justify-content-center gap-2">
          <Button
            type="text"
            className="text-primary"
            icon={<FaEdit />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Xóa?"
            onConfirm={() => handleDelete(record.id)}
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
          transition: "all 0.3s",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="bg-white px-4 py-3 shadow-sm d-flex justify-content-between align-items-center sticky-top"
          style={{ zIndex: 100 }}
        >
          <div className="d-flex align-items-center">
            <Button
              type="text"
              icon={<FaBars size={20} />}
              onClick={() => setShowSidebar(!showSidebar)}
              className="me-3"
            />
            <h4 className="m-0 fw-bold text-dark">
              Quản lý <span style={{ color: "#76ce2b" }}>Vocabulary</span>
            </h4>
          </div>
          <Button
            icon={<FaSync />}
            onClick={() => {
              fetchTreeData();
              if (selectedGroup) fetchWords(selectedGroup.id);
            }}
          >
            Làm mới
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 flex-grow-1">
          <div className="row h-100">
            {/* Sidebar Trái */}
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
                  <h6 className="fw-bold mb-2 text-secondary">
                    <FaFolderOpen className="me-2" /> DANH MỤC
                  </h6>
                  <Input
                    prefix={<FaSearch className="text-muted" />}
                    placeholder="Tìm topic..."
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
                  {loadingTree ? (
                    <div className="p-3">
                      <Skeleton active />
                    </div>
                  ) : (
                    <Collapse ghost accordion expandIconPosition="end">
                      {filteredTreeData.map((topic) => (
                        <Panel
                          header={
                            <span className="fw-bold text-dark">
                              <FaFolder className="me-2 text-warning" />{" "}
                              {topic.topic_name}
                            </span>
                          }
                          key={topic.topic_id}
                        >
                          <List
                            size="small"
                            dataSource={topic.group_words}
                            renderItem={(groupId: number) => {
                              const isActive = selectedGroup?.id === groupId;
                              return (
                                <List.Item
                                  onClick={() =>
                                    setSelectedGroup({
                                      id: groupId,
                                      name: `Part ${groupId}`,
                                      topicId: topic.topic_id,
                                    })
                                  }
                                  className={`cursor-pointer ${
                                    isActive
                                      ? "bg-primary-subtle text-primary"
                                      : "text-secondary"
                                  }`}
                                  style={{
                                    cursor: "pointer",
                                    padding: "8px 12px",
                                    marginBottom: "4px",
                                    borderLeft: isActive
                                      ? "3px solid #76ce2b"
                                      : "3px solid transparent",
                                  }}
                                >
                                  <div className="d-flex align-items-center w-100">
                                    <FaLayerGroup
                                      className={`me-2 ${
                                        isActive ? "text-success" : "text-muted"
                                      }`}
                                      style={{ fontSize: "12px" }}
                                    />
                                    <span className={isActive ? "fw-bold" : ""}>
                                      Part {groupId}
                                    </span>
                                  </div>
                                </List.Item>
                              );
                            }}
                          />
                        </Panel>
                      ))}
                    </Collapse>
                  )}
                </div>
              </Card>
            </div>

            {/* Content Phải */}
            <div className="col-md-9 mb-4">
              <Card className="shadow-sm border-0 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="m-0 fw-bold text-primary">
                    {selectedGroup ? selectedGroup.name : "Chưa chọn bài học"}
                  </h5>
                  <Button
                    type="primary"
                    icon={<FaPlus />}
                    onClick={openCreateModal}
                    disabled={!selectedGroup}
                    style={{
                      backgroundColor: "#76ce2b",
                      borderColor: "#76ce2b",
                    }}
                  >
                    Thêm từ mới
                  </Button>
                </div>
                <Table
                  columns={columns}
                  dataSource={words}
                  rowKey="id"
                  loading={loadingWords}
                  pagination={{
                    ...pagination,
                    total: words.length,
                    showSizeChanger: false,
                  }}
                  onChange={(p) =>
                    setPagination({
                      current: p.current || 1,
                      pageSize: p.pageSize || 8,
                    })
                  }
                  bordered
                  size="middle"
                  scroll={{ x: 1000 }}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <Modal
        title={
          <div className="fs-5 fw-bold">
            {editingItem ? "✏️ Chỉnh sửa" : "✨ Thêm từ mới"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          className="mt-3"
        >
          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="word"
                label="Từ vựng (Word)"
                rules={[{ required: true, message: "Nhập từ!" }]}
              >
                <Input
                  size="large"
                  className="fw-bold"
                  placeholder="e.g. Apple"
                />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item name="pron" label="Phiên âm (IPA)">
                <Input
                  prefix={<FaVolumeUp className="text-muted" />}
                  placeholder="/ˈæp.əl/"
                />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <Form.Item name="pos" label="Loại từ (Part of speech)">
                <Select
                  placeholder="Chọn loại từ"
                  options={POS_OPTIONS}
                  allowClear
                />
              </Form.Item>
            </div>
            <div className="col-md-8">
              <Form.Item
                name="meaningVn"
                label="Nghĩa tiếng Việt"
                rules={[{ required: true, message: "Nhập nghĩa!" }]}
              >
                <Input placeholder="Ví dụ: Quả táo" />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="exampleEn" label="Câu ví dụ (Tiếng Anh)">
            <TextArea rows={2} placeholder="She eats an apple every day." />
          </Form.Item>

          <Form.Item name="exampleVn" label="Câu ví dụ (Tiếng Việt)">
            <TextArea rows={2} placeholder="Cô ấy ăn một quả táo mỗi ngày." />
          </Form.Item>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
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
