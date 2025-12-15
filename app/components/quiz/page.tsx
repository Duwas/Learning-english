"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircleFilled,
  RedoOutlined,
  ArrowRightOutlined,
  SendOutlined,
  ExclamationCircleOutlined, // Import icon cảnh báo
  HistoryOutlined, // ICON LỊCH SỬ MỚI
  // CloseCircleFilled, // Không dùng trực tiếp
  // CheckSquareFilled, // Không dùng trực tiếp
  ArrowLeftOutlined, // ICON QUAY LẠI
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
  // **THÊM: Thêm trường correctOptionId để hiển thị đáp án đúng**
  correctOptionId?: number;
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
  // **THÊM: Thêm trường correctOptionId từ server (nếu API có trả về)**
  correctOptionId?: number;
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
  grammarId?: number;
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

// **HÀM TRỘN CÁC OPTIONS TRONG MỘT CÂU HỎI (Áp dụng cho Quiz Mode)**
const shuffleOptions = (question: QuestionNode): QuestionNode => {
  if (!question || !question.options) return question;
  const shuffledOptions = shuffleArray(question.options);
  return {
    ...question,
    options: shuffledOptions,
  };
};

// **HÀM LẤY ĐÁP ÁN ĐÚNG CỦA CÂU HỎI TỪ MẢNG QUESTIONS**
const getCorrectOptionIdFromQuestions = (
  questionId: number,
  questions: QuestionNode[]
): number | undefined => {
  const question = questions.find((q) => q.questionId === questionId);
  return question?.correctOptionId;
};

export default function QuizModal({
  isOpen,
  onClose,
  groupId,
  grammarId,
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

  // **THÊM STATE MỚI: Trạng thái hiển thị lịch sử làm bài**
  const [showHistory, setShowHistory] = useState(false);

  // **THÊM HÀM MỚI: Hàm để gộp đáp án đúng từ mảng questions vào resultData**
  const mergeCorrectAnswers = (
    result: QuizResult,
    quizQuestions: QuestionNode[]
  ): QuizResult => {
    const updatedResults = result.results.map((res) => {
      const correctOptionId = getCorrectOptionIdFromQuestions(
        res.questionId,
        quizQuestions
      );
      // Gộp correctOptionId vào ResultDetail
      return {
        ...res,
        correctOptionId: correctOptionId,
      };
    });

    return {
      ...result,
      results: updatedResults,
    };
  };

  if (groupId == -1) {
    useEffect(() => {
      if (isOpen && grammarId) {
        fetchQuiz1();
      } else {
        resetQuiz();
      }
    }, [isOpen, grammarId]);
  } else {
    useEffect(() => {
      if (isOpen && groupId) {
        fetchQuiz();
      } else {
        resetQuiz();
      }
    }, [isOpen, groupId]);
  }

  // LOGIC FETCH MỚI: Trộn câu hỏi và trộn đáp án trong mỗi câu hỏi
  const fetchQuiz1 = async () => {
    setLoading(true);

    if (!grammarId) return;

    try {
      const res = await flashAPI.getQuizGrammar(grammarId);
      const data: QuizResponseItem[] = Array.isArray(res)
        ? res
        : (res as any).data || [];

      if (data.length > 0) {
        const quizData = data[0];
        setExerciseId(quizData.exerciseId);

        const rawQuestions = quizData.subQuestionNodes || [];

        // --- 1. TRỘN CÂU HỎI TỔNG THỂ ---
        const shuffledQuestions = shuffleArray(rawQuestions);

        // --- 2. TRỘN ĐÁP ÁN TRONG MỖI CÂU HỎI VÀ LƯU VÀO STATE (FULL RANDOMIZATION) ---
        // State questions sẽ lưu trữ cấu trúc đã trộn cho toàn bộ bài làm
        const finalQuizStructure = shuffledQuestions.map((q) =>
          shuffleOptions(q)
        );
        setQuestions(finalQuizStructure);
      }
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  };

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

        const rawQuestions = quizData.subQuestionNodes || [];

        // --- 1. TRỘN CÂU HỎI TỔNG THỂ ---
        const shuffledQuestions = shuffleArray(rawQuestions);

        // --- 2. TRỘN ĐÁP ÁN TRONG MỖI CÂU HỎI VÀ LƯU VÀO STATE (FULL RANDOMIZATION) ---
        const finalQuizStructure = shuffledQuestions.map((q) =>
          shuffleOptions(q)
        );
        setQuestions(finalQuizStructure);
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
    setShowHistory(false); // **RESET LỊCH SỬ**
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

    console.log(payload);

    try {
      const res = await flashAPI.submitQuiz(payload);
      const data = res.data || res;
      let result: QuizResult = Array.isArray(data) ? data[0] : data;

      // **GỘP ĐÁP ÁN ĐÚNG TRƯỚC KHI LƯU VÀO STATE**
      result = mergeCorrectAnswers(result, questions);

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

  // Hàm lấy QuestionNode dựa trên QuestionId
  // HÀM NÀY BÂY GIỜ LẤY CÂU HỎI VỚI OPTIONS ĐÃ TRỘN
  const getQuestionById = (questionId: number) => {
    return questions.find((q) => q.questionId === questionId);
  };

  if (!isOpen) return null;

  // Lấy câu hỏi để render: luôn là questions[currentIndex] vì nó đã được trộn sẵn
  const questionToRender = questions[currentIndex];

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
                {/* Thay đổi tiêu đề khi xem lịch sử */}
                {showHistory ? (
                  <>
                    <HistoryOutlined className="me-2" /> Lịch sử làm bài
                  </>
                ) : (
                  <>
                    <RedoOutlined className="me-2" /> Ôn tập trắc nghiệm
                  </>
                )}
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

              {/* KẾT QUẢ / LỊCH SỬ */}
              {!loading && resultData && (
                <div className="fade-in">
                  {/* --- HIỂN THỊ KẾT QUẢ TỔNG QUAN --- */}
                  {!showHistory && (
                    <div className="text-center py-4">
                      <div className="mb-4">
                        <CheckCircleFilled
                          style={{ fontSize: "60px", color: "#198754" }}
                        />
                      </div>
                      <h3 className="fw-bold mb-3 text-success">
                        Kết quả làm bài
                      </h3>

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
                        {/* NÚT XEM LỊCH SỬ */}
                        <button
                          className="btn btn-info text-white px-4"
                          onClick={() => setShowHistory(true)}
                        >
                          <HistoryOutlined className="me-2" /> Xem lịch sử làm
                          bài
                        </button>
                        <button
                          className="btn btn-primary px-4"
                          onClick={() => {
                            setResultData(null);
                            resetQuiz();
                            if (groupId === -1 && grammarId) {
                              fetchQuiz1();
                            } else {
                              fetchQuiz();
                            }
                          }}
                        >
                          Làm lại
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- HIỂN THỊ CHI TIẾT LỊCH SỬ LÀM BÀI --- */}
                  {showHistory && (
                    <div className="py-2">
                      <button
                        className="btn btn-link mb-3 p-0"
                        onClick={() => setShowHistory(false)}
                      >
                        <ArrowLeftOutlined className="me-1" /> Quay lại kết quả
                      </button>
                      <h4 className="fw-bold mb-4 text-primary">
                        Chi tiết đáp án
                      </h4>
                      {/* GIỚI HẠN CHIỀU CAO VÀ THÊM SCROLL */}
                      <div
                        className="history-list border rounded p-3 bg-white"
                        style={{ maxHeight: "500px", overflowY: "auto" }}
                      >
                        {resultData.results.map((resultItem, index) => {
                          // Lấy câu hỏi từ mảng questions (BÂY GIỜ ĐÃ CÓ OPTIONS TRỘN VÀ THỨ TỰ CÂU HỎI TRỘN)
                          const question = getQuestionById(
                            resultItem.questionId
                          );

                          if (!question) return null;

                          const selectedOptionId = resultItem.selectedOptionId;

                          // Lấy đáp án đúng
                          const correctOptionId =
                            resultItem.correctOptionId ||
                            question.correctOptionId;

                          return (
                            <div
                              key={resultItem.questionId}
                              className={`card mb-4 shadow-sm ${
                                resultItem.correct
                                  ? "border-success"
                                  : "border-danger"
                              }`}
                            >
                              <div className="card-body p-3">
                                <h6 className="card-title fw-bold d-flex justify-content-between align-items-center">
                                  {/* HIỂN THỊ THỨ TỰ TRỘN */}
                                  {index + 1}. {question.questionText}
                                  {/* HIỂN THỊ KẾT QUẢ CUỐI CÙNG Ở ĐÂY */}
                                  <span
                                    className={`badge text-white ms-3 ${
                                      resultItem.correct
                                        ? "bg-success"
                                        : "bg-danger"
                                    }`}
                                  >
                                    {resultItem.correct ? "Đúng" : "Sai"}
                                  </span>
                                </h6>
                                <hr className="my-2" />

                                {/* OPTIONS Ở ĐÂY ĐÃ ĐƯỢC TRỘN THEO BÀI LÀM */}
                                <div className="d-grid gap-2 mt-3">
                                  {question.options.map((option) => {
                                    const isSelected =
                                      option.optionId === selectedOptionId;
                                    const isCorrect =
                                      option.optionId === correctOptionId;

                                    let optionClass = "bg-light";
                                    let badgeText = "";
                                    let badgeBg = "";

                                    if (isCorrect) {
                                      optionClass =
                                        "bg-success-subtle border-success text-dark";
                                      badgeText = "Đáp án đúng";
                                      badgeBg = "bg-info";

                                      if (isSelected) {
                                        badgeText = "Bạn chọn (Đúng)";
                                        optionClass =
                                          "bg-success text-white border-success fw-bold";
                                        badgeBg = "bg-success";
                                      }
                                    } else if (isSelected && !isCorrect) {
                                      optionClass =
                                        "bg-primary-subtle border-primary text-dark"; // nền xanh nhạt, viền xanh
                                      badgeText = "Đáp án bạn chọn";
                                      badgeBg = "bg-primary";
                                    }

                                    return (
                                      <div
                                        key={option.optionId}
                                        className={`p-2 rounded d-flex justify-content-between align-items-center border ${optionClass}`}
                                        style={{ transition: "all 0.2s" }}
                                      >
                                        <span
                                          className={
                                            optionClass.includes("text-white")
                                              ? "text-white fw-medium"
                                              : "text-dark fw-medium"
                                          }
                                        >
                                          {option.optionText}
                                        </span>
                                        {badgeText && (
                                          <span
                                            className={`badge ${badgeBg} text-white ms-2`}
                                          >
                                            {badgeText}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>{" "}
                      {/* Kết thúc div scrollable */}
                      <div className="d-flex justify-content-end gap-3 mt-4">
                        <button
                          className="btn btn-outline-secondary px-4"
                          onClick={() => setShowHistory(false)}
                        >
                          Quay lại kết quả
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!loading &&
                !resultData &&
                questionToRender &&
                questions.length > 0 && (
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
                      {questionToRender.questionText}
                    </h5>

                    <div className="row g-3">
                      {questionToRender.options.map((option) => {
                        const isSelected =
                          userAnswers[questionToRender.questionId] ===
                          option.optionId;

                        let btnClass =
                          "btn-outline-secondary bg-white text-dark";
                        if (isSelected) {
                          btnClass =
                            "btn-primary text-white shadow ring-2 ring-offset-1";
                        }

                        return (
                          <div
                            key={option.optionId}
                            className="col-12 col-md-6"
                          >
                            <button
                              className={`btn w-100 p-3 text-start fw-medium rounded-3 border ${btnClass}`}
                              onClick={() =>
                                handleSelectOption(
                                  questionToRender.questionId,
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
                                    borderColor: isSelected
                                      ? "white"
                                      : "#dee2e6",
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
