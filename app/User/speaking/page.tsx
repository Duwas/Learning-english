// app/User/speak/page.tsx (Sử dụng dữ liệu API)
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/app/services/api";
import SpeakingTopicCard from "@/app/components/TopicCard/speakingpage";
import "../../globals.css";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
const SPEAKING_COLOR = "#ff6b81";
const mockSpeakingTopics = [
  // Giữ lại mock data để tham chiếu, nhưng setTopics ban đầu sẽ là []
  {
    id: 1,
    name: "Introduce yourself",
    description: "INTRODUCING YOURSELF",
    level: "A1",
    imageUrl: "/images/speaking/intro.jpg",
  },
  {
    id: 2,
    name: "Daily routine speaking",
    description: "YOUR DAILY ROUTINE",
    level: "A1",
    imageUrl: "/images/speaking/routine.jpg",
  },
  {
    id: 3,
    name: "Talking about Hobbies",
    description: "HOBBIES AND FREE TIME",
    level: "A1",
    imageUrl: "/images/speaking/hobbies.jpg",
  },
];

export default function SpeakPage() {
  const searchParams = useSearchParams();
  const skill = searchParams.get("skill") || "Speaking";
  const level = searchParams.get("level") || "A1";

  // *** SỬA: Bắt đầu với mảng rỗng [] để đợi dữ liệu API ***
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
      .catch((err) => console.error("API Error:", err))
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
        <div
          className="py-3 shadow"
          style={{ backgroundColor: SPEAKING_COLOR }}
        >
          <div className="container">
            <h1
              className="text-center m-0 text-uppercase"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bolder",
                color: "white",
              }}
            >
              {level} SPEAKING TESTS
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-bottom shadow-sm">
          <div className="container">
            <nav className="py-2" aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
                {/* Sửa lại màu chữ thành màu xám đậm (Bootstrap default) */}
                <li className="breadcrumb-item" style={{ color: "#6c757d" }}>
                  Speaking
                </li>

                {/* MỤC ACTIVE (Nền Hồng) */}
                <li
                  className="breadcrumb-item active" // Giữ lại class active của Bootstrap
                  // Áp dụng style màu hồng cho nền của chữ và màu chữ trắng (như trong tiêu đề chính)
                  style={{
                    backgroundColor: SPEAKING_COLOR,
                    color: "white",
                    fontWeight: "bold",
                    padding: "0 5px",
                  }}
                  aria-current="page"
                >
                  {level} Speaking Tests
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
              style={{ color: SPEAKING_COLOR, fontSize: "1.25rem" }}
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
                  <SpeakingTopicCard
                    id={t.id}
                    name={t.name}
                    description={t.description || "Topic Name"}
                    level={level}
                    imageUrl={t.imageUrl} // Dùng ảnh từ API
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
