"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import GrmSidebar, { GrmTopicData } from "@/app/components/grmSidebar/page";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
import grammarAPI from "@/app/services/api/TreeGrmAPI";
import { useApi } from "@/app/hooks/useApi";
import { useToast } from "@/app/hooks/useToast";
import QuizModal from "@/app/components/quiz/page";
import ProtectedRoute from "@/app/routes/ProtectedRoute";
import axios from "axios";

interface LessonItem {
  id: number;
  title: string;
  structure: string;
  explanation: string;
  example: string;
  tip: string;
  imageUrl: string;
}

export default function GrammarLearnPage() {
  const { showToast } = useToast();
  const { callApi } = useApi(showToast);
  const searchParams = useSearchParams();
  const [showQuiz, setShowQuiz] = useState(false);

  const currentCategoryId = searchParams.get("part")
    ? Number(searchParams.get("part"))
    : 28;

  // --- STATE ---
  const [sidebarData, setSidebarData] = useState<GrmTopicData[]>([]);
  const [categoryLessons, setCategoryLessons] = useState<LessonItem[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);

  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        setLoadingSidebar(true);
        const res = await callApi(
          () => grammarAPI.getTreeGrammar(),
          true,
          true
        );

        console.log(res);

        // Kiểm tra an toàn dữ liệu trả về
        const rawData = res.data || res;
        const safeData = Array.isArray(rawData) ? rawData : [];

        const mappedData: GrmTopicData[] = safeData.map((group: any) => ({
          topic_id: group.topic_id,
          topic_name: group.topic_name,
        }));

        setSidebarData(mappedData);
      } catch (error) {
        console.error("Lỗi lấy sidebar:", error);
        setSidebarData([]);
      } finally {
        setLoadingSidebar(false);
      }
    };

    fetchSidebar();
  }, []);
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoadingLessons(true);
        const res = await callApi(
          () => grammarAPI.getGrammarByCategory(currentCategoryId),
          true,
          true
        );

        // Kiểm tra an toàn dữ liệu trả về
        const rawData = res.data || res;
        const safeData = Array.isArray(rawData) ? rawData : [];
        console.log(res);
        setCategoryLessons(safeData);

        if (safeData.length > 0) {
          setActiveLessonId(safeData[0].id);
        } else {
          setActiveLessonId(null);
        }
      } catch (error) {
        console.error("Lỗi lấy bài học:", error);
        setCategoryLessons([]);
        setActiveLessonId(null);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, [currentCategoryId]);

  // Tìm bài học đang active (FIX LỖI FIND)
  const currentLesson = useMemo(() => {
    if (!Array.isArray(categoryLessons)) return undefined;
    return categoryLessons.find((item) => item.id === activeLessonId);
  }, [categoryLessons, activeLessonId]);

  // Logic hiển thị Breadcrumb
  const { topicName, categoryTitle } = useMemo(() => {
    if (!Array.isArray(sidebarData))
      return { topicName: "", categoryTitle: "" };
    return { topicName: "", categoryTitle: "" };
  }, [currentCategoryId, sidebarData]);

  return (
    <>
      <ProtectedRoute>
        <MainHeader />
        <div className="container py-4" style={{ marginTop: "80px" }}>
          {/* === BREADCRUMB === */}
          <div className="mb-4 border-bottom pb-2 d-flex justify-content-between align-items-center">
            <h5 className="text-primary fw-bold">
              <span className="text-muted fw-normal">Grammar » </span>
              {loadingSidebar ? "Đang tải..." : categoryTitle || "Danh mục"}
            </h5>
            <button
              onClick={() => setShowQuiz(true)}
              className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
              style={{
                backgroundColor: "#0d6efd",
                border: "none",
                transition: "transform 0.2s",
              }}
            >
              Ôn tập
            </button>
          </div>

          <div className="row" style={{ marginTop: "-20px" }}>
            {/* === LEFT SIDEBAR === */}
            <div className="col-md-3 mb-4">
              {loadingSidebar ? (
                <div className="text-center py-4 text-muted">
                  <div className="spinner-border spinner-border-sm me-2"></div>{" "}
                  Đang tải menu...
                </div>
              ) : (
                <GrmSidebar data={sidebarData} />
              )}
            </div>

            {/* === MAIN CONTENT === */}
            <div className="col-md-9">
              <div
                className="card shadow-sm border-0"
                style={{ minHeight: "500px" }}
              >
                <div className="card-body bg-white rounded p-4">
                  {loadingLessons ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5">
                      <div
                        className="spinner-border text-primary"
                        style={{ width: "3rem", height: "3rem" }}
                      ></div>
                      <p className="mt-3 text-muted">Đang tải bài học...</p>
                    </div>
                  ) : categoryLessons.length > 0 ? (
                    <>
                      {/* --- TAB NAVIGATION (MENU CON) --- */}
                      <ul
                        className="nav nav-pills mb-4 gap-2"
                        style={{ overflowX: "auto", flexWrap: "nowrap" }}
                      >
                        {categoryLessons.map((lesson) => (
                          <li key={lesson.id} className="nav-item">
                            <button
                              className={`nav-link border ${
                                activeLessonId === lesson.id
                                  ? "active"
                                  : "bg-light text-dark"
                              }`}
                              onClick={() => setActiveLessonId(lesson.id)}
                              style={{
                                whiteSpace: "nowrap",
                                borderRadius: "20px",
                                fontWeight: "500",
                                backgroundColor:
                                  activeLessonId === lesson.id
                                    ? "#4dabf7"
                                    : undefined,
                                borderColor:
                                  activeLessonId === lesson.id
                                    ? "#4dabf7"
                                    : undefined,
                              }}
                            >
                              {lesson.title.split("(")[0].trim()}
                            </button>
                          </li>
                        ))}
                      </ul>

                      {/* --- NỘI DUNG BÀI HỌC --- */}
                      {currentLesson && (
                        <div className="grammar-lesson fade-in">
                          <h2 className="text-primary fw-bold mb-4 border-bottom pb-2">
                            {currentLesson.title}
                          </h2>

                          {/* 1. Định nghĩa */}
                          {currentLesson.explanation && (
                            <div className="mb-4">
                              <h5 className="fw-bold text-dark mb-2">
                                <i className="bi bi-book me-2"></i>1. Định nghĩa
                                & Cách dùng
                              </h5>
                              <p
                                className="text-secondary"
                                style={{
                                  fontSize: "1.05rem",
                                  lineHeight: "1.6",
                                  textAlign: "justify",
                                }}
                              >
                                {currentLesson.explanation}
                              </p>
                            </div>
                          )}

                          {/* 2. Cấu trúc */}
                          {currentLesson.structure && (
                            <div className="mb-4">
                              <h5 className="fw-bold text-dark mb-2">
                                <i className="bi bi-gear me-2"></i>2. Cấu trúc
                                (Structure)
                              </h5>
                              <div
                                className="p-3 rounded"
                                style={{
                                  backgroundColor: "#fff5f5",
                                  borderLeft: "5px solid #dc3545",
                                }}
                              >
                                <pre
                                  className="mb-0 fw-bold text-danger"
                                  style={{
                                    fontFamily: "inherit",
                                    fontSize: "1.1rem",
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  {currentLesson.structure}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* 3. Ví dụ */}
                          {currentLesson.example && (
                            <div className="mb-4">
                              <h5 className="fw-bold text-dark mb-2">
                                <i className="bi bi-chat-dots me-2"></i>3. Ví dụ
                                minh họa
                              </h5>
                              <div
                                className="alert alert-primary border-0 shadow-sm"
                                style={{ backgroundColor: "#e7f1ff" }}
                              >
                                <pre
                                  className="mb-0 text-dark"
                                  style={{
                                    fontFamily: "inherit",
                                    whiteSpace: "pre-line",
                                    fontSize: "1rem",
                                  }}
                                >
                                  {currentLesson.example}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* 4. Mẹo */}
                          {currentLesson.tip && (
                            <div className="mb-4">
                              <h5 className="fw-bold text-dark mb-2">
                                <i className="bi bi-lightbulb me-2 text-warning"></i>
                                Mẹo ghi nhớ
                              </h5>
                              <div className="alert alert-warning border-0 shadow-sm">
                                <pre
                                  className="mb-0 text-dark"
                                  style={{
                                    fontFamily: "inherit",
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  {currentLesson.tip}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* 5. Hình ảnh */}
                          {currentLesson.imageUrl && (
                            <div className="text-center mt-4">
                              <img
                                src={currentLesson.imageUrl}
                                alt={currentLesson.title}
                                className="img-fluid rounded shadow"
                                style={{
                                  maxHeight: "400px",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center py-5">
                      <div
                        className="text-muted mb-3"
                        style={{ fontSize: "3rem" }}
                      >
                        📂
                      </div>
                      <h4 className="text-muted">Chưa có bài học nào</h4>
                      <p>Nội dung đang được cập nhật cho danh mục này.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <QuizModal
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          groupId={-1}
          grammarId={currentCategoryId}
        />

        <MainFooter />
      </ProtectedRoute>
    </>
  );
}
