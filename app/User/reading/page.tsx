// app/User/reading/page.tsx (Sử dụng Bootstrap Grid, Tông màu Xanh Lam Đậm)
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/app/services/api";
import ReadingTopicCard from "@/app/components/TopicCard/readingpage";
import { Main } from "next/document";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
// Định nghĩa màu Xanh Lam Đậm chủ đạo
const READING_COLOR = "#446acbff";

// Dữ liệu giả định (Giữ nguyên)
const mockReadingTopics = [
  {
    id: 1,
    name: "Short text comprehension",
    description: "TRAVEL BROCHURE",
    level: "A1",
    imageUrl: "/images/reading/travel.jpg",
  },
  {
    id: 2,
    name: "Understanding an email",
    description: "AN EMAIL FROM A FRIEND",
    level: "A1",
    imageUrl: "/images/reading/email.jpg",
  },
];

export default function ReadingPage() {
  const searchParams = useSearchParams();
  const skill = searchParams.get("skill") || "Reading";
  const level = searchParams.get("level") || "A1";
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const levelMap: Record<string, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6,
  };

  useEffect(() => {
    if (!skill || !level) return;
    const levelNumber = levelMap[level];
    if (!levelNumber) return;
    setLoading(true);
    api
      .get(`/admin/topic/get-by-skill-level/${skill}/${levelNumber}`)
      .then((res) => {
        setTopics(res.data);
      })
      .catch((err) => {
        console.error("API Error:", err);
      })
      .finally(() => setLoading(false));
  }, [skill, level]);

  return (
    <>
      <MainHeader />
      <div
        style={{
          marginTop: "4%",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        {/* Tiêu đề chính (Màu XANH LAM ĐẬM chủ đạo) */}
        <div className="py-3 shadow" style={{ backgroundColor: READING_COLOR }}>
          <div className="container">
            <h1
              className="text-center m-0 text-uppercase"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bolder",
                color: "white",
              }}
            >
              {level} READING TESTS
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-bottom shadow-sm">
          <div className="container">
            <nav className="py-2" aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
                <li className="breadcrumb-item text-secondary">Reading</li>
                <li
                  className="breadcrumb-item active"
                  style={{ color: READING_COLOR, fontWeight: "bold" }}
                  aria-current="page"
                >
                  {level} Reading Tests
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Nội dung chính: Grid các bài kiểm tra */}
        <div className="container py-4">
          {loading ? (
            <p
              className="text-center"
              style={{ color: READING_COLOR, fontSize: "1.25rem" }}
            >
              Đang tải...
            </p>
          ) : topics.length === 0 ? (
            <p className="text-center text-secondary fs-5">
              Không có bài kiểm tra nào.
            </p>
          ) : (
            // Bố cục 3 cột cố định (row-cols-3)
            <div className="row row-cols-3 g-4">
              {topics.map((t) => (
                <div key={t.id} className="col">
                  <ReadingTopicCard
                    id={t.id}
                    name={t.name}
                    description={t.description || "Topic Name"}
                    level={level}
                    imageUrl={t.imageUrl}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MainFooter />
    </>
  );
}
