"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons";
export type PartItem = number | { id: number; title: string };

export interface TopicData {
  topic_id: number;
  topic_name: string;
  group_words: PartItem[];
}

interface PartSidebarProps {
  data: TopicData[];
}

const SingleTopic = ({
  topic,
  activePartId,
}: {
  topic: TopicData;
  activePartId: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <div
        className="d-flex align-items-center p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: "pointer",
          userSelect: "none",
          backgroundColor: "#fff",
          gap: "40px",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            color: "#0d6efd",
            textTransform: "uppercase",
          }}
        >
          {topic.topic_name}
        </span>
        <span
          style={{ fontSize: "12px", color: "#6c757d", marginLeft: "auto" }}
        >
          {isOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </span>
      </div>

      {isOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            paddingLeft: "10px",
            marginLeft: "10px",
            borderLeft: "2px solid #d1ceceff",
            marginTop: "5px",
          }}
        >
          {topic.group_words.map((part, index) => {
            let id: number;
            let displayLabel: string;

            if (typeof part === "number") {
              id = part;
              displayLabel = `Part ${id}`;
            } else {
              id = part.id;
              displayLabel = `Part ${id}: ${part.title}`;
            }

            const isActive = activePartId === id.toString();

            return (
              <Link
                key={id}
                href={`?part=${id}`}
                className="part-item"
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "8px 20px",
                  borderRadius: "50px",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",

                  backgroundColor: isActive ? "#fff3cd" : "transparent",
                  color: isActive ? "#856404" : "#495057",
                  fontWeight: isActive ? "700" : "500",
                  boxShadow: isActive ? "0 4px 6px rgba(0,0,0,5)" : "none",
                  borderLeft: isActive
                    ? "4px solid #ffc107"
                    : "4px solid transparent",
                  transform: isActive ? "translateX(5px)" : "none",
                }}
              >
                {displayLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function PartSidebar({ data }: PartSidebarProps) {
  const searchParams = useSearchParams();
  const activePartId = searchParams.get("part");

  return (
    <div
      className="sidebar-scroll-container"
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
        padding: "15px",
        border: "1px solid #eee",

        top: "100px",
        maxHeight: "calc(100vh )",
        overflowY: "auto",
        paddingRight: "5px",
      }}
    >
      {data.map((topic) => (
        <SingleTopic
          key={topic.topic_id}
          topic={topic}
          activePartId={activePartId}
        />
      ))}

      <style jsx>{`
        .part-item:hover {
          background-color: #f8f9fa !important;
        }
        .part-item[style*="background-color: #ffc107"]:hover {
          background-color: #ffc107 !important;
          opacity: 0.9;
        }

        .sidebar-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .sidebar-scroll-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .sidebar-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
