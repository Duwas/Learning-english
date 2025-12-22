// app/User/writing/page.tsx (Sử dụng Bootstrap Grid, Tông màu Tím)
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/app/services/api";
import WritingTopicCard from "@/app/components/TopicCard/writingpage";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
const WRITING_COLOR = "#52c41a";

const mockWritingTopics = [
  {
    id: 1,
    name: "Writing a short email",
    description: "EMAIL FOR AN APPOINTMENT",
    level: "A1",
    imageUrl: "/images/writing/email_short.jpg",
  },
  // ...
];

export default function WritingPage() {
  const searchParams = useSearchParams();
  const skill = searchParams.get("skill") || "Writing";
  const level = searchParams.get("level") || "A1";

  // *** SỬA LỖI 1: Khởi tạo topics là mảng rỗng và loading = true ***
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
    // Logic gọi API cho Writing
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
          marginTop: "80px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <div className="py-3 shadow" style={{ backgroundColor: WRITING_COLOR }}>
          <div className="container">
            <h1
              className="text-center m-0 text-uppercase"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bolder",
                color: "white",
              }}
            >
              {level} WRITING TESTS
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-bottom shadow-sm">
          <div className="container">
            <nav className="py-2" aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
                <li className="breadcrumb-item text-secondary">Writing</li>
                <li
                  className="breadcrumb-item active"
                  style={{ color: WRITING_COLOR, fontWeight: "bold" }}
                  aria-current="page"
                >
                  {level} WRITING TESTS
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
              style={{ color: WRITING_COLOR, fontSize: "1.25rem" }}
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
                  <WritingTopicCard
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
