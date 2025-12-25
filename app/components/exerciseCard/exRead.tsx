

"use client";

import React from "react";
import { Button, Radio, Card, Tag, Divider, Alert } from "antd";
import {
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";




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

interface ReadingQuizProps {
  exercise: ExerciseData;
  userAnswers: Record<number, number>;
  isSubmitted: boolean;
  onSelectOption: (questionId: number, value: number) => void;
  detailedResults: QuestionResult[];
  onSubmit: () => void;
  submitting: boolean;
}

const PRIMARY_COLOR = "#28a745"; 
const FIXED_HEIGHT = "60vh";

const ReadingQuizComponent: React.FC<ReadingQuizProps> = ({
  exercise,
  userAnswers,
  isSubmitted,
  onSelectOption,
  detailedResults,
  onSubmit,
  submitting,
}) => {
  const getResultForQuestion = (
    questionId: number
  ): QuestionResult | undefined => {
    return detailedResults.find((r) => r.questionId === questionId);
  };

  const getOptionKey = (index: number): string =>
    String.fromCharCode(65 + index);

  if (!exercise || !exercise.subQuestionNodes) return null;

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="text-center mb-4">
        <h1
          className="display-6 fw-bold text-uppercase"
          style={{ color: PRIMARY_COLOR }}
        >
          {exercise.title}
        </h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb justify-content-center">
            <li className="breadcrumb-item text-primary fw-bold">Reading</li>
            <li className="breadcrumb-item active" aria-current="page">
              {exercise.topic}
            </li>
          </ol>
        </nav>
      </div>

      <div className="row g-4">
        {/* Cột Trái: VĂN BẢN ĐỌC (Scroll cố định) */}
        <div className="col-lg-6">
          <Card
            title={
              <span style={{ color: PRIMARY_COLOR }}>
                <i className="fas fa-book-open me-2"></i> Reading Passage
              </span>
            }
            className="shadow-sm h-100"
            style={{ borderLeft: `5px solid ${PRIMARY_COLOR}` }}
          >
            {/* Container có Chiều cao cố định và SCROLL */}
            <div
              style={{
                height: FIXED_HEIGHT,
                overflowY: "auto",
                paddingRight: "15px",
              }}
            >
              {/* Hiển thị văn bản đọc */}
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                  color: "#333",
                }}
              >
                {exercise.description}
              </div>
            </div>
          </Card>
        </div>

        {/* Cột Phải: CÂU HỎI VÀ ĐÁP ÁN (Scroll cố định) */}
        <div className="col-lg-6">
          <Card
            title={
              <span style={{ color: PRIMARY_COLOR }}>
                <i className="fas fa-question-circle me-2"></i> Câu hỏi
              </span>
            }
            className="shadow-sm"
            style={{
              borderLeft: `5px solid ${PRIMARY_COLOR}`,
              backgroundColor: "#f0fff0",
            }}
          >
            {/* Container có Chiều cao cố định và SCROLL */}
            <div
              style={{
                maxHeight: FIXED_HEIGHT,
                overflowY: "auto",
                paddingRight: "15px",
              }}
            >
              {exercise.subQuestionNodes.map(
                (question: QuestionNode, index: number) => {
                  const questionKey = question.questionId;
                  const result = getResultForQuestion(questionKey);

                  return (
                    <div key={questionKey} className="mb-4">
                      <h6 className="fw-bold mb-3 d-flex align-items-center">
                        <span
                          className="badge rounded-pill me-2"
                          style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                          {index + 1}
                        </span>
                        {question.questionText}
                      </h6>

                      <Radio.Group
                        onChange={(e) =>
                          onSelectOption(questionKey, e.target.value)
                        }
                        value={userAnswers[questionKey]}
                        disabled={isSubmitted}
                        style={{ width: "100%" }}
                      >
                        {question.options.map(
                          (option: Option, optIndex: number) => {
                            const optionKey = getOptionKey(optIndex);
                            const isSelectedByUser =
                              userAnswers[questionKey] === option.optionId;

                            let styleProps = {};

                            if (isSubmitted && result) {
                              const isCorrectOption =
                                result.correctOptionId === option.optionId;

                              if (isCorrectOption) {
                                styleProps = {
                                  backgroundColor: "#e6ffed",
                                  border: "1px solid #52c41a",
                                };
                              } else if (isSelectedByUser && !result.correct) {
                                styleProps = {
                                  backgroundColor: "#fff0f0",
                                  border: "1px solid #ff4d4f",
                                };
                              }
                            } else if (isSelectedByUser) {
                              styleProps = {
                                backgroundColor: "#e6f7ff",
                                border: "1px solid #91d5ff",
                              };
                            }

                            return (
                              <div
                                key={option.optionId}
                                className="p-2 mb-2 rounded"
                                style={{
                                  ...styleProps,
                                  cursor: isSubmitted ? "default" : "pointer",
                                }}
                              >
                                <Radio value={option.optionId}>
                                  <span
                                    className="fw-bold me-2"
                                    style={{ color: PRIMARY_COLOR }}
                                  >
                                    {optionKey}.
                                  </span>
                                  {option.optionText}
                                  {/* Hiển thị tag đáp án đúng nếu đã submit */}
                                  {isSubmitted &&
                                    result &&
                                    result.correctOptionId ===
                                      option.optionId && (
                                      <Tag
                                        color="green"
                                        className="ms-3 float-end"
                                      >
                                        Đúng
                                      </Tag>
                                    )}
                                </Radio>
                              </div>
                            );
                          }
                        )}
                      </Radio.Group>
                      <Divider className="my-3" />
                    </div>
                  );
                }
              )}

              {/* NÚT NỘP BÀI */}
              {!isSubmitted && (
                <div className="mt-4 text-center pb-3">
                  <Button
                    type="primary"
                    size="large"
                    onClick={onSubmit}
                    disabled={submitting}
                    loading={submitting}
                    style={{
                      width: "80%",
                      height: "50px",
                      fontWeight: "bold",
                      backgroundColor: PRIMARY_COLOR,
                      borderColor: PRIMARY_COLOR,
                    }}
                  >
                    <SendOutlined className="me-2" /> NỘP BÀI TẬP
                  </Button>
                  <p className="text-muted small mt-2">
                    {Object.keys(userAnswers).length} /{" "}
                    {exercise.subQuestionNodes.length} câu đã trả lời.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReadingQuizComponent;
