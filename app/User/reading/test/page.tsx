"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Spin, Divider, Button, Modal, Tag } from "antd";
import {
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";

import api from "@/app/services/api";
import flashAPI from "@/app/services/api/flashAPI";
import ReadingQuizComponent from "@/app/components/exerciseCard/exRead";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";

import "bootstrap/dist/css/bootstrap.min.css";
import ProtectedRoute from "@/app/routes/ProtectedRoute";

interface Option {
  optionId: number;
  optionText: string;
}
interface QuestionNode {
  questionId: number;
  questionText: string;
  options: Option[];
}
interface ExerciseData {
  exerciseId: number;
  topic: string;
  title: string;
  description: string;
  subQuestionNodes: QuestionNode[];
}
interface QuestionResult {
  questionId: number;
  selectedOptionId: number;
  correct: boolean;
  correctOptionId?: number;
}
interface SubmitResponse {
  exerciseId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: QuestionResult[];
}
interface Result {
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: Result;
  detailedResults: QuestionResult[];
  questions: QuestionNode[];
  onRedo: () => void;
}

const ResultModal = ({
  isOpen,
  onClose,
  result,
  detailedResults,
  questions,
  onRedo,
}: ResultModalProps) => {
  if (!result) return null;

  const correctCount = result.correctCount;
  const incorrectCount = result.totalQuestions - correctCount;

  const getQuestionText = (qId: number) => {
    const question = questions.find((q) => q.questionId === qId);
    return question
      ? question.questionText || `Câu hỏi ID ${qId}`
      : `Câu hỏi ID ${qId}`;
  };

  const getOptionText = (qId: number, oId: number) => {
    const question = questions.find((q) => q.questionId === qId);
    const option = question?.options.find((o) => o.optionId === oId);
    return option ? option.optionText : "Không xác định";
  };

  return (
    <Modal
      title="🎯 Kết Quả Bài Làm Đọc Hiểu"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng và Xem Đáp Án
        </Button>,
        <Button key="redo" onClick={onRedo} type="primary" danger>
          <RedoOutlined className="me-1" /> Làm lại bài tập
        </Button>,
      ]}
      width={700}
    >
      <div className="text-center py-2">
        <CheckCircleOutlined style={{ fontSize: "50px", color: "#52c41a" }} />
        <h3 className="mt-2 mb-3 fw-bold">BÀI LÀM ĐÃ ĐƯỢC CHẤM</h3>

        <div className="row justify-content-center mb-4">
          <div className="col-4">
            <div className="card p-3 shadow-sm border-0">
              <div className="fs-1 fw-bold text-success">
                {Math.round(result.score)}
              </div>
              <div className="text-muted">Điểm Số</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card p-3 shadow-sm border-0">
              <div className="fs-1 fw-bold text-primary">{correctCount}</div>
              <div className="text-muted">Câu Đúng</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card p-3 shadow-sm border-0">
              <div className="fs-1 fw-bold text-danger">{incorrectCount}</div>
              <div className="text-muted">Câu Sai</div>
            </div>
          </div>
        </div>

        <Divider>Lịch sử làm bài chi tiết</Divider>

        <div
          style={{ maxHeight: "300px", overflowY: "auto", textAlign: "left" }}
        >
          {detailedResults.map((res, index) => (
            <Alert
              key={res.questionId}
              message={`Câu ${index + 1}: ${getQuestionText(res.questionId)}`}
              description={
                <div>
                  <p className="m-0" style={{ color: "#00bfff" }}>
                    Đáp án bạn chọn:
                    <Tag
                      color={res.correct ? "success" : "error"}
                      className="ms-2"
                    >
                      {getOptionText(res.questionId, res.selectedOptionId)}
                    </Tag>
                    {res.correctOptionId && !res.correct && (
                      <Tag color="green" className="ms-2">
                        Đúng:{" "}
                        {getOptionText(res.questionId, res.correctOptionId)}
                      </Tag>
                    )}
                  </p>
                </div>
              }
              type={res.correct ? "success" : "error"}
              icon={
                res.correct ? <CheckCircleOutlined /> : <CloseCircleOutlined />
              }
              className="mb-2"
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default function ReadingTestPage() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");

  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [detailedResults, setDetailedResults] = useState<QuestionResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExercise = useCallback(async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res: AxiosResponse<ExerciseData[]> = await api.get(
        `/quiz-tree/getByTopic/${topicId}`,
      );
      if (res.data && res.data.length > 0) {
        setExerciseData(res.data[0]);
      } else {
        setError("Không có dữ liệu bài tập Reading.");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("Lỗi khi tải nội dung bài kiểm tra từ server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitToBackend = async (
    exerciseId: number,
    answers: Record<number, number>,
  ) => {
    const userAnswersArray = Object.entries(answers).map(([qId, oId]) => ({
      questionId: parseInt(qId),
      selectedOptionId: oId,
    }));

    const payload = [{ exerciseId: exerciseId, answers: userAnswersArray }];

    setSubmitting(true);
    try {
      const response: AxiosResponse<SubmitResponse[]> =
        await flashAPI.submitQuiz(payload);

      if (response.data && response.data.length > 0) {
        const beResult = response.data[0];

        const newResult: Result = {
          score: beResult.score,
          totalQuestions: beResult.totalQuestions,
          correctCount: beResult.correctCount,
          incorrectCount: beResult.totalQuestions - beResult.correctCount,
        };

        setResult(newResult);
        setDetailedResults(beResult.results);
        setIsSubmitted(true);
        setIsModalOpen(true);
      } else {
        throw new Error("Phản hồi từ BE không chứa dữ liệu kết quả chấm điểm.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi kết quả lên server:", error);
      setError("Lỗi: Không thể chấm điểm và lưu lịch sử.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuizAndFetch = () => {
    if (!topicId) return;

    setIsSubmitted(false);
    setResult(null);
    setDetailedResults([]);
    setUserAnswers({});
    setIsModalOpen(false);
    fetchExercise(topicId);
  };

  const handleSelectOption = useCallback(
    (questionId: number, value: number) => {
      if (isSubmitted) return;
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: value,
      }));
    },
    [isSubmitted],
  );

  const handleSubmitQuiz = () => {
    if (!exerciseData || isSubmitted || submitting) return;

    if (
      Object.keys(userAnswers).length < exerciseData.subQuestionNodes.length
    ) {
      if (
        !window.confirm(
          `Bạn chưa trả lời hết các câu hỏi. Bạn có muốn nộp bài?`,
        )
      ) {
        return;
      }
    }
    submitToBackend(exerciseData.exerciseId, userAnswers);
  };

  useEffect(() => {
    if (topicId) {
      fetchExercise(topicId);
    } else {
      setError("Không tìm thấy ID chủ đề (Topic ID).");
      setLoading(false);
    }
  }, [topicId, fetchExercise]);

  if (loading) {
    return (
      <div
        className="text-center py-5"
        style={{ minHeight: "100vh", marginTop: "10%" }}
      >
        <Spin size="large" />
        <p className="mt-2">Đang tải bài kiểm tra...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="container py-5"
        style={{ minHeight: "100vh", marginTop: "5%" }}
      >
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }
  if (!exerciseData) return null;

  return (
    <>
      <ProtectedRoute>
        <MainHeader />
        <div
          style={{
            marginTop: "3.3%",
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            paddingBottom: "50px",
          }}
        >
          {isModalOpen && result && exerciseData && (
            <ResultModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              result={result}
              detailedResults={detailedResults}
              questions={exerciseData.subQuestionNodes}
              onRedo={resetQuizAndFetch}
            />
          )}

          <ReadingQuizComponent
            exercise={exerciseData}
            userAnswers={userAnswers}
            isSubmitted={isSubmitted}
            onSelectOption={handleSelectOption}
            detailedResults={detailedResults}
            onSubmit={handleSubmitQuiz}
            submitting={submitting}
          />
        </div>
        <MainFooter />
      </ProtectedRoute>
    </>
  );
}
