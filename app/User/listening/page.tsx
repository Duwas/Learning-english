// app/listen/page.tsx (Sử dụng Bootstrap Grid)
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/app/services/api";
import TopicCard from "@/app/components/TopicCard/listenpage";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";

// Dữ liệu giả định để hiển thị UI
const mockTopics = [
{
  
}
];

export default function ListenPage() {
  const searchParams = useSearchParams();
  const skill = searchParams.get("skill") || "Listening";
  const level = searchParams.get("level") || "A1";
  const [topics, setTopics] = useState<any[]>(mockTopics);
  const [loading, setLoading] = useState(false);
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
        // Cập nhật topics bằng dữ liệu thực từ API
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
        {/* Tiêu đề chính (Màu vàng của ảnh mẫu) */}
        <div className="bg-warning py-3 shadow">
          <div className="container">
            <h1
              className="text-center m-0 text-uppercase"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bolder",
                color: "#f5ededff",
              }}
            >
              {level} LISTENING TESTS
            </h1>
          </div>
        </div>
        <div className="bg-white border-bottom shadow-sm">
          <div className="container">
            <nav className="py-2" aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
                <li className="breadcrumb-item text-secondary">Listening</li>
                <li
                  className="breadcrumb-item active"
                  style={{ color: "#f5ededff", fontWeight: "bold" }}
                  aria-current="page"
                >
                  {level} Listening Tests
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Nội dung chính: Grid các bài kiểm tra */}
        <div className="container py-4">
          {loading ? (
            <p className="text-center text-primary fs-5">Đang tải...</p>
          ) : topics.length === 0 ? (
            <p className="text-center text-secondary fs-5">
              Không có bài kiểm tra nào.
            </p>
          ) : (
            // Bố cục 3 cột cố định (row-cols-3)
            <div className="row row-cols-3 g-4">
              {topics.map((t) => (
                <div key={t.id} className="col">
                  <TopicCard
                    id={t.id}
                    name={t.name}
                    description={t.description || "Topic Name"}
                    level={level}
                    imageUrl={t.imageUrl} // Truyền dữ liệu ảnh từ API
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
