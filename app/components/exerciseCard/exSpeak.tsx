"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  Card,
  Upload,
  message,
  Typography,
  Alert,
  Popconfirm,
} from "antd";
import {
  AudioOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";

const { Title, Text } = Typography;

interface SpeakingExerciseData {
  exerciseId: number;
  title: string;
  description: string;
  topic: string;
  level?: string;
  instructions?: string;
}

interface SpeakingProps {
  exercise: SpeakingExerciseData;
  onSubmit: (file: File) => void;
  isSubmitting: boolean;
  fileToSubmit: File | null;
  setFileToSubmit: (file: File | null) => void;

  audioURLToPlay: string | null;
}

const PRIMARY_COLOR = "#6f42c1";
const ACCENT_BG = "#f5f0ff";

const SpeakingComponent: React.FC<SpeakingProps> = ({
  exercise,
  onSubmit,
  isSubmitting,
  fileToSubmit,
  setFileToSubmit,
  audioURLToPlay,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const { title, description, topic, level, instructions } = exercise;
  const hasFile = !!fileToSubmit;
  const allowedFormats = "MP3, WAV, M4A, WebM";

  const handleRecordToggle = async () => {
    if (isSubmitting) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      message.success("Đã dừng ghi âm.");
      streamRef.current?.getTracks().forEach((track) => track.stop());
    } else {
      try {
        setFileToSubmit(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });
          const audioFile = new File(
            [audioBlob],
            `Recorded_${Date.now()}.webm`,
            { type: mimeType }
          );
          setFileToSubmit(audioFile);
        };

        mediaRecorder.start();
        setIsRecording(true);
        message.info("Bắt đầu ghi âm...");
      } catch (err) {
        console.error("Lỗi truy cập microphone:", err);
        message.error("Không thể truy cập microphone. Vui lòng cấp quyền.");
        setIsRecording(false);
      }
    }
  };

  const handleRemoveFile = () => {
    if (isSubmitting || isRecording) return;
    setFileToSubmit(null);
    message.info("Đã xóa file đã chọn.");
  };

  const uploadProps = {
    name: "file",
    accept: "audio/*",
    multiple: false,
    maxCount: 1,
    beforeUpload: () => {
      if (isRecording) handleRecordToggle();

      setFileToSubmit(null);
      return true;
    },
    customRequest: ({ onSuccess }: any) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
    onChange(info: any) {
      if (info.file.status === "done") {
        setFileToSubmit(info.file.originFileObj);
        setIsRecording(false);
        message.success(`${info.file.name} tải lên thành công.`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
    onRemove: () => {
      return true;
    },
  };

  const handleSubmit = () => {
    if (!fileToSubmit) {
      message.warning("Vui lòng ghi âm hoặc tải lên file trước khi nộp bài.");
      return;
    }
    onSubmit(fileToSubmit);
  };

  return (
    <div
      className="container py-5"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center">
            <Title
              level={2}
              className="fw-bold text-uppercase mb-1 text-white py-2"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {title}
            </Title>

            <p className="text-center text-muted mb-4">Level: {level}</p>
          </div>

          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li
                className="breadcrumb-item fw-bold"
                style={{ color: "#ffc107" }}
              >
                <i className="fas fa-microphone me-1"></i> Speaking
              </li>

              <li className="breadcrumb-item active" aria-current="page">
                {topic}
              </li>
            </ol>
          </nav>

          <Card
            className="shadow-sm mb-5"
            style={{
              backgroundColor: ACCENT_BG,
              borderLeft: `5px solid ${PRIMARY_COLOR}`,
              borderRadius: "8px",
            }}
          >
            <Title level={5} style={{ color: PRIMARY_COLOR }}>
                            <i className="fas fa-book-reader me-1"></i> Topic
              Instructions
            </Title>

            <Text strong style={{ display: "block", marginBottom: "10px" }}>
              {instructions || title}
            </Text>

            <Text type="secondary" style={{ lineHeight: "1.6" }}>
              {description}
            </Text>
          </Card>

          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <Card
                className="shadow-sm text-center h-100"
                onClick={!isSubmitting ? handleRecordToggle : undefined}
                style={{
                  cursor: "pointer",
                  border: isRecording
                    ? "2px solid #dc3545"
                    : audioURLToPlay &&
                      fileToSubmit?.name.startsWith("Recorded_")
                    ? "2px solid #28a745"
                    : "1px solid #ddd",
                  backgroundColor: isRecording ? "#fff0f0" : "white",
                  transition: "all 0.3s",
                }}
                hoverable={!isRecording && !isSubmitting}
              >
                <Title level={4} className="mb-3">
                  Ghi âm
                </Title>

                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  danger={isRecording}
                  icon={
                    isRecording ? (
                      <StopOutlined style={{ fontSize: "30px" }} />
                    ) : (
                      <AudioOutlined style={{ fontSize: "30px" }} />
                    )
                  }
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: isRecording ? "red" : PRIMARY_COLOR,
                  }}
                  disabled={isSubmitting}
                />

                <p
                  className={`mt-3 mb-0 fw-bold ${
                    isRecording ? "text-danger" : "text-primary"
                  }`}
                >
                  {isRecording
                    ? "Đang Ghi Âm... Nhấn để dừng"
                    : "Nhấn để ghi âm"}
                </p>

                {audioURLToPlay &&
                  fileToSubmit?.name.startsWith("Recorded_") &&
                  !isRecording && (
                    <div className="mt-3">
                      <Text type="success" className="d-block mb-2">
                        <CheckCircleOutlined /> File đã ghi:{" "}
                        {fileToSubmit?.name.substring(0, 15)}...
                      </Text>
                      <div className="d-flex justify-content-center align-items-center">
                        {/* TRÌNH PHÁT AUDIO */}
                        <audio
                          controls
                          src={audioURLToPlay}
                          className="flex-grow-1 me-2"
                          style={{ height: "35px" }}
                        >
                          Trình duyệt của bạn không hỗ trợ audio.
                        </audio>
                        <Popconfirm
                          title="Xóa bài nói?"
                          description="Bạn có chắc chắn muốn xóa file này không?"
                          onConfirm={handleRemoveFile}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            disabled={isSubmitting}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  )}
              </Card>
            </div>

            <div className="col-md-6">
              <Card
                className="shadow-sm h-100"
                style={{
                  border:
                    audioURLToPlay &&
                    !fileToSubmit?.name.startsWith("Recorded_")
                      ? "2px solid #28a745"
                      : "1px dashed #ddd",
                  backgroundColor: "white",
                }}
              >
                <Title level={4} className="text-center mb-3">
                  Tải file
                </Title>

                <Upload.Dragger
                  {...uploadProps}
                  showUploadList={false}
                  className="py-3"
                  disabled={isRecording || isSubmitting}
                >
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined
                      style={{ fontSize: "30px", color: PRIMARY_COLOR }}
                    />
                  </p>
                  <p className="ant-upload-text fw-bold">Click để chọn file</p> 
                  <p className="ant-upload-hint text-muted">{allowedFormats}</p>
                </Upload.Dragger>

                {audioURLToPlay &&
                  !fileToSubmit?.name.startsWith("Recorded_") && (
                    <div className="mt-3">
                      <Text type="success" className="d-block mb-2">
                        <CheckCircleOutlined /> File đã tải: **
                        {fileToSubmit?.name}**
                      </Text>
                      <div className="d-flex justify-content-center align-items-center">
                        {/* TRÌNH PHÁT AUDIO */}
                        <audio
                          controls
                          src={audioURLToPlay}
                          className="flex-grow-1 me-2"
                          style={{ height: "35px" }}
                        >
                          Trình duyệt của bạn không hỗ trợ audio.
                        </audio>
                        <Popconfirm
                          title="Xóa file?"
                          description="Bạn có chắc chắn muốn xóa file này không?"
                          onConfirm={handleRemoveFile}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            disabled={isSubmitting}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  )}
              </Card>
            </div>
          </div>

          <div className="text-center mt-4">
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              disabled={!hasFile || isSubmitting || isRecording}
              loading={isSubmitting}
              style={{
                width: "100%",
                height: "50px",
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
                fontWeight: "bold",
              }}
            >
              Nộp bài
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingComponent;
