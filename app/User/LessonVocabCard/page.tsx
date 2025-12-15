"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PartSidebar, { TopicData } from "@/app/components/vocabSidebar/page";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
import FlashCard, { VocabCardData } from "@/app/components/flashcard/page";
import { useApi } from "@/app/hooks/useApi";
import { useToast } from "@/app/hooks/useToast";
import flashAPI from "@/app/services/api/flashAPI";
import { motion, AnimatePresence } from "framer-motion";
import QuizModal from "@/app/components/quiz/page"; 

export default function LearnPage() {
  const [data, setData] = useState<VocabCardData[]>([]);
  const [sidebarData, setSidebarData] = useState<TopicData[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);

  const { showToast } = useToast();
  const { callApi } = useApi(showToast);
  const searchParams = useSearchParams();

  const currentPart = searchParams.get("part")
    ? Number(searchParams.get("part"))
    : 1;

  // --- 1. API LẤY SIDEBAR (SỬA LỖI KIỂM TRA MẢNG) ---
  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const res = await flashAPI.getTreeVocabulary();
        
        const rawData = res.data || res;
        const treeData = Array.isArray(rawData) ? rawData : [];
        
        setSidebarData(treeData);
      } catch (error) {
        console.error("Lỗi lấy sidebar:", error);
        setSidebarData([]); 
      }
    };
    fetchSidebar();
  }, []);

  const getDataGroupWord = async (id: number) => {
    try {
      const res = await callApi(() => flashAPI.getGroupWord(id), true, true);
      setData(res || []);
    } catch (error) {
      console.error("Lỗi lấy bài học:", error);
      setData([]);
    }
  };

  useEffect(() => {
    if (currentPart) {
      getDataGroupWord(currentPart);
    }
  }, [currentPart]);

  // --- 3. TÌM TÊN TOPIC (SỬA LỖI SIDEBARDATA.FIND IS NOT A FUNCTION) ---
  const currentTopicName = useMemo(() => {
    // Kiểm tra nếu sidebarData chưa phải là mảng hoặc rỗng
    if (!Array.isArray(sidebarData) || sidebarData.length === 0) {
      return "Loading...";
    }

    const foundTopic = sidebarData.find((topic) => {
      // Kiểm tra kỹ group_words có phải mảng không trước khi .some
      if (!Array.isArray(topic.group_words)) return false;

      return topic.group_words.some((gw: any) => {
        const id = typeof gw === "number" ? gw : gw.id;
        return id === currentPart;
      });
    });

    if (foundTopic) return foundTopic.topic_name;
    
    // Nếu có dữ liệu nhưng không tìm thấy part, lấy tên topic đầu tiên làm mặc định
    return sidebarData[0]?.topic_name || "Unknown Topic";
  }, [currentPart, sidebarData]);

  return (
    <>
      <MainHeader />

      <div className="container py-4" style={{ marginTop: "50px" }}>
        
        {/* HEADER VỚI NÚT ÔN TẬP */}
        <div className="mb-4 border-bottom pb-2 d-flex justify-content-between align-items-center">
          <h5 className="text-primary fw-bold mb-0">
            <span className="text-muted fw-normal">Flashcard » </span>
            Topic: {currentTopicName}
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
            Ôn tập Part {currentPart}
          </button>
        </div>

        <div className="row align-items-start" style={{ marginTop: "-10px" }}>
          {/* SIDEBAR TRÁI */}
          <div className="col-md-3 mb-4">
            <PartSidebar data={sidebarData} />
          </div>

          {/* CONTENT PHẢI (FLASHCARD) */}
          <div className="col-md-9">
            <div
              className="card shadow-sm border-0"
              style={{
                minHeight: "500px",
                position: "sticky",
                top: "100px",
                zIndex: 1,
                overflow: "hidden",
              }}
            >
              <div className="card-body bg-light rounded pt-5">
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="w-100 d-flex justify-content-center"
                    style={{ marginBottom: "50px" }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPart}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <FlashCard data={data} imageUrl="/img/Vocab_FC.jpg" />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        groupId={currentPart}
        
      />

      <MainFooter />
    </>
  );
}