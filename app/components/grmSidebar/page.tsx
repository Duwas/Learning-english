"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface GrmSidebarProps {
  data: GrmTopicData[];
}
export interface GrmTopicData {
  topic_id: number;
  topic_name: string;
}

const SingleGrmTopic = ({
  topic,
  activePartId,
}: {
  topic: GrmTopicData;
  activePartId: string | null;
}) => {
  const isActive = activePartId === String(topic.topic_id);

  return (
    <div
      className={`topic-item ${isActive ? "active" : ""}`}
      style={{
        marginBottom: "4px",
      }}
    >
      <Link
        href={`?part=${topic.topic_id}`}
        className="topic-link"
        style={{
          display: "block",
          padding: "12px 18px",
          fontWeight: 600,
          textDecoration: "none",
          transition: "0.25s",
          backgroundColor: isActive ? "#fff3cd" : "#fff",
          color: isActive ? "#856404" : "#0d6efd",
          borderLeft: isActive ? "4px solid #ffc107" : "4px solid transparent",
          boxShadow: isActive ? "0 3px 6px rgba(0,0,0,0.2)" : "none",
        }}
      >
        {topic.topic_name}
      </Link>

      <style jsx>{`
        .topic-link:hover {
          background-color: #f8f9fa !important;
        }

        .topic-item.active .topic-link:hover {
          background-color: #fff3cd !important;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default function GrmSidebar({ data }: GrmSidebarProps) {
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
        position: "sticky",
        top: "100px",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        paddingRight: "5px",
      }}
    >
      {data.map((topic) => (
        <SingleGrmTopic
          key={topic.topic_id}
          topic={topic}
          activePartId={activePartId}
        />
      ))}

      <style jsx>{`
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
