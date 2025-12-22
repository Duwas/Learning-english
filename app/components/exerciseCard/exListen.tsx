
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Radio, Divider } from "antd";
import {
  CustomerServiceFilled,
  PlayCircleFilled,
  SendOutlined,
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
  audioUrl: string;
  subQuestionNodes: QuestionNode[];
}
interface QuestionResult {
  questionId: number;
  selectedOptionId: number;
  correct: boolean;
  correctOptionId?: number;
}

interface ListeningTestProps {
  exercise: ExerciseData;
  onSubmit: (answers: Record<number, number>) => void;
  isSubmitted: boolean;
  userAnswers: Record<number, number>;
  onSelectOption: (questionId: number, value: number) => void;
  detailedResults: QuestionResult[];
  submitting: boolean;
}

// --------------------------------------------------------------------------

const ListeningComponent: React.FC<ListeningTestProps> = ({
  exercise,
  onSubmit,
  isSubmitted,
  userAnswers,
  onSelectOption,
  detailedResults,
  submitting,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getResultForQuestion = (
    questionId: number
  ): QuestionResult | undefined => {
    return detailedResults.find((r) => r.questionId === questionId);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSubmitClick = () => {
    onSubmit(userAnswers);
  };

  const getOptionKey = (index: number): string =>
    String.fromCharCode(65 + index);

  if (
    !exercise ||
    !exercise.subQuestionNodes ||
    exercise.subQuestionNodes.length === 0
  ) {
    return null;
  }

  return (
    <div>
      <div
        className="container-fluid text-white"
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          backgroundColor: "#00bfff",
        }}
      >
        <div className="row">
          <div className="col-12 text-center">
            <h1 className="display-6 fw-bold">{exercise.topic}</h1>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* 2. Breadcrumb Section */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item text-warning fw-bold">Listening</li>
            <li className="breadcrumb-item active" aria-current="page">
              {exercise.topic || exercise.title.split("-")[0].trim()}
            </li>
          </ol>
        </nav>

        {/* 3. Audio Player Section */}
        <div className="row mb-5">
          <div className="col-lg-8 offset-lg-2">
            <div
              className="card p-4 shadow-sm"
              style={{ backgroundColor: "#f0f8ff", border: "none" }}
            >
              <div className="card-body text-center">
                <p className="h5 text-primary mb-3">
                  <CustomerServiceFilled style={{ marginRight: "8px" }} /> Audio
                  Player
                </p>

                <div className="d-flex justify-content-center mb-3">
                  <audio
                    ref={audioRef}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                    key={exercise.audioUrl}
                    style={{ width: "80%" }}
                  >
                    <source src={exercise.audioUrl} type="audio/mp4" />
                    Trình duyệt của bạn không hỗ trợ audio element.
                  </audio>
                </div>

                <div className="d-flex justify-content-center align-items-center mb-3">
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={
                      isPlaying ? (
                        <i className="fas fa-pause"></i>
                      ) : (
                        <PlayCircleFilled style={{ fontSize: "30px" }} />
                      )
                    }
                    onClick={togglePlayPause}
                    style={{ width: "60px", height: "60px", margin: "0 15px" }}
                  />
                </div>
                <p className="text-muted small">{exercise.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            {exercise.subQuestionNodes.map(
              (question: QuestionNode, index: number) => {
                const questionKey = question.questionId;
                const result = getResultForQuestion(questionKey);

                return (
                  <div key={questionKey} className="mb-5">
                    <div className="d-flex align-items-center mb-3">
                      <span
                        className="badge rounded-circle text-white me-3"
                        style={{
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#0d6efd",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </span>
                      <h5 className="mb-0 fw-bold">{question.questionText}</h5>
                    </div>

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

                          // LOGIC HIỂN THỊ KẾT QUẢ SAU KHI NỘP BÀI
                          let backgroundColor = "white";
                          let borderColor = "#ccc";
                          let labelColor = "#6c757d";

                          if (isSubmitted && result) {
                            const isCorrectOption =
                              result.correctOptionId === option.optionId;
                            const isUserSelection = isSelectedByUser;

                            if (isCorrectOption) {
                              backgroundColor = "#e6ffed";
                              borderColor = "#52c41a";
                              labelColor = "green";
                            } else if (isUserSelection && !result.correct) {
                              backgroundColor = "#fff0f0";
                              borderColor = "#ff4d4f";
                              labelColor = "red";
                            }
                          } else if (isSelectedByUser) {
                            backgroundColor = "#e6f7ff";
                            borderColor = "#91d5ff";
                          }

                          return (
                            <div
                              key={option.optionId}
                              className="p-3 mb-2 border rounded"
                              style={{
                                ...(isSelectedByUser ||
                                (isSubmitted &&
                                  result &&
                                  result.correctOptionId === option.optionId)
                                  ? { backgroundColor, borderColor }
                                  : {
                                      backgroundColor: "white",
                                      borderColor: "#ccc",
                                    }),
                                cursor: isSubmitted ? "default" : "pointer",
                              }}
                            >
                              <Radio
                                value={option.optionId}
                                style={{ width: "100%" }}
                              >
                                <span
                                  className="fw-bold me-2"
                                  style={{
                                    border: `1px solid ${borderColor}`,
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    color: labelColor,
                                    display: "inline-block",
                                    minWidth: "25px",
                                    textAlign: "center",
                                  }}
                                >
                                  {optionKey}
                                </span>
                                {option.optionText}
                              </Radio>
                            </div>
                          );
                        }
                      )}
                    </Radio.Group>
                    <Divider />
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* 5. NÚT NỘP BÀI */}
        <div className="row my-5">
          <div className="col-lg-8 offset-lg-2 text-center">
            <Button
              type="primary"
              size="large"
              danger={!isSubmitted}
              disabled={isSubmitted || submitting}
              onClick={handleSubmitClick}
              style={{ width: "50%", height: "50px", fontWeight: "bold" }}
              loading={submitting}
            >
              {isSubmitted ? (
                "ĐÃ NỘP BÀI"
              ) : (
                <>
                  {" "}
                  <SendOutlined className="me-2" /> NỘP BÀI TẬP{" "}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningComponent;
