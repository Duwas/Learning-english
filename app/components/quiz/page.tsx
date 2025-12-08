"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircleFilled,
  RedoOutlined,
  ArrowRightOutlined,
  SendOutlined,
  ExclamationCircleOutlined, // Import icon cảnh báo
} from "@ant-design/icons";
import flashAPI from "@/app/services/api/flashAPI";

// --- TYPE ĐỊNH NGHĨA ---
interface Option {
  optionId: number;
  optionText: string;
}

interface QuestionNode {
  questionId: number;
  questionText: string;
  options: Option[];
}

interface QuizResponseItem {
  exerciseId: number;
  title: string;
  subQuestionNodes: QuestionNode[];
}

interface ResultDetail {
  questionId: number;
  selectedOptionId: number;
  correct: boolean;
}

interface QuizResult {
  exerciseId: number;
  score: number;
  totalQuestions: number;
  results: ResultDetail[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
}

// --- 1. HÀM TRỘN MẢNG (SHUFFLE) ---
// Thuật toán Fisher-Yates Shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]; // Copy mảng để không ảnh hưởng mảng gốc
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function QuizModal({
  isOpen,
  onClose,
  groupId,
}: QuizModalProps) {
  const [questions, setQuestions] = useState<QuestionNode[]>([]);
  const [exerciseId, setExerciseId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  // --- STATE CẢNH BÁO ---
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const [resultData, setResultData] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (isOpen && groupId) {
      fetchQuiz();
    } else {
      resetQuiz();
    }
  }, [isOpen, groupId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await flashAPI.getQuizByGroup(groupId);
      const data: QuizResponseItem[] = Array.isArray(res)
        ? res
        : (res as any).data || [];

      if (data.length > 0) {
        const quizData = data[0];
        setExerciseId(quizData.exerciseId);

        // --- 2. TRỘN CÂU HỎI KHI LẤY DỮ LIỆU ---
        // Nếu có danh sách câu hỏi, ta trộn nó trước khi lưu vào state
        const rawQuestions = quizData.subQuestionNodes || [];
        setQuestions(shuffleArray(rawQuestions));
      }
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setResultData(null);
    setExerciseId(null);
    setWarningMsg(null); // Reset cảnh báo
  };

  const handleSelectOption = (qId: number, optId: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optId,
    }));
    // Khi người dùng chọn đáp án, ẩn cảnh báo đi (nếu có)
    if (warningMsg) setWarningMsg(null);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setWarningMsg(null); // Reset cảnh báo khi qua câu mới
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setWarningMsg(null);
    }
  };

  const handleSubmit = async () => {
    if (!exerciseId) {
      alert("Lỗi: Không tìm thấy ID bài tập!");
      return;
    }

    // --- 3. KIỂM TRA ĐÃ LÀM HẾT CHƯA ---
    // Tìm câu hỏi đầu tiên chưa có trong danh sách trả lời
    const unansweredIndex = questions.findIndex(
      (q) => userAnswers[q.questionId] === undefined
    );

    if (unansweredIndex !== -1) {
      // Nếu tìm thấy câu chưa làm:
      // 1. Chuyển ngay tới câu đó
      setCurrentIndex(unansweredIndex);
      // 2. Hiển thị cảnh báo
      setWarningMsg("Bạn chưa trả lời câu hỏi này! Vui lòng chọn đáp án.");
      return; // Dừng, không gửi bài
    }

    setSubmitting(true);

    const listAnswers = Object.entries(userAnswers).map(([qId, optId]) => ({
      questionId: Number(qId),
      selectedOptionId: optId,
    }));

    const requestData = {
      exerciseId: exerciseId,
      answers: listAnswers,
    };

    const payload = [requestData];

    try {
      const res = await flashAPI.submitQuiz(payload);
      const data = res.data || res;
      const result: QuizResult = Array.isArray(data) ? data[0] : data;

      setResultData(result);
    } catch (error: any) {
      console.error("Lỗi nộp bài:", error);
      const msg = error?.response?.data?.message || "Lỗi server";
      alert("Nộp bài thất bại: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm đếm số câu đúng
  const calculateCorrectCount = (results: ResultDetail[]) => {
    if (!results) return 0;
    return results.filter((item) => item.correct === true).length;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop show"
        style={{ opacity: 0.5, zIndex: 1040 }}
        onClick={onClose}
      ></div>

      <div
        className="modal show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 border-0 shadow-lg">
            {/* HEADER */}
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title fw-bold">
                <RedoOutlined className="me-2" /> Ôn tập trắc nghiệm
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            {/* BODY */}
            <div className="modal-body p-4 bg-light">
              {loading && (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                  <p className="mt-2 text-muted">Đang tải đề thi...</p>
                </div>
              )}

              {!loading && questions.length === 0 && (
                <div className="text-center py-5">Không có câu hỏi ôn tập.</div>
              )}

              {/* KẾT QUẢ */}
              {!loading && resultData && (
                <div className="text-center py-4 fade-in">
                  <div className="mb-4">
                    <CheckCircleFilled
                      style={{ fontSize: "60px", color: "#198754" }}
                    />
                  </div>
                  <h3 className="fw-bold mb-3 text-success">Kết quả làm bài</h3>

                  <div
                    className="card border-0 shadow-sm p-4 d-inline-block bg-white"
                    style={{ minWidth: "300px" }}
                  >
                    <div className="display-4 fw-bold text-primary mb-2">
                      {resultData.score}{" "}
                      <span className="fs-4 text-muted">điểm</span>
                    </div>
                    <div className="text-muted mb-3 fs-5">
                      Đúng{" "}
                      <strong>
                        {calculateCorrectCount(resultData.results)}
                      </strong>{" "}
                      / <strong>{resultData.totalQuestions}</strong> câu
                    </div>
                  </div>

                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <button
                      className="btn btn-outline-secondary px-4"
                      onClick={onClose}
                    >
                      Đóng
                    </button>
                    <button
                      className="btn btn-primary px-4"
                      onClick={() => {
                        setResultData(null);
                        resetQuiz();
                        fetchQuiz();
                      }}
                    >
                      Làm lại
                    </button>
                  </div>
                </div>
              )}

              {/* LÀM BÀI */}
              {!loading && !resultData && questions.length > 0 && (
                <div className="fade-in">
                  <div className="d-flex justify-content-between text-muted small mb-2">
                    <span>
                      Câu hỏi {currentIndex + 1} / {questions.length}
                    </span>
                    <span>
                      Đã chọn: {Object.keys(userAnswers).length}/
                      {questions.length}
                    </span>
                  </div>
                  <div className="progress mb-4" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-primary"
                      style={{
                        width: `${
                          ((currentIndex + 1) / questions.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  {/* --- HIỂN THỊ CẢNH BÁO NẾU CÓ --- */}
                  {warningMsg && (
                    <div
                      className="alert alert-danger d-flex align-items-center mb-3"
                      role="alert"
                    >
                      <ExclamationCircleOutlined className="me-2 fs-5" />
                      <div>{warningMsg}</div>
                    </div>
                  )}

                  <h5 className="fw-bold text-dark mb-4 p-3 bg-white rounded shadow-sm border-start border-4 border-primary">
                    {questions[currentIndex].questionText}
                  </h5>

                  <div className="row g-3">
                    {questions[currentIndex].options.map((option) => {
                      const isSelected =
                        userAnswers[questions[currentIndex].questionId] ===
                        option.optionId;

                      let btnClass = "btn-outline-secondary bg-white text-dark";
                      if (isSelected) {
                        btnClass =
                          "btn-primary text-white shadow ring-2 ring-offset-1";
                      }

                      return (
                        <div key={option.optionId} className="col-12 col-md-6">
                          <button
                            className={`btn w-100 p-3 text-start fw-medium rounded-3 border ${btnClass}`}
                            onClick={() =>
                              handleSelectOption(
                                questions[currentIndex].questionId,
                                option.optionId
                              )
                            }
                            style={{ transition: "all 0.2s" }}
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle border me-3 d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  backgroundColor: isSelected
                                    ? "white"
                                    : "transparent",
                                  borderColor: isSelected ? "white" : "#dee2e6",
                                }}
                              >
                                {isSelected && (
                                  <div
                                    className="rounded-circle bg-primary"
                                    style={{ width: "12px", height: "12px" }}
                                  ></div>
                                )}
                              </div>
                              {option.optionText}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            {!loading && !resultData && questions.length > 0 && (
              <div className="modal-footer bg-light border-0 d-flex justify-content-between">
                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={handlePrev}
                  disabled={currentIndex === 0 || submitting}
                  style={{
                    visibility: currentIndex === 0 ? "hidden" : "visible",
                  }}
                >
                  Quay lại
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    className="btn btn-success px-4 fw-bold rounded-pill"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <SendOutlined className="me-2" /> Gửi kết quả
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary px-4 fw-bold rounded-pill"
                    onClick={handleNext}
                  >
                    Câu tiếp theo <ArrowRightOutlined className="ms-2" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
