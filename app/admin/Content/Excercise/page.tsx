"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Typography,
  Tooltip,
  message,
  Select,
  Row,
  Col,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Upload,
  InputNumber,
  Popconfirm,
  Radio,
  Divider,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  SoundOutlined,
  FileImageOutlined,
  SaveOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  AppstoreAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ImportOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import Sidebar from "@/app/components/sidebar/page";

// --- IMPORT SERVICES ---
import { exerciseService } from "@/app/services/api/adminExAPI";
import { topicService } from "@/app/services/api/topicService";
import type { TableColumnsType, UploadFile } from "antd";

const { Title, Text } = Typography;
const { Option: SelectOption } = Select;
const SIDEBAR_WIDTH = 240;

// --- INTERFACES ---
interface ExerciseParams {
  topicId?: number;
  groupWord?: number;
  title: string;
  type: number;
  description?: string;
}

interface QuestionType {
  id: number;
  questionText: string;
  questionType?: string;
  vocabularyId?: number;
}

interface OptionType {
  id: number;
  optionText: string;
  isCorrect: boolean;
  question: number;
}

interface ExerciseType {
  id: number;
  exerciseId: number;
  topicId?: number;
  title: string;
  description: string;
  type: number;
  groupWord?: number;
  questionCount?: number;
  audioUrl?: string;
  image?: string;
  isLoadingQuestions?: boolean;
  questions?: QuestionType[];
}

export default function ExerciseManagementPage() {
  // --- STATE CHUNG ---
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [menuDataLevel, setMenuDataLevel] = useState<any[]>([]);

  const [topicsList, setTopicsList] = useState<any[]>([]);

  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // --- STATE MODAL BÀI TẬP ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseType | null>(
    null
  );
  const [form] = Form.useForm();
  const [fileListAudio, setFileListAudio] = useState<UploadFile[]>([]);
  const [fileListImage, setFileListImage] = useState<UploadFile[]>([]);

  // --- STATE MODAL CÂU HỎI (QUESTION + 4 OPTIONS) ---
  const [isQModalOpen, setIsQModalOpen] = useState(false);
  const [isQSubmitting, setIsQSubmitting] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState<number | null>(
    null
  );
  const [editingQuestion, setEditingQuestion] = useState<QuestionType | null>(
    null
  );
  // Lưu danh sách options tạm thời khi đang edit câu hỏi để map vào form A,B,C,D
  const [editingQuestionOptions, setEditingQuestionOptions] = useState<
    OptionType[]
  >([]);
  const [qForm] = Form.useForm();

  // --- STATE MODAL OPTION (Quản lý riêng lẻ) ---
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [currentQuestionForOption, setCurrentQuestionForOption] =
    useState<QuestionType | null>(null);
  const [optionList, setOptionList] = useState<OptionType[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  // State edit 1 option cụ thể
  const [editingOption, setEditingOption] = useState<OptionType | null>(null);
  const [optionForm] = Form.useForm();

  // 1. INIT DATA
  useEffect(() => {
    const fetchMenu = async () => {
      setLoadingMenu(true);
      try {
        const res = await topicService.getAllSkills();
        setMenuData(res.data || []);
        const resLevel = await topicService.getAllLevels();
        setMenuDataLevel(resLevel.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  // 2. LOAD TOPICS
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSkillId || !selectedLevelId) {
        setTopicsList([]);
        setSelectedTopicId(null);
        return;
      }
      try {
        let res;
        if (selectedSkillId === 1 || selectedSkillId === 2) {
          res = await topicService.getBySkill(selectedSkillId);
        } else {
          res = await topicService.getBySkillAndLevel(
            selectedSkillId,
            selectedLevelId
          );
        }
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];
        setTopicsList(data);
      } catch (e) {
        message.error("Lỗi tải chủ đề");
      }
    };
    fetchTopics();
  }, [selectedSkillId, selectedLevelId]);

  // 3. FETCH EXERCISES
  const fetchExercises = async () => {
    if (!selectedTopicId) {
      message.warning("Vui lòng chọn chủ đề!");
      return;
    }
    setLoadingExercises(true);
    setHasSearched(true);
    try {
      const res = await exerciseService.getExercisesByTopic1(selectedTopicId);
      let rawData = [];
      if (Array.isArray(res.data)) rawData = res.data;
      else if (res.data?.data && Array.isArray(res.data.data))
        rawData = res.data.data;

      const safeData: ExerciseType[] = rawData.map((item: any) => ({
        ...item,
        id: item.id || item.exerciseId,
        exerciseId: item.exerciseId || item.id,
        topicId: item.topicId || selectedTopicId,
        questions: [],
        isLoadingQuestions: false,
      }));
      setExercises(safeData);
    } catch (e) {
      console.error(e);
      message.error("Lỗi tải dữ liệu bài tập");
    } finally {
      setLoadingExercises(false);
    }
  };

  // --- HANDLERS BÀI TẬP (EXERCISE) ---
  const handleOpenModal = (record?: ExerciseType) => {
    form.resetFields();
    setFileListAudio([]);
    setFileListImage([]);
    if (record) {
      setEditingExercise(record);
      form.setFieldsValue({
        title: record.title,
        description: record.description,
        type: record.type,
        groupWord: record.groupWord,
        topicId: record.topicId || selectedTopicId,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveExercise = async (values: any) => {
    setIsSubmitting(true);
    try {
      const params: ExerciseParams = {
        title: values.title,
        type: Number(values.type), // ép number
        groupWord: values.groupWord ? Number(values.groupWord) : 0,
        topicId: Number(selectedTopicId), // ép number
        description: values.description ?? "",
      };

      const imgFile = fileListImage?.[0]?.originFileObj || null;
      const audFile = fileListAudio?.[0]?.originFileObj || null;

      if (editingExercise?.id) {
        await exerciseService.update(
          editingExercise.id,
          params,
          imgFile,
          audFile
        );
        message.success("Cập nhật bài tập thành công!");
      } else {
        await exerciseService.create(params, imgFile, audFile);
        message.success("Tạo bài tập mới thành công!");
      }

      setIsModalOpen(false);
      fetchExercises();
    } catch (e) {
      console.error(e);
      message.error("Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = async (id: number) => {
    try {
      await exerciseService.deleteById(id);
      message.success("Đã xóa bài tập thành công!");
      fetchExercises();
    } catch (error) {
      console.error(error);
      message.error("Xóa bài tập thất bại.");
    }
  };

  // --- HANDLERS CÂU HỎI (QUESTION) ---

  // Mở rộng dòng để load câu hỏi
  const handleExpandRow = async (expanded: boolean, record: ExerciseType) => {
    if (expanded) {
      await reloadQuestions(record.id || record.exerciseId);
    }
  };

  // Hàm reload câu hỏi cho 1 bài tập cụ thể (dùng sau khi thêm/sửa/xóa câu hỏi)
  const reloadQuestions = async (exerciseId: number) => {
    // Cập nhật trạng thái loading
    setExercises((prev) =>
      prev.map((e) =>
        (e.id || e.exerciseId) === exerciseId
          ? { ...e, isLoadingQuestions: true }
          : e
      )
    );

    try {
      const res = await exerciseService.getQuestionsByExerciseId(exerciseId);
      const questions = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];

      setExercises((prev) =>
        prev.map((e) =>
          (e.id || e.exerciseId) === exerciseId
            ? {
                ...e,
                questions: questions,
                questionCount: questions.length,
                isLoadingQuestions: false,
              }
            : e
        )
      );
    } catch (error) {
      console.error(error);
      setExercises((prev) =>
        prev.map((e) =>
          (e.id || e.exerciseId) === exerciseId
            ? { ...e, isLoadingQuestions: false }
            : e
        )
      );
    }
  };

  // Mở Modal Thêm/Sửa câu hỏi
  const handleOpenQModal = (exerciseId: number, question?: QuestionType) => {
    setCurrentExerciseId(exerciseId);
    setEditingQuestion(question || null);

    qForm.resetFields(); // ❗ quan trọng

    if (question) {
      qForm.setFieldsValue({
        questionText: question.questionText,
        vocabularyId: question.vocabularyId ?? null,
      });
    }

    setIsQModalOpen(true);
  };

  const handleSaveQuestion = async (values: any) => {
    if (!currentExerciseId) {
      message.error("Không tìm thấy bài tập");
      return;
    }

    setIsQSubmitting(true);

    try {
      const payload = {
        exerciseId: currentExerciseId,
        vocabularyId: values.vocabularyId || null,
        questionText: values.questionText,
      };

      if (editingQuestion) {
        // UPDATE
        await exerciseService.updateQuestion(editingQuestion.id, payload);
        message.success("Cập nhật câu hỏi thành công");
      } else {
        // CREATE
        await exerciseService.createQuestion(payload);
        message.success("Thêm câu hỏi thành công");
      }

      setIsQModalOpen(false);
      await reloadQuestions(currentExerciseId);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi lưu câu hỏi");
    } finally {
      setIsQSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (
    questionId: number,
    exerciseId: number
  ) => {
    try {
      await exerciseService.deleteQuestion(questionId);
      message.success("Đã xóa câu hỏi");
      await reloadQuestions(exerciseId);
    } catch (error) {
      message.error("Lỗi xóa câu hỏi");
    }
  };

  // --- HANDLERS OPTIONS (Quản lý danh sách đáp án riêng lẻ) ---
  const fetchOptions = async (questionId: number) => {
    setLoadingOptions(true);
    try {
      const res = await exerciseService.getOptionsByQuestionId(questionId);
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setOptionList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleOpenOptionModal = (question: QuestionType) => {
    setCurrentQuestionForOption(question);
    setIsOptionModalOpen(true);
    setOptionList([]);
    setEditingOption(null);
    optionForm.resetFields();
    fetchOptions(question.id);
  };

  // THÊM
  const handleCreateOption = async (values: any) => {
    if (!currentQuestionForOption) return;

    try {
      await exerciseService.createOption({
        questionId: currentQuestionForOption!.id,
        optionText: values.optionText, // ĐÚNG TÊN FIELD
        isCorrect: values.isCorrect ?? false,
      });

      message.success("Thêm đáp án thành công");
      form.resetFields();
      fetchOptions(currentQuestionForOption.id);
    } catch (err) {
      message.error("Thêm đáp án thất bại");
    }
  };

  // SỬA
  const handleUpdateOption = async (values: any) => {
    if (!editingOption) return;
    if (!currentQuestionForOption) return;

    try {
      await exerciseService.updateOptions(editingOption.id, {
        questionId: editingOption.question,
        optionText: values.optionText,
        isCorrect: values.isCorrect ?? false,
      });

      message.success("Cập nhật đáp án thành công");
      setEditingOption(null);
      form.resetFields();
      fetchOptions(currentQuestionForOption.id);
    } catch (err) {
      message.error("Cập nhật đáp án thất bại");
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!currentQuestionForOption) return;

    try {
      await exerciseService.deleteOption(optionId);
      message.success("Đã xóa đáp án");
      fetchOptions(currentQuestionForOption.id);
    } catch (e) {
      message.error("Lỗi xóa đáp án");
    }
  };

  // --- COLUMNS ---
  const columns: TableColumnsType<ExerciseType> = [
    {
      title: "Thông tin bài tập",
      dataIndex: "title",
      width: "50%",
      render: (t, r) => (
        <Space direction="vertical" size={0} style={{ width: "100%" }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: "#006d75" }}>
            {t}
          </span>
          {r.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.description}
            </Text>
          )}
          <Space size="small" className="mt-1">
            {r.audioUrl && (
              <Tag color="blue" icon={<SoundOutlined />}>
                Audio
              </Tag>
            )}
            {r.image && (
              <Tag color="cyan" icon={<FileImageOutlined />}>
                Img
              </Tag>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: "Loại bài",
      dataIndex: "type",
      width: 150,
      render: (t) => (
        <Tag>
          {t === 0
            ? "Trắc nghiệm 1 đáp án"
            : t === 4
            ? "Nghe & Trả lời"
            : t === 6
            ? "Viết đoạn văn"
            : "Khác"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      width: 120,
      align: "center",
      render: (_, r) => (
        <Space>
          <Tooltip title="Sửa bài tập">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(r)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa bài tập?"
            description="Xóa bài tập sẽ xóa luôn các câu hỏi bên trong."
            onConfirm={() => handleDeleteExercise(r.id || r.exerciseId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa bài tập">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const questionColumns = (
    exerciseId: number
  ): TableColumnsType<QuestionType> => [
    {
      title: "Nội dung câu hỏi",
      dataIndex: "questionText",
      key: "questionText",
      render: (text) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: "Thao tác",
      width: 140,
      align: "right",
      render: (t, qRecord) => (
        <Space size="small">
          <Tooltip title="Quản lý chi tiết đáp án">
            <Button
              type="dashed"
              size="small"
              icon={<AppstoreAddOutlined />}
              onClick={() => handleOpenOptionModal(qRecord)}
            />
          </Tooltip>
          <Tooltip title="Sửa nội dung câu hỏi & 4 đáp án nhanh">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              className="text-primary"
              onClick={() => handleOpenQModal(exerciseId, qRecord)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa câu hỏi?"
            onConfirm={() => handleDeleteQuestion(qRecord.id, exerciseId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Sidebar show={true} />
      <div
        style={{
          marginLeft: SIDEBAR_WIDTH,
          padding: "24px",
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Title level={4} className="mb-4">
          Quản lý kho bài tập
        </Title>

        {/* --- FILTER SECTION --- */}
        <Card className="mb-4 shadow-sm">
          <Row gutter={16}>
            <Col span={6}>
              <div className="mb-1 fw-bold">1. Kỹ năng</div>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn Skill"
                value={selectedSkillId}
                onChange={(v) => {
                  setExercises([]);
                  setSelectedSkillId(v);
                  setSelectedLevelId(null);
                }}
              >
                {menuData.map((s) => (
                  <SelectOption key={s.id} value={s.id}>
                    {s.name}
                  </SelectOption>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <div className="mb-1 fw-bold">2. Trình độ</div>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn Level"
                value={selectedLevelId}
                disabled={!selectedSkillId}
                onChange={(v) => setSelectedLevelId(v)}
              >
                {menuDataLevel.map((l: any) => (
                  <SelectOption key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </SelectOption>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <div className="mb-1 fw-bold">3. Chủ đề</div>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn Topic"
                value={selectedTopicId}
                disabled={!selectedLevelId}
                onChange={(v) => setSelectedTopicId(v)}
                showSearch
                optionFilterProp="children"
              >
                {topicsList.map((t: any) => (
                  <SelectOption key={t.id} value={t.id}>
                    {t.name}
                  </SelectOption>
                ))}
              </Select>
            </Col>
            <Col span={4} className="d-flex align-items-end">
              <Button
                type="primary"
                block
                icon={<SearchOutlined />}
                onClick={fetchExercises}
                loading={loadingExercises}
                disabled={!selectedTopicId}
              >
                Xem bài tập
              </Button>
            </Col>
          </Row>
        </Card>

        {/* --- EXERCISE TABLE --- */}
        {hasSearched && (
          <Card bordered={false} className="shadow-sm">
            <div className="d-flex align-items-center mb-3">
              <span style={{ fontSize: "14px", fontWeight: 600 }}>
                Kết quả tìm kiếm: {exercises.length} bài tập
              </span>
              <div className="d-flex gap-2 ms-auto">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  Xuất file CSV
                </Button>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  Nhập file CSV
                </Button>
                <Button
                  type="primary"
                  icon={<ImportOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  Tạo bài tập mới
                </Button>
              </div>
            </div>

            <Table
              rowKey={(r) => (r.id || r.exerciseId) as number}
              columns={columns}
              dataSource={exercises}
              loading={loadingExercises}
              pagination={false}
              expandable={{
                expandIcon: ({ expanded, onExpand, record }) =>
                  record.type === 0 ? (
                    <Button
                      type="text"
                      size="small"
                      onClick={(e) => onExpand(record, e)}
                    >
                      {expanded ? "-" : "+"}
                    </Button>
                  ) : null,
                onExpand: handleExpandRow,
                expandedRowRender: (record) => {
                  const exId = record.id || record.exerciseId;
                  return (
                    <Card
                      size="small"
                      type="inner"
                      title={
                        <span style={{ fontSize: 13 }}>
                          <UnorderedListOutlined /> Danh sách câu hỏi
                        </span>
                      }
                      extra={
                        <Button
                          size="small"
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => handleOpenQModal(exId)}
                        >
                          Thêm câu hỏi
                        </Button>
                      }
                      style={{ margin: 0, background: "#fafafa" }}
                    >
                      {record.isLoadingQuestions ? (
                        <div className="text-center py-3">
                          <Spin tip="Đang tải câu hỏi..." />
                        </div>
                      ) : (
                        <Table
                          rowKey="id"
                          columns={questionColumns(exId)}
                          dataSource={record.questions || []}
                          pagination={false}
                          locale={{
                            emptyText: (
                              <Empty
                                description="Chưa có câu hỏi nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                              />
                            ),
                          }}
                        />
                      )}
                    </Card>
                  );
                },
              }}
            />
          </Card>
        )}

        {/* --- MODAL EXERCISE --- */}
        <Modal
          title={editingExercise ? "Cập nhật bài tập" : "Tạo bài tập mới"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSaveExercise}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Tên bài tập"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Ví dụ: Listening Test 1" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Loại bài (Type ID)"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <SelectOption value={0}>
                      Trắc nghiệm chọn 1 đáp án
                    </SelectOption>
                    <SelectOption value={4}>Nói</SelectOption>
                    <SelectOption value={6}>Viết đoạn văn</SelectOption>
                  </Select>
                </Form.Item>
              </Col>
              {selectedSkillId === 0 && (
                <Col span={12}>
                  <Form.Item name="groupWord" label="Group Word ID">
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Form.Item name="description" label="Mô tả / Hướng dẫn">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Media">
              <Space>
                <Upload
                  listType="picture"
                  maxCount={1}
                  fileList={fileListImage}
                  beforeUpload={(f) => {
                    setFileListImage([f]);
                    return false;
                  }}
                  onRemove={() => setFileListImage([])}
                >
                  <Button icon={<FileImageOutlined />}>Ảnh</Button>
                </Upload>
                <Upload
                  maxCount={1}
                  fileList={fileListAudio}
                  beforeUpload={(f) => {
                    setFileListAudio([f]);
                    return false;
                  }}
                  onRemove={() => setFileListAudio([])}
                >
                  <Button icon={<SoundOutlined />}>Audio</Button>
                </Upload>
              </Space>
            </Form.Item>
            <div className="text-end">
              <Button onClick={() => setIsModalOpen(false)} className="me-2">
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                icon={<SaveOutlined />}
              >
                {editingExercise ? "Lưu" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* --- MODAL QUESTION (EDIT/CREATE) --- */}
        <Modal
          title={editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi trắc nghiệm"}
          open={isQModalOpen}
          onCancel={() => setIsQModalOpen(false)}
          footer={null}
          destroyOnClose
          width={600}
        >
          <Form form={qForm} layout="vertical" onFinish={handleSaveQuestion}>
            <Form.Item
              name="questionText"
              label="Nội dung câu hỏi"
              rules={[{ required: true, message: "Vui lòng nhập câu hỏi" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <div className="text-end mt-3">
              <Button onClick={() => setIsQModalOpen(false)} className="me-2">
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isQSubmitting}
                icon={<SaveOutlined />}
              >
                {editingQuestion ? "Cập nhật câu hỏi" : "Tạo câu hỏi"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* --- MODAL OPTION (MANAGE LIST) --- */}
        <Modal
          title="Quản lý chi tiết đáp án"
          open={isOptionModalOpen}
          onCancel={() => {
            setIsOptionModalOpen(false);
            setEditingOption(null);
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
          {/* FORM thêm / sửa */}
          <Card
            size="small"
            style={{
              marginBottom: 16,
              background: editingOption ? "#e6f7ff" : "#f6ffed",
              border: editingOption ? "1px solid #91d5ff" : "1px solid #b7eb8f",
            }}
          >
            <div
              className="mb-2 fw-bold"
              style={{ color: editingOption ? "#1890ff" : "#52c41a" }}
            >
              {editingOption
                ? `Đang sửa đáp án ID: ${editingOption.id}`
                : "Thêm đáp án mới"}
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={editingOption ? handleUpdateOption : handleCreateOption}
            >
              <Form.Item
                name="optionText"
                label="Nội dung đáp án"
                rules={[{ required: true, message: "Nhập nội dung đáp án" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="isCorrect"
                label="Đáp án đúng"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit">
                  {editingOption ? "Cập nhật" : "Thêm mới"}
                </Button>
                {editingOption && (
                  <Button
                    onClick={() => {
                      setEditingOption(null);
                      form.resetFields();
                    }}
                  >
                    Huỷ sửa
                  </Button>
                )}
              </Space>
            </Form>
          </Card>

          {/* DANH SÁCH */}
          <Divider orientation="left" plain>
            Danh sách đáp án
          </Divider>

          <Table
            rowKey="id"
            loading={loadingOptions}
            dataSource={optionList}
            pagination={false}
            size="small"
            columns={[
              {
                title: "Nội dung",
                dataIndex: "optionText",
              },
              {
                title: "Đúng",
                dataIndex: "isCorrect",
                width: 80,
                render: (v) => (v ? "✔" : ""),
              },
              {
                title: "Hành động",
                width: 140,
                render: (_, record) => (
                  <Space>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingOption(record);
                        form.setFieldsValue(record);
                      }}
                    >
                      Sửa
                    </Button>
                    <Popconfirm
                      title="Xoá đáp án?"
                      onConfirm={() => handleDeleteOption(record.id)}
                    >
                      <Button danger size="small">
                        Xoá
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            locale={{
              emptyText: (
                <Empty
                  description="Chưa có đáp án nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Modal>
      </div>
    </>
  );
}
