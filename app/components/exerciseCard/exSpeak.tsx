"use client";

import React, { useState, useRef } from "react";
import { Button, Card, message, Typography, Divider, Spin } from "antd";
import {
  AudioOutlined,
  CloudUploadOutlined,
  StopOutlined,
  DeleteOutlined,
  SoundOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";

const { Title, Text, Paragraph } = Typography;

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
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { title, description, topic, level, instructions } = exercise;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioFile = new File(
          [audioBlob],
          `recording_${Date.now()}.webm`,
          { type: mimeType }
        );
        setFileToSubmit(audioFile);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      message.info("Đang ghi âm...");
    } catch (err) {
      console.error("Lỗi mic:", err);
      message.error("Không thể truy cập microphone!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("audio/")) {
        message.error("Vui lòng chỉ chọn file âm thanh!");
        return;
      }
      setFileToSubmit(file);
      message.success("Đã chọn file: " + file.name);
    }

    if (e.target.value) e.target.value = "";
  };

  const handleRemoveFile = () => {
    setFileToSubmit(null);
    setIsRecording(false);
    setTimer(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const handleSubmit = () => {
    if (fileToSubmit) onSubmit(fileToSubmit);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="container py-5"
      style={{
        marginTop: "1.5%",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* HEADER */}
          <div className="text-center mb-4">
            <Title level={2} style={{ color: PRIMARY_COLOR }}>
              {title}
            </Title>
            <Text type="secondary">
              {topic} - {level}
            </Text>
          </div>

          <Card
            className="shadow-sm mb-4"
            style={{
              backgroundColor: ACCENT_BG,
              borderLeft: `5px solid ${PRIMARY_COLOR}`,
            }}
          >
            <Title level={5}>Instructions</Title>
            <Paragraph>{instructions || description}</Paragraph>
          </Card>

          <Card className="shadow-sm text-center py-4">
            {isRecording ? (
              <div className="animate-fade-in">
                <div className="mb-3">
                  <Text type="danger" strong className="fs-4">
                    Đang ghi âm: {formatTime(timer)}
                  </Text>
                  <div
                    className="spinner-grow text-danger ms-2"
                    role="status"
                    style={{ width: "10px", height: "10px" }}
                  ></div>
                </div>
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  size="large"
                  icon={<StopOutlined style={{ fontSize: 24 }} />}
                  onClick={stopRecording}
                  style={{ width: 80, height: 80 }}
                />
                <div className="mt-2 text-muted">Nhấn để dừng</div>
              </div>
            ) : fileToSubmit ? (
              <div className="animate-fade-in">
                <div className="d-flex justify-content-center mb-4">
                  <Card
                    size="small"
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      backgroundColor: "#f9f9f9",
                      border: `1px solid ${PRIMARY_COLOR}`,
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center overflow-hidden">
                        <div className="me-3 p-2 rounded-circle bg-white text-primary">
                          <SoundOutlined style={{ fontSize: 24 }} />
                        </div>
                        <div className="text-start overflow-hidden">
                          <span
                            className="d-block text-truncate"
                            style={{ maxWidth: "250px" }}
                          >
                            {fileToSubmit.name}
                          </span>
                          <span style={{ fontSize: 12 }}>
                            {(fileToSubmit.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleRemoveFile}
                      >
                        Xóa
                      </Button>
                    </div>
                    <audio
                      controls
                      src={URL.createObjectURL(fileToSubmit)}
                      style={{ width: "100%" }}
                    />
                  </Card>
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={isSubmitting ? <Spin /> : <SendOutlined />}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                    height: 50,
                    paddingLeft: 40,
                    paddingRight: 40,
                    fontSize: 18,
                  }}
                >
                  {isSubmitting ? "Đang nộp bài..." : "Nộp Bài Ngay"}
                </Button>
              </div>
            ) : (
              <div className="d-flex justify-content-center gap-5 py-3">
                <div className="text-center">
                  <Button
                    shape="circle"
                    size="large"
                    icon={<AudioOutlined style={{ fontSize: 28 }} />}
                    onClick={startRecording}
                    style={{
                      width: 80,
                      height: 80,
                      border: `2px solid ${PRIMARY_COLOR}`,
                      color: PRIMARY_COLOR,
                    }}
                  />
                  <div className="mt-3 fw-bold text-secondary">
                    Ghi âm trực tiếp
                  </div>
                </div>

                <div
                  className="vr align-self-center"
                  style={{ height: 60 }}
                ></div>

                <div className="text-center">
                  <input
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <Button
                    shape="circle"
                    size="large"
                    icon={<CloudUploadOutlined style={{ fontSize: 28 }} />}
                    onClick={handleUploadClick}
                    style={{
                      width: 80,
                      height: 80,
                      border: "2px dashed #999",
                      color: "#666",
                    }}
                  />
                  <div className="mt-3 fw-bold text-secondary">
                    Tải file lên
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeakingComponent;
