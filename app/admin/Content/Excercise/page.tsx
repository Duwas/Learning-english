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
  Badge,
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
} from "@ant-design/icons";
import Sidebar from "@/app/components/sidebar/page";

// --- IMPORT SERVICES ---
import { exerciseService } from "@/app/services/api/adminExAPI";
import { topicService } from "@/app/services/api/topicService";
import topbarApi from "@/app/services/api/topbar";
import type { TableColumnsType, UploadFile } from "antd";

const { Title, Text, Paragraph } = Typography;
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
  questionId: number;
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
  const [qForm] = Form.useForm();

  // --- STATE MODAL OPTION (Quản lý riêng lẻ) ---
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [currentQuestionForOption, setCurrentQuestionForOption] =
    useState<QuestionType | null>(null);
  const [optionList, setOptionList] = useState<OptionType[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionForm] = Form.useForm();
  const handleDeleteExercise = async (id: number) => {
    try {
      await exerciseService.deleteById(id);
      message.success("Đã xóa bài tập thành công!");

      fetchExercises();
    } catch (error) {
      console.error(error);
      message.error("Xóa bài tập thất bại. Vui lòng thử lại.");
    }
  };
  // 1. INIT DATA
  useEffect(() => {
    const fetchMenu = async () => {
      setLoadingMenu(true);
      try {
        const res = await topbarApi.getAll();
        setMenuData(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  const currentLevels = React.useMemo(() => {
    if (!selectedSkillId) return [];
    const skill = menuData.find((s) => s.skillId === selectedSkillId);
    return skill ? skill.levels : [];
  }, [selectedSkillId, menuData]);

  // 2. LOAD TOPICS
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSkillId || !selectedLevelId) {
        setTopicsList([]);
        setSelectedTopicId(null);
        return;
      }
      try {
        const res = await topicService.getBySkillAndLevel(
          selectedSkillId,
          selectedLevelId
        );
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
      const res = await exerciseService.getExercisesByTopic(selectedTopicId);
      let rawData = [];
      if (Array.isArray(res.data)) rawData = res.data;
      else if (res.data?.data && Array.isArray(res.data.data))
        rawData = res.data.data;

      const safeData: ExerciseType[] = rawData.map((item: any) => ({
        ...item,
        id: item.id || item.exerciseId,
        exerciseId: item.exerciseId || item.id,
        topicId: item.topicId || selectedTopicId, // Lưu topicId vào state để dùng sau này
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

  // --- HANDLERS BÀI TẬP ---
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
    } else {
      setEditingExercise(null);
      form.setFieldsValue({
        topicId: selectedTopicId,
        type: selectedSkillId ? (selectedSkillId === 1 ? 1 : 2) : 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveExercise = async (values: any) => {
    setIsSubmitting(true);
    try {
      const params: ExerciseParams = {
        title: values.title,
        type: values.type,
        groupWord: values.groupWord || 0,
        topicId: values.topicId,
        description: values.description,
      };
      const imgFile = fileListImage[0]?.originFileObj;
      const audFile = fileListAudio[0]?.originFileObj;

      if (editingExercise) {
        const id = editingExercise.id || editingExercise.exerciseId;
        await exerciseService.update(id, params, imgFile, audFile);
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

  // --- HANDLERS CÂU HỎI & OPTION ---

  const handleExpandRow = async (expanded: boolean, record: ExerciseType) => {
    if (expanded) {
      const newExercises = [...exercises];
      const index = newExercises.findIndex(
        (e) => (e.id || e.exerciseId) === (record.id || record.exerciseId)
      );
      if (index === -1) return;

      newExercises[index].isLoadingQuestions = true;
      setExercises(newExercises);

      try {
        const exId = record.id || record.exerciseId;
        const res = await exerciseService.getQuestionsByExerciseId(exId);
        const questions = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];

        const updatedExercises = [...exercises];
        updatedExercises[index].questions = questions;
        updatedExercises[index].questionCount = questions.length;
        updatedExercises[index].isLoadingQuestions = false;
        setExercises(updatedExercises);
      } catch (error) {
        console.error(error);
        const updatedExercises = [...exercises];
        updatedExercises[index].isLoadingQuestions = false;
        setExercises(updatedExercises);
      }
    }
  };

  const reloadQuestions = async (exerciseId: number) => {
    const index = exercises.findIndex(
      (e) => (e.id || e.exerciseId) === exerciseId
    );
    if (index === -1) return;
    try {
      const res = await exerciseService.getQuestionsByExerciseId(exerciseId);
      const questions = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];
      const updatedExercises = [...exercises];
      updatedExercises[index].questions = questions;
      updatedExercises[index].questionCount = questions.length;
      setExercises(updatedExercises);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenQModal = (exerciseId: number, question?: QuestionType) => {
    qForm.resetFields();
    setCurrentExerciseId(exerciseId);

    if (question) {
      setEditingQuestion(question);
      qForm.setFieldsValue({
        questionText: question.questionText,
        vocabularyId: question.vocabularyId,
        questionType: question.questionType,
      });
    } else {
      setEditingQuestion(null);
      qForm.setFieldsValue({
        questionType: "multiple_choice",
        correctAnswer: "A",
      });
    }
    setIsQModalOpen(true);
  };

  // *** HÀM QUAN TRỌNG: TẠO CÂU HỎI + ĐÁP ÁN ***
  const handleSaveQuestion = async (values: any) => {
    if (!currentExerciseId) {
      message.error("Lỗi: Không tìm thấy bài tập.");
      return;
    }

    // 1. TÌM EXERCISE ĐANG CHỈNH SỬA ĐỂ LẤY TOPIC ID
    const currentEx = exercises.find(
      (e) => e.id === currentExerciseId || e.exerciseId === currentExerciseId
    );

    // Fallback: Nếu không tìm thấy trong list (hiếm), dùng selectedTopicId đang filter
    const topicIdToUse = currentEx?.topicId || selectedTopicId;

    if (!topicIdToUse) {
      message.error(
        "Lỗi: Không xác định được Topic ID. Vui lòng kiểm tra lại bài tập."
      );
      return;
    }

    setIsQSubmitting(true);

    try {
      // B1: Chuẩn bị payload câu hỏi (có topicId)
      const questionPayload = {
        topicId: topicIdToUse, // <--- Lấy từ bài tập đang sửa
        exerciseId: currentExerciseId,
        vocabularyId: values.vocabularyId || 0,
        questionText: values.questionText,
      };

      let questionId = 0;

      if (editingQuestion) {
        await exerciseService.updateQuestion(
          editingQuestion.id,
          questionPayload
        );
        questionId = editingQuestion.id;
        message.success("Cập nhật câu hỏi thành công");
      } else {
        const resQ = await exerciseService.createQuestion(questionPayload);
        // Lấy ID từ response (resQ.data.id hoặc resQ.data)
        questionId =
          resQ.data?.id ||
          resQ.data?.questionId ||
          (typeof resQ.data === "number" ? resQ.data : 0);

        if (questionId) {
          const optionsData = [
            { text: values.optionA, label: "A" },
            { text: values.optionB, label: "B" },
            { text: values.optionC, label: "C" },
            { text: values.optionD, label: "D" },
          ];

          // Tạo 4 đáp án
          for (const opt of optionsData) {
            if (opt.text) {
              await exerciseService.createOption({
                questionId: questionId,
                optionText: opt.text,
                isCorrect: values.correctAnswer === opt.label,
              });
            }
          }
          message.success("Thêm câu hỏi và đáp án thành công!");
        } else {
          message.warning(
            "Tạo câu hỏi xong nhưng không lấy được ID để tạo đáp án."
          );
        }
      }

      setIsQModalOpen(false);
      await reloadQuestions(currentExerciseId);
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        message.error(`Lỗi Server: ${error.response.status}`);
      } else {
        message.error("Lỗi khi lưu dữ liệu");
      }
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

  // --- HANDLERS RIÊNG CHO MODAL QUẢN LÝ ĐÁP ÁN (NẾU CẦN SỬA LẺ) ---
  const handleOpenOptionModal = async (question: QuestionType) => {
    setCurrentQuestionForOption(question);
    setIsOptionModalOpen(true);
    setOptionList([]);
    optionForm.resetFields();
    setLoadingOptions(true);
    try {
      const res = await exerciseService.getOptionsByQuestionId(question.id);
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setOptionList(data);
    } catch (e) {
      message.error("Không tải được đáp án");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSaveOption = async (values: any) => {
    if (!currentQuestionForOption) return;
    try {
      await exerciseService.createOption({
        questionId: currentQuestionForOption.id,
        optionText: values.optionText,
        isCorrect: values.isCorrect || false,
      });
      message.success("Đã thêm đáp án");
      optionForm.resetFields();

      const res = await exerciseService.getOptionsByQuestionId(
        currentQuestionForOption.id
      );
      setOptionList(
        Array.isArray(res.data) ? res.data : res.data?.content || []
      );
    } catch (e) {
      message.error("Lỗi thêm đáp án");
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!currentQuestionForOption) return;
    try {
      await exerciseService.deleteOption(optionId);
      message.success("Đã xóa đáp án");
      const res = await exerciseService.getOptionsByQuestionId(
        currentQuestionForOption.id
      );
      setOptionList(
        Array.isArray(res.data) ? res.data : res.data?.content || []
      );
    } catch (e) {
      message.error("Lỗi xóa đáp án");
    }
  };

  // --- TABLE COLUMNS ---
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
      title: "Số câu",
      dataIndex: "questionCount",
      width: 100,
      align: "center",
      render: (c, r) => {
        const displayCount =
          r.questions && r.questions.length > 0 ? r.questions.length : c || 0;
        return displayCount > 0 ? (
          <Badge count={displayCount} showZero color="#52c41a" />
        ) : (
          <Tag>Trống</Tag>
        );
      },
    },
    {
      title: "Hành động",
      width: 120, // Tăng độ rộng để chứa 2 nút
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
            description="Hành động này sẽ xóa cả các câu hỏi bên trong."
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
      title: "Loại câu",
      dataIndex: "questionType",
      width: 130,
      render: (t) => <Tag>{t === "multiple_choice" ? "Trắc nghiệm" : t}</Tag>,
    },
    {
      title: "Thao tác",
      width: 120,
      align: "right",
      render: (_, qRecord) => (
        <Space size="small">
          <Tooltip title="Xem/Sửa đáp án">
            <Button
              type="dashed"
              size="small"
              icon={<AppstoreAddOutlined />}
              onClick={() => handleOpenOptionModal(qRecord)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            className="text-primary"
            onClick={() => handleOpenQModal(exerciseId, qRecord)}
          />
          <Popconfirm
            title="Xóa câu hỏi này?"
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

  const optionColumns: TableColumnsType<OptionType> = [
    { title: "Nội dung", dataIndex: "optionText", key: "optionText" },
    {
      title: "Đúng/Sai",
      dataIndex: "isCorrect",
      key: "isCorrect",
      width: 100,
      align: "center",
      render: (isCorrect) =>
        isCorrect ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đúng
          </Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Sai
          </Tag>
        ),
    },
    {
      title: "Xóa",
      key: "action",
      width: 60,
      align: "center",
      render: (_, r) => (
        <Popconfirm title="Xóa?" onConfirm={() => handleDeleteOption(r.id)}>
          <Button size="small" type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
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

        <Card className="mb-4 shadow-sm">
          <Row gutter={16}>
            <Col span={6}>
              <div className="mb-1 fw-bold">1. Kỹ năng</div>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn Skill"
                value={selectedSkillId}
                onChange={(v) => {
                  setSelectedSkillId(v);
                  setSelectedLevelId(null);
                }}
              >
                {menuData.map((s) => (
                  <SelectOption key={s.skillId} value={s.skillId}>
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
                {currentLevels.map((l: any) => (
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

        {hasSearched && (
          <Card bordered={false} className="shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontSize: "14px", fontWeight: 600 }}>
                Kết quả tìm kiếm {exercises.length} bài tập
              </span>
              {exercises.length === 0 && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  Tạo bài tập mới
                </Button>
              )}
            </div>

            <Table
              rowKey={(r) => (r.id || r.exerciseId) as number}
              columns={columns}
              dataSource={exercises}
              loading={loadingExercises}
              pagination={false}
              expandable={{
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
                  name="topicId"
                  label="Topic ID"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    disabled={!!selectedTopicId && !editingExercise}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Loại bài (Type ID)"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <SelectOption value={1}>1 - Listening</SelectOption>
                    <SelectOption value={2}>2 - Speaking</SelectOption>
                    <SelectOption value={3}>3 - Reading</SelectOption>
                    <SelectOption value={4}>4 - Writing</SelectOption>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="groupWord" label="Group Word ID">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
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
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="vocabularyId" label="Vocabulary ID">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="questionType" label="Loại câu hỏi">
                  <Select>
                    <SelectOption value="multiple_choice">
                      Trắc nghiệm
                    </SelectOption>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {!editingQuestion && (
              <>
                <Divider orientation="left" style={{ margin: "10px 0" }}>
                  Nhập 4 đáp án & Chọn đáp án đúng
                </Divider>
                <Form.Item
                  name="correctAnswer"
                  rules={[
                    { required: true, message: "Vui lòng chọn đáp án đúng" },
                  ]}
                >
                  <Radio.Group style={{ width: "100%" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Row align="middle" gutter={8}>
                        <Col flex="30px">
                          <Radio value="A">A.</Radio>
                        </Col>
                        <Col flex="auto">
                          <Form.Item
                            name="optionA"
                            noStyle
                            rules={[
                              { required: true, message: "Nhập đáp án A" },
                            ]}
                          >
                            <Input placeholder="Đáp án A" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row align="middle" gutter={8}>
                        <Col flex="30px">
                          <Radio value="B">B.</Radio>
                        </Col>
                        <Col flex="auto">
                          <Form.Item
                            name="optionB"
                            noStyle
                            rules={[
                              { required: true, message: "Nhập đáp án B" },
                            ]}
                          >
                            <Input placeholder="Đáp án B" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row align="middle" gutter={8}>
                        <Col flex="30px">
                          <Radio value="C">C.</Radio>
                        </Col>
                        <Col flex="auto">
                          <Form.Item
                            name="optionC"
                            noStyle
                            rules={[
                              { required: true, message: "Nhập đáp án C" },
                            ]}
                          >
                            <Input placeholder="Đáp án C" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row align="middle" gutter={8}>
                        <Col flex="30px">
                          <Radio value="D">D.</Radio>
                        </Col>
                        <Col flex="auto">
                          <Form.Item
                            name="optionD"
                            noStyle
                            rules={[
                              { required: true, message: "Nhập đáp án D" },
                            ]}
                          >
                            <Input placeholder="Đáp án D" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </>
            )}

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
                {editingQuestion ? "Cập nhật" : "Tạo câu hỏi & Đáp án"}
              </Button>
            </div>
          </Form>
        </Modal>

        <Modal
          title={`Quản lý đáp án`}
          open={isOptionModalOpen}
          onCancel={() => setIsOptionModalOpen(false)}
          footer={null}
          width={600}
        >
          <Card
            size="small"
            style={{
              marginBottom: 16,
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
            }}
          >
            <Form form={optionForm} layout="inline" onFinish={handleSaveOption}>
              <Form.Item
                name="optionText"
                rules={[{ required: true, message: "Nhập đáp án" }]}
                style={{ flex: 1 }}
              >
                <Input
                  placeholder="Đáp án (A, B...)"
                  prefix={<PlusOutlined className="text-muted" />}
                />
              </Form.Item>
              <Form.Item name="isCorrect" valuePropName="checked">
                <Switch
                  checkedChildren="Đúng"
                  unCheckedChildren="Sai"
                  defaultChecked={false}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Divider orientation="left" plain>
            Danh sách đáp án hiện tại
          </Divider>
          <Table
            rowKey="id"
            loading={loadingOptions}
            dataSource={optionList}
            columns={optionColumns}
            pagination={false}
            size="small"
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
