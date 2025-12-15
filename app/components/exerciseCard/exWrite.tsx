// FILE: /app/components/exerciseCard/exWrite.tsx

"use client";

import React, { Dispatch, SetStateAction } from "react";
import { Button, Card, Typography, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

// --- INTERFACES ---
interface WritingExerciseData {
  exerciseId: number;
  title: string;
  description: string;
  topic: string;
  level?: string;
  instructions?: string;
}

interface WritingProps {
  exercise: WritingExerciseData;
  transcript: string;
  setTranscript: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const PRIMARY_COLOR = "#0056b3"; // Màu xanh dương

const WritingComponent: React.FC<WritingProps> = ({
  exercise,
  transcript,
  setTranscript,
  onSubmit,
  isSubmitting,
}) => {
  const { title, description, topic, level, instructions } = exercise;
  const wordCount = transcript
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return (
    <div
      className="container py-5"
      style={{
        marginTop: "50px",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* 1. HEADER */}
          <div className="text-center mb-4">
            <Title
              level={2}
              className="fw-bold text-uppercase"
              style={{ color: PRIMARY_COLOR }}
            >
              {title}
            </Title>
            <p className="text-center text-muted">Level: {level}</p>
          </div>

          {/* 2. BREADCRUMB */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li
                className="breadcrumb-item fw-bold"
                style={{ color: "#00bcd4" }}
              >
                <i className="fas fa-pen-nib me-1"></i> Writing
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {topic}
              </li>
            </ol>
          </nav>

          {/* 3. INSTRUCTIONS / PROMPT */}
          <Card
            className="shadow-sm mb-4"
            style={{
              backgroundColor: "#e3f2fd", // Xanh dương nhạt
              borderLeft: `5px solid ${PRIMARY_COLOR}`,
              borderRadius: "8px",
            }}
          >
            <Title level={5} style={{ color: PRIMARY_COLOR }}>
              <i className="fas fa-edit me-1"></i> Đề Bài (Prompt)
            </Title>
            <Text strong style={{ display: "block", marginBottom: "10px" }}>
              {instructions || title}
            </Text>
            <Text type="secondary" style={{ lineHeight: "1.6" }}>
              {description}
            </Text>
          </Card>

          {/* 4. TEXT INPUT AREA */}
          <Card className="shadow-sm mb-4">
            <Title level={5}>Bài làm của bạn</Title>
            <TextArea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Bắt đầu viết bài luận của bạn tại đây..."
              rows={15}
              style={{ fontSize: "1rem", padding: "15px" }}
            />
            <div className="text-end mt-2">
              <Text type="secondary">Số từ: {wordCount}</Text>
            </div>
          </Card>

          {/* 5. SUBMIT BUTTON */}
          <div className="text-center mt-4">
            <Button
              type="primary"
              size="large"
              onClick={onSubmit}
              disabled={isSubmitting || wordCount === 0}
              loading={isSubmitting}
              style={{
                width: "100%",
                height: "50px",
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
                fontWeight: "bold",
              }}
            >
              <SendOutlined /> Nộp Bài Viết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingComponent;
