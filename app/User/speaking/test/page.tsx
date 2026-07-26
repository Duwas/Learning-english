"use client";

import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
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
  message,
} from "antd";
import { ExperimentOutlined, RedoOutlined } from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";

import api from "@/app/services/api";
import flashAPI from "@/app/services/api/flashAPI";
import SpeakingComponent from "@/app/components/exerciseCard/exSpeak";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";

// import "bootstrap/dist/css/bootstrap.min.css";
import ProtectedRoute from "@/app/routes/ProtectedRoute";

const { Text, Title } = Typography;

interface SpeakingResultResponse {
  transcript: string;
  overall_score: number;
  pronunciation_score: number;
  speaking_speed_wpm: number;
  pause_count: number;
  grammar_score: number;
  vocab_score: number;
  coherence_score: number;
  relevance_score: number;
  feedback: string;
  corrected_version: string;

  [key: string]: string | number;
}

interface SpeakingExerciseData {
  exerciseId: number;
  title: string;
  description: string;
  topic: string;
  level?: string;
  instructions?: string;
}

interface SpeakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SpeakingResultResponse;
  onRedo: () => void;
}

const SpeakingResultModal: React.FC<SpeakingModalProps> = ({
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

  const PRIMARY_COLOR_MODAL = "#5e35b1";

  const formatFeedback = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const MODAL_CONTENT_MAX_HEIGHT = "70vh";

  return (
    <Modal
      title={
        <>
          <ExperimentOutlined /> Kết Quả Phân Tích Bài Nói
        </>
      }
      open={isOpen}
      onCancel={onClose}
      width={850}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
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
          style={{ color: PRIMARY_COLOR_MODAL }}
        >
          Điểm Tổng Quan:{" "}
          <Tag
            color={getAntdColor(result.overall_score)}
            style={{ fontSize: "1.2em" }}
          >
            {result.overall_score}
          </Tag>
        </h3>

        <Divider orientation="left">Phân Tích Chi Tiết</Divider>

        {/* Bảng điểm chi tiết */}
        <div className="row row-cols-3 g-2 mb-4">
          {[
            { label: "Phát âm", key: "pronunciation_score", isDecimal: false },
            { label: "Ngữ pháp", key: "grammar_score", isDecimal: false },
            { label: "Từ vựng", key: "vocab_score", isDecimal: false },
            { label: "Mạch lạc", key: "coherence_score", isDecimal: false },
            { label: "Liên quan", key: "relevance_score", isDecimal: false },
          ].map(({ label, key, isDecimal }) => {
            const rawScore = result[key] as number;

            const displayedScore = isDecimal
              ? Math.round(rawScore * 100)
              : rawScore;
            const colorScore = isDecimal ? displayedScore : rawScore;
            const scoreUnit = isDecimal ? "%" : "";

            return (
              <div className="col" key={key}>
                <Card size="small" className="text-center shadow-sm h-100">
                  <Text strong>{label}</Text>
                  <div
                    className="fs-5 fw-bold mt-1"
                    style={{
                      color:
                        getAntdColor(colorScore) === "green"
                          ? "#52c41a"
                          : getAntdColor(colorScore) === "gold"
                            ? "#faad14"
                            : "#ff4d4f",
                    }}
                  >
                    {displayedScore}
                    {scoreUnit}
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
          description={result.corrected_version}
          type="warning"
          showIcon
        />
      </div>
    </Modal>
  );
};

export default function SpeakingTestPage() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");

  const [exerciseData, setExerciseData] = useState<SpeakingExerciseData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileToSubmit, setFileToSubmit] = useState<File | null>(null);

  const [speakingResult, setSpeakingResult] =
    useState<SpeakingResultResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExercise = useCallback(async (topicId: string) => {
    setLoading(true);
    try {
      const res: AxiosResponse<SpeakingExerciseData[]> = await api.get(
        `/quiz-tree/getByTopic/${topicId}`,
      );
      const raw = res.data?.[0];

      setExerciseData({
        ...raw,
        level: raw.level || "General",
        instructions: raw.instructions || raw.title,
      });
    } catch {
      setError("Lỗi tải bài tập.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (topicId) fetchExercise(topicId);
    else setError("Không tìm thấy topicId.");
  }, [topicId, fetchExercise]);

  const handleSubmitFile = async (file: File) => {
    if (!exerciseData || !file) {
      if (!file) message.warning("Vui lòng chọn file ghi âm trước khi nộp!");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("exerciseId", exerciseData.exerciseId.toString());

    setIsSubmitting(true);
    setError(null);

    try {
      const res: AxiosResponse<SpeakingResultResponse> =
        await flashAPI.submitSpeaking(formData, exerciseData.exerciseId);
      setSpeakingResult(res.data);
      setIsModalOpen(true);
      setFileToSubmit(null);

      message.success("Nộp bài thành công!");
    } catch (err: any) {
      console.error(
        "🔥 SERVER ERROR LOGS:",
        err.response?.status,
        err.response?.data,
      );
      setError("Lỗi khi nộp bài.");

      message.error("Nộp bài thất bại. Vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuizAndFetch = () => {
    if (!topicId) return;
    setSpeakingResult(null);
    setFileToSubmit(null);
    setIsModalOpen(false);
    fetchExercise(topicId);
  };

  if (loading) {
    return (
      <div
        className="text-center py-5"
        style={{ minHeight: "100vh", marginTop: "10%" }}
      >
        <Spin size="large" />
        <p className="mt-2">Đang tải bài tập...</p>
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
      {/* <ProtectedRoute> */}
      <MainHeader />
      {isModalOpen && speakingResult && (
        <SpeakingResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          result={speakingResult}
          onRedo={resetQuizAndFetch}
        />
      )}

      <SpeakingComponent
        exercise={exerciseData}
        onSubmit={handleSubmitFile}
        isSubmitting={isSubmitting}
        fileToSubmit={fileToSubmit}
        setFileToSubmit={
          setFileToSubmit as Dispatch<SetStateAction<File | null>>
        }
        audioURLToPlay={null}
      />
      <MainFooter />
      {/* </ProtectedRoute> */}
    </>
  );
}
