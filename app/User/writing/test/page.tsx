// FILE: /app/User/writing/test/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Spin,
  Button,
  Modal,
  Divider,
  Tag,
  Typography,
  Card,
} from "antd";
import {
  ExperimentOutlined,
  RedoOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";

import api from "@/app/services/api";
import flashAPI from "@/app/services/api/flashAPI";
import WritingComponent from "@/app/components/exerciseCard/exWrite";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";

import "bootstrap/dist/css/bootstrap.min.css";

const { Text } = Typography;

interface WritingExerciseData {
  exerciseId: number;
  title: string;
  description: string;
  topic: string;
  level?: string;
  instructions?: string;
}

interface WritingResultResponse {
  grammar_score: number;
  vocab_score: number;
  coherence_score: number;
  relevance_score: number;
  feedback: string;
  corrected_version: string;
}

// Interface cho Modal (điểm số Writing)
interface WritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: WritingResultResponse;
  onRedo: () => void;
}

const WritingResultModal: React.FC<WritingModalProps> = ({
  isOpen,
  onClose,
  result,
  onRedo,
}) => {
  const getAntdColor = (score: number) => {
    if (score >= 7) return "green";
    if (score >= 5) return "gold";
    return "red";
  };

  const PRIMARY_COLOR_WRITING = "#0056b3"; // Màu xanh dương cho Writing

  const formatFeedback = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Tính điểm tổng quan giả định (hoặc lấy từ BE nếu có)
  const overallScore = Math.round(
    (result.grammar_score +
      result.vocab_score +
      result.coherence_score +
      result.relevance_score) /
      4
  );
  const MODAL_CONTENT_MAX_HEIGHT = "70vh";
  return (
    <Modal
      title={
        <>
          <ExperimentOutlined /> Kết Quả Phân Tích Bài Viết
        </>
      }
      open={isOpen}
      onCancel={onClose}
      width={850}
      footer={[
        <Button key="close" onClick={onClose}>
          {" "}
          Đóng{" "}
        </Button>,
        <Button key="redo" onClick={onRedo} type="primary" danger>
          <RedoOutlined /> Làm lại bài
        </Button>,
      ]}
    >
      <div
        className="py-2"
        style={{ maxHeight: MODAL_CONTENT_MAX_HEIGHT, overflowY: "auto" }}
      >
        <h3
          className="text-center fw-bold mb-3"
          style={{
            color: PRIMARY_COLOR_WRITING,
          }}
        >
          Điểm Tổng Quan:{" "}
          <Tag color={getAntdColor(overallScore)} style={{ fontSize: "1.2em" }}>
            {overallScore}
          </Tag>
        </h3>

        <Divider orientation="left">Phân Tích Chi Tiết</Divider>

        {/* Bảng điểm chi tiết */}
        <div className="row row-cols-2 g-2 mb-4">
          {[
            { label: "Ngữ pháp", key: "grammar_score" },
            { label: "Từ vựng", key: "vocab_score" },
            { label: "Mạch lạc", key: "coherence_score" },
            { label: "Độ liên quan", key: "relevance_score" },
          ].map(({ label, key }) => {
            const score = result[key as keyof WritingResultResponse] as number;

            return (
              <div className="col" key={key}>
                <Card size="small" className="text-center shadow-sm h-100">
                  <Text strong>{label}</Text>
                  <div
                    className="fs-5 fw-bold mt-1"
                    style={{
                      color:
                        getAntdColor(score) === "green"
                          ? "#52c41a"
                          : getAntdColor(score) === "gold"
                          ? "#faad14"
                          : "#ff4d4f",
                    }}
                  >
                    {score}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <Divider orientation="left">Phản Hồi & Đề Xuất</Divider>

        <Alert
          message="Nhận xét của AI"
          description={formatFeedback(result.feedback)}
          type="info"
          showIcon
          className="mb-3"
        />

        <Alert
          message="Phiên bản chỉnh sửa"
          description={formatFeedback(result.corrected_version)}
          type="warning"
          showIcon
        />
      </div>
    </Modal>
  );
};

export default function WritingTestPage() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");

  const [exerciseData, setExerciseData] = useState<WritingExerciseData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [transcript, setTranscript] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [writingResult, setWritingResult] =
    useState<WritingResultResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExercise = useCallback(async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res: AxiosResponse<WritingExerciseData[]> = await api.get(
        `/quiz-tree/getByTopic/${topicId}`
      );
      const raw = res.data?.[0];

      if (raw) {
        setExerciseData({
          ...raw,
          level: raw.level || "General",
          instructions: raw.instructions || raw.title,
        });
      } else {
        setError("Không tìm thấy bài tập Viết.");
      }
    } catch (err) {
      setError("Lỗi tải bài tập từ server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (topicId) fetchExercise(topicId);
    else setError("Không tìm thấy topicId.");
  }, [topicId, fetchExercise]);

  const handleSubmitWriting = async () => {
    if (!exerciseData || isSubmitting || transcript.trim().length === 0) return;

    const payload = {
      exerciseId: exerciseData.exerciseId,
      transcript: transcript,
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const res: AxiosResponse<WritingResultResponse> =
        await flashAPI.submitWriting(payload);

      setWritingResult(res.data);
      setIsModalOpen(true);
      alert("Nộp bài thành công.");
    } catch (err) {
      console.error("Submit Error:", err);
      setError("Lỗi khi nộp bài lên server.");
      alert("Nộp bài thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // RESET
  const resetQuizAndFetch = () => {
    if (!topicId) return;
    setWritingResult(null);
    setTranscript("");
    setIsModalOpen(false);
    fetchExercise(topicId);
  };

  if (loading)
    return (
      <div className="text-center py-5" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
        <p className="mt-2">Đang tải bài tập...</p>
      </div>
    );
  if (error)
    return (
      <div className="container py-5">
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  if (!exerciseData) return null;

  return (
    <>
      <MainHeader />

      {/* Modal hiện kết quả */}
      {isModalOpen && writingResult && (
        <WritingResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          result={writingResult}
          onRedo={resetQuizAndFetch}
        />
      )}

      <WritingComponent
        exercise={exerciseData}
        transcript={transcript}
        setTranscript={setTranscript}
        onSubmit={handleSubmitWriting}
        isSubmitting={isSubmitting}
      />

      <MainFooter />
    </>
  );
}
